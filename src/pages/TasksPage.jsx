import { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';

const emptyTask = {
  name: '',
  subject: '',
  deadline: '',
  estimatedDuration: 30,
};

function TasksPage() {
  const { state, actions } = useAppContext();
  const [subjectInput, setSubjectInput] = useState('');
  const [taskForm, setTaskForm] = useState({ ...emptyTask, subject: state.subjects[0] || '' });

  const groupedTasks = useMemo(() => {
    return state.subjects.reduce((acc, subject) => {
      acc[subject] = state.tasks.filter((task) => task.subject === subject);
      return acc;
    }, {});
  }, [state.subjects, state.tasks]);

  const handleAddTask = (event) => {
    event.preventDefault();
    if (!taskForm.name.trim() || !taskForm.subject) return;
    actions.addTask(taskForm);
    setTaskForm({ ...emptyTask, subject: taskForm.subject });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
      <section className="space-y-4">
        <div className="glass-panel p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-100">Subjects</h2>
          <div className="mb-3 flex gap-2">
            <input
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              placeholder="Add subject"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                actions.addSubject(subjectInput);
                setSubjectInput('');
              }}
              className="rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {state.subjects.map((subject) => (
              <li key={subject} className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-sm">
                <span>{subject}</span>
                <button
                  type="button"
                  onClick={() => actions.removeSubject(subject)}
                  className="text-xs text-rose-300 hover:text-rose-200"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-100">Create Task</h2>
          <form onSubmit={handleAddTask} className="space-y-3">
            <input
              required
              value={taskForm.name}
              onChange={(e) => setTaskForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Task name"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            />
            <select
              value={taskForm.subject}
              onChange={(e) => setTaskForm((prev) => ({ ...prev, subject: e.target.value }))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            >
              {state.subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={taskForm.deadline}
              onChange={(e) => setTaskForm((prev) => ({ ...prev, deadline: e.target.value }))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="1"
              value={taskForm.estimatedDuration}
              onChange={(e) => setTaskForm((prev) => ({ ...prev, estimatedDuration: e.target.value }))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              placeholder="Estimated duration (minutes)"
            />
            <button type="submit" className="w-full rounded-lg bg-cyan-500/20 px-3 py-2 text-sm text-cyan-200">
              Add Task
            </button>
          </form>
        </div>
      </section>

      <section className="glass-panel p-4">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">Tasks by Subject</h2>
        <div className="space-y-4">
          {state.subjects.map((subject) => (
            <div key={subject} className="rounded-xl bg-slate-800/50 p-3">
              <h3 className="mb-2 text-sm font-semibold text-emerald-200">{subject}</h3>
              <ul className="space-y-2">
                {groupedTasks[subject]?.length === 0 && (
                  <li className="text-xs text-slate-400">No tasks yet.</li>
                )}
                {groupedTasks[subject]?.map((task) => (
                  <li key={task.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-900/70 px-3 py-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => actions.toggleTaskComplete(task.id)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-800"
                      />
                      <span className={task.completed ? 'line-through text-slate-500' : 'text-slate-100'}>
                        {task.name}
                      </span>
                    </label>
                    <div className="text-right text-xs text-slate-400">
                      <p>{task.deadline ? `Due: ${task.deadline}` : 'No deadline'}</p>
                      <p>{task.estimatedDuration} min</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default TasksPage;
