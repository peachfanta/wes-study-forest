import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_DAILY_GOAL_MINUTES,
  FOREST_STAGES,
  XP_DAILY_GOAL_COMPLETION,
  XP_PER_COMPLETED_TASK,
  XP_PER_STUDY_MINUTE,
} from '../utils/constants';

const STORAGE_KEY = 'study-forest-app-v1';

const initialState = {
  totalXp: 0,
  totalStudyMinutes: 0,
  tasksCompleted: 0,
  subjects: ['Mathematics', 'Science', 'History'],
  tasks: [],
  sessions: [],
  dailyGoalMinutes: DEFAULT_DAILY_GOAL_MINUTES,
  dailyGoalBonusDate: null,
  spotifyToken: '',
  spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DX8NTLI2TtZa6',
  timer: {
    mode: 'idle',
    durationSeconds: 1500,
    remainingSeconds: 1500,
    endAt: null,
    selectedTaskId: '',
  },
};

const AppContext = createContext(null);

const toLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const todayKey = () => toLocalDateKey(new Date());

const levelFromXp = (xp) => Math.floor(xp / 500) + 1;

const getCurrentStage = (totalXp) => {
  for (let i = FOREST_STAGES.length - 1; i >= 0; i -= 1) {
    if (totalXp >= FOREST_STAGES[i].xp) {
      return FOREST_STAGES[i];
    }
  }
  return FOREST_STAGES[0];
};

const getNextStage = (totalXp) => FOREST_STAGES.find((stage) => stage.xp > totalXp) ?? null;

const clampRemaining = (endAt) => Math.max(0, Math.ceil((endAt - Date.now()) / 1000));

const applyStudySession = (prevState, durationSeconds, selectedTaskId, completeTimer = false) => {
  const minutes = Math.max(0, Math.round(durationSeconds / 60));
  const studyXp = minutes * XP_PER_STUDY_MINUTE;
  const nextTotalMinutes = prevState.totalStudyMinutes + minutes;
  const today = todayKey();
  const todayMinutes = prevState.sessions
    .filter((item) => item.date.slice(0, 10) === today)
    .reduce((sum, item) => sum + Math.round(item.durationSeconds / 60), 0);
  const nextTodayMinutes = todayMinutes + minutes;

  let bonus = 0;
  if (nextTodayMinutes >= prevState.dailyGoalMinutes && prevState.dailyGoalBonusDate !== today) {
    bonus = XP_DAILY_GOAL_COMPLETION;
  }

  const task = prevState.tasks.find((item) => item.id === selectedTaskId);

  return {
    ...prevState,
    sessions: [
      ...prevState.sessions,
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        taskId: selectedTaskId || null,
        subject: task?.subject || 'General',
        durationSeconds,
        xpEarned: studyXp + bonus,
      },
    ],
    totalStudyMinutes: nextTotalMinutes,
    totalXp: prevState.totalXp + studyXp + bonus,
    dailyGoalBonusDate: bonus > 0 ? today : prevState.dailyGoalBonusDate,
    timer: completeTimer
      ? {
          ...prevState.timer,
          mode: 'completed',
          remainingSeconds: 0,
          endAt: null,
        }
      : prevState.timer,
  };
};

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialState;

    try {
      const parsed = JSON.parse(stored);
      const merged = { ...initialState, ...parsed, timer: { ...initialState.timer, ...(parsed.timer || {}) } };

      if (merged.timer.mode === 'running' && merged.timer.endAt) {
        const remaining = clampRemaining(merged.timer.endAt);
        merged.timer.remainingSeconds = remaining;
        if (remaining <= 0) {
          return applyStudySession(merged, merged.timer.durationSeconds, merged.timer.selectedTaskId, true);
        }
      }

      return merged;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.timer.mode !== 'running' || !state.timer.endAt) return undefined;

    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.timer.mode !== 'running' || !prev.timer.endAt) return prev;

        const remaining = clampRemaining(prev.timer.endAt);
        if (remaining <= 0) {
          return applyStudySession(prev, prev.timer.durationSeconds, prev.timer.selectedTaskId, true);
        }

        if (remaining === prev.timer.remainingSeconds) return prev;

        return {
          ...prev,
          timer: {
            ...prev.timer,
            remainingSeconds: remaining,
          },
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.timer.mode, state.timer.endAt]);

  const addXp = (amount) => {
    setState((prev) => ({ ...prev, totalXp: prev.totalXp + amount }));
  };

  const addStudySession = (session) => {
    setState((prev) => applyStudySession(prev, session.durationSeconds, session.taskId || '', false));
  };

  const addSubject = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setState((prev) => {
      if (prev.subjects.includes(trimmed)) return prev;
      return { ...prev, subjects: [...prev.subjects, trimmed] };
    });
  };

  const removeSubject = (name) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((subject) => subject !== name),
      tasks: prev.tasks.filter((task) => task.subject !== name),
    }));
  };

  const addTask = (task) => {
    setState((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          id: crypto.randomUUID(),
          name: task.name,
          subject: task.subject,
          deadline: task.deadline,
          estimatedDuration: Number(task.estimatedDuration) || 0,
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  };

  const toggleTaskComplete = (taskId) => {
    setState((prev) => {
      let gained = 0;
      const nextTasks = prev.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const nextCompleted = !task.completed;
        if (!task.completed && nextCompleted) gained = XP_PER_COMPLETED_TASK;
        if (task.completed && !nextCompleted) gained = -XP_PER_COMPLETED_TASK;
        return { ...task, completed: nextCompleted };
      });

      const completedCount = nextTasks.filter((task) => task.completed).length;
      return {
        ...prev,
        tasks: nextTasks,
        totalXp: Math.max(0, prev.totalXp + gained),
        tasksCompleted: completedCount,
      };
    });
  };

  const setDailyGoalMinutes = (minutes) => {
    const parsed = Number(minutes);
    if (!Number.isFinite(parsed) || parsed < 1) return;
    setState((prev) => ({ ...prev, dailyGoalMinutes: Math.round(parsed) }));
  };

  const setSpotifyConfig = ({ token, playlist }) => {
    setState((prev) => ({
      ...prev,
      spotifyToken: token ?? prev.spotifyToken,
      spotifyPlaylist: playlist ?? prev.spotifyPlaylist,
    }));
  };

  const setTimerDurationMinutes = (minutes) => {
    const parsed = Number(minutes);
    if (!Number.isFinite(parsed) || parsed < 1) return;

    setState((prev) => {
      if (prev.timer.mode === 'running') return prev;
      const durationSeconds = Math.round(parsed * 60);
      return {
        ...prev,
        timer: {
          ...prev.timer,
          durationSeconds,
          remainingSeconds: durationSeconds,
          mode: 'idle',
          endAt: null,
        },
      };
    });
  };

  const setTimerTask = (taskId) => {
    setState((prev) => ({
      ...prev,
      timer: {
        ...prev.timer,
        selectedTaskId: taskId || '',
      },
    }));
  };

  const startTimer = () => {
    setState((prev) => {
      if (prev.timer.remainingSeconds <= 0) {
        const resetSeconds = prev.timer.durationSeconds;
        return {
          ...prev,
          timer: {
            ...prev.timer,
            mode: 'running',
            remainingSeconds: resetSeconds,
            endAt: Date.now() + resetSeconds * 1000,
          },
        };
      }

      if (prev.timer.mode === 'running') return prev;

      return {
        ...prev,
        timer: {
          ...prev.timer,
          mode: 'running',
          endAt: Date.now() + prev.timer.remainingSeconds * 1000,
        },
      };
    });
  };

  const pauseTimer = () => {
    setState((prev) => {
      if (prev.timer.mode !== 'running' || !prev.timer.endAt) return prev;

      return {
        ...prev,
        timer: {
          ...prev.timer,
          mode: 'paused',
          remainingSeconds: clampRemaining(prev.timer.endAt),
          endAt: null,
        },
      };
    });
  };

  const resetTimer = () => {
    setState((prev) => ({
      ...prev,
      timer: {
        ...prev.timer,
        mode: 'idle',
        remainingSeconds: prev.timer.durationSeconds,
        endAt: null,
      },
    }));
  };

  const todayMinutes = useMemo(() => {
    const today = todayKey();
    return state.sessions
      .filter((session) => session.date.slice(0, 10) === today)
      .reduce((sum, session) => sum + Math.round(session.durationSeconds / 60), 0);
  }, [state.sessions]);

  const level = useMemo(() => levelFromXp(state.totalXp), [state.totalXp]);
  const xpIntoLevel = state.totalXp % 500;
  const xpToNextLevel = 500 - xpIntoLevel;

  const currentStage = useMemo(() => getCurrentStage(state.totalXp), [state.totalXp]);
  const nextStage = useMemo(() => getNextStage(state.totalXp), [state.totalXp]);
  const stageProgress = useMemo(() => {
    if (!nextStage) return 1;
    const currentStageXp = currentStage.xp;
    const gap = nextStage.xp - currentStageXp;
    return Math.min(1, Math.max(0, (state.totalXp - currentStageXp) / gap));
  }, [state.totalXp, currentStage, nextStage]);

  const timerDurationMinutes = Math.max(1, Math.round(state.timer.durationSeconds / 60));
  const timerElapsedSeconds = Math.max(0, state.timer.durationSeconds - state.timer.remainingSeconds);
  const activeTimerTask = state.tasks.find((task) => task.id === state.timer.selectedTaskId) || null;

  const contextValue = {
    state,
    level,
    xpIntoLevel,
    xpToNextLevel,
    todayMinutes,
    currentStage,
    nextStage,
    stageProgress,
    timerDurationMinutes,
    timerElapsedSeconds,
    activeTimerTask,
    constants: {
      XP_PER_STUDY_MINUTE,
      XP_PER_COMPLETED_TASK,
      XP_DAILY_GOAL_COMPLETION,
    },
    actions: {
      addXp,
      addStudySession,
      addSubject,
      removeSubject,
      addTask,
      toggleTaskComplete,
      setDailyGoalMinutes,
      setSpotifyConfig,
      setTimerDurationMinutes,
      setTimerTask,
      startTimer,
      pauseTimer,
      resetTimer,
    },
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
