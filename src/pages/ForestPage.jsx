import { useState } from 'react';
import ForestScene from '../components/ForestScene';
import ProgressBar from '../components/ProgressBar';
import { useAppContext } from '../context/AppContext';
import { FOREST_STAGES } from '../utils/constants';

function ForestPage() {
  const { state, currentStage, nextStage, stageProgress } = useAppContext();
  const [previewXp, setPreviewXp] = useState(null);

  const displayXp = previewXp ?? state.totalXp;
  const previewMode = previewXp !== null;
  const liveStageIndex = FOREST_STAGES.findIndex((stage, index) => {
    const next = FOREST_STAGES[index + 1];
    return state.totalXp >= stage.xp && (!next || state.totalXp < next.xp);
  });
  const previewStageIndex = FOREST_STAGES.findIndex((stage, index) => {
    const next = FOREST_STAGES[index + 1];
    return displayXp >= stage.xp && (!next || displayXp < next.xp);
  });
  const displayCurrentStage = FOREST_STAGES.filter((stage) => displayXp >= stage.xp).slice(-1)[0] || FOREST_STAGES[0];
  const displayNextStage = FOREST_STAGES.find((stage) => stage.xp > displayXp) || null;
  const xpToNextStage = displayNextStage ? Math.max(0, displayNextStage.xp - displayXp) : 0;
  const previewStageProgress = (() => {
    if (!displayNextStage) return 1;
    const gap = displayNextStage.xp - displayCurrentStage.xp;
    return Math.min(1, Math.max(0, (displayXp - displayCurrentStage.xp) / gap));
  })();

  return (
    <div className="space-y-5">
      <div className="glass-panel p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-100">Stage Preview</h2>
          <button
            type="button"
            onClick={() => setPreviewXp(null)}
            className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs text-slate-100"
          >
            Use My Real XP
          </button>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>{`Stage ${previewMode ? previewStageIndex + 1 : liveStageIndex + 1}`}</span>
            <span>{`of ${FOREST_STAGES.length}`}</span>
          </div>
          <input
            type="range"
            min={0}
            max={FOREST_STAGES.length - 1}
            step={1}
            value={previewMode ? previewStageIndex : liveStageIndex}
            onChange={(event) => {
              const index = Number(event.target.value);
              setPreviewXp(FOREST_STAGES[index].xp);
            }}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-400"
          />
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">{FOREST_STAGES[0].name}</span>
            <span className="text-emerald-200">{(previewMode ? displayCurrentStage : FOREST_STAGES[liveStageIndex]).name}</span>
            <span className="text-slate-500">{FOREST_STAGES[FOREST_STAGES.length - 1].name}</span>
          </div>
        </div>
      </div>

      <ForestScene totalXp={displayXp} fullScreen />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Current Stage</p>
          <p className="mt-2 text-xl font-semibold text-emerald-200">{previewMode ? displayCurrentStage.name : currentStage.name}</p>
        </div>
        <div className="glass-panel p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {previewMode ? 'Preview XP' : 'Forest XP'}
          </p>
          <p className="mt-2 text-xl font-semibold text-cyan-200">{displayXp} XP</p>
        </div>
        <div className="glass-panel p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Next Stage</p>
          <p className="mt-2 text-xl font-semibold text-slate-100">
            {(previewMode ? displayNextStage?.name : nextStage?.name) || 'Max Stage Reached'}
          </p>
          {(previewMode ? displayNextStage : nextStage) && (
            <p className="mt-1 text-sm text-slate-400">{xpToNextStage} XP remaining</p>
          )}
        </div>
      </div>

      <ProgressBar
        label="Progress to next forest stage"
        value={(previewMode ? previewStageProgress : stageProgress) * 100}
        max={100}
        subtitle={previewMode ? `${Math.round(previewStageProgress * 100)}% (preview)` : `${Math.round(stageProgress * 100)}%`}
        color="emerald"
      />
    </div>
  );
}

export default ForestPage;
