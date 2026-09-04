import React from 'react';
import { System } from '../types';
import { calculateSystemProgress, getActiveActionsCount } from '../storage';
import { PlusCircle, ArrowRight, Layers, Trash2 } from 'lucide-react';

interface SystemsListProps {
  systems: System[];
  onSelectSystem: (systemId: string) => void;
  onBuildNewSystem: () => void;
  onDeleteSystem: (systemId: string, e: React.MouseEvent) => void;
}

export const SystemsList: React.FC<SystemsListProps> = ({
  systems,
  onSelectSystem,
  onBuildNewSystem,
  onDeleteSystem,
}) => {
  const activeSystems = systems.filter((s) => s.status === 'active');

  if (activeSystems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-sky-100/70 text-sky-800 flex items-center justify-center mx-auto mb-6">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
          You don't have a system yet.
        </h2>
        <p className="mt-3 text-stone-600 text-base leading-relaxed max-w-md mx-auto">
          Start with something you're trying to accomplish. We'll help you break it down.
        </p>
        <div className="mt-8">
          <button
            onClick={onBuildNewSystem}
            className="px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-base shadow-sm transition-all inline-flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Build my first system</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1
            id="my-systems-page-title"
            className="text-3xl font-bold tracking-tight text-stone-900 font-serif"
          >
            My Systems
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Repeatable workflows that turn your goals into continuous progress.
          </p>
        </div>

        <button
          id="systems-build-new-btn"
          onClick={onBuildNewSystem}
          className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium shadow-xs transition-colors flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Build a System</span>
        </button>
      </div>

      {/* Systems Cards List */}
      <div className="space-y-4">
        {activeSystems.map((system) => {
          const progress = calculateSystemProgress(system);
          const activeActions = getActiveActionsCount(system);
          const stagesCount = system.stages.length;

          return (
            <div
              key={system.id}
              id={`system-card-${system.id}`}
              onClick={() => onSelectSystem(system.id)}
              className="group cursor-pointer bg-white rounded-2xl border border-stone-200/90 hover:border-sky-300 p-6 shadow-xs hover:shadow-md transition-all relative"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Category badge */}
                  <div className="text-xs font-semibold uppercase tracking-wider text-sky-800 mb-1">
                    {system.category || 'General'}
                  </div>

                  {/* System Title */}
                  <h2 className="text-xl font-bold text-stone-900 group-hover:text-sky-900 transition-colors">
                    {system.title}
                  </h2>

                  {/* Meta stats: 4 stages · 12 active actions */}
                  <p className="mt-1.5 text-xs text-stone-500 font-medium">
                    {stagesCount} stages · {activeActions} active actions
                  </p>
                </div>

                {/* Arrow Icon & Delete Option */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => onDeleteSystem(system.id, e)}
                    title="Delete system"
                    className="opacity-0 group-hover:opacity-100 p-2 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-sky-100 group-hover:text-sky-900 flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Sequential Flow Tags */}
              <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-1.5 text-xs">
                {system.stages.map((stg, i) => (
                  <React.Fragment key={stg.id}>
                    <span className="px-2.5 py-1 rounded-md bg-stone-50 border border-stone-200/70 text-stone-700 font-medium">
                      {stg.name}
                    </span>
                    {i < system.stages.length - 1 && (
                      <span className="text-stone-300">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Progress Bar: System progress: 62% */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-medium text-stone-600 mb-1.5">
                  <span>System progress: {progress}%</span>
                  <span className="text-[11px] text-stone-600">
                    {progress === 100 ? 'Complete' : 'In progress'}
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progress === 100 ? 'bg-emerald-600' : 'bg-sky-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
