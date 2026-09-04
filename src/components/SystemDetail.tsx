import React, { useState } from 'react';
import { System, SystemAction, SystemStage, ActionRecurrence } from '../types';
import { calculateSystemProgress } from '../storage';
import {
  ArrowLeft,
  Check,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Repeat,
  ChevronDown,
  ChevronUp,
  Edit2,
  CheckCircle2,
} from 'lucide-react';

interface SystemDetailProps {
  system: System;
  onBack: () => void;
  onUpdateSystem: (updated: System) => void;
  onToggleAction: (systemId: string, actionId: string) => void;
}

export const SystemDetail: React.FC<SystemDetailProps> = ({
  system,
  onBack,
  onUpdateSystem,
  onToggleAction,
}) => {
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageNameInput, setStageNameInput] = useState('');

  // Add Action form state per stage
  const [activeAddActionStageId, setActiveAddActionStageId] = useState<string | null>(null);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionMinutes, setNewActionMinutes] = useState<number>(30);
  const [newActionDueDate, setNewActionDueDate] = useState<string>('');
  const [newActionRecurrence, setNewActionRecurrence] = useState<ActionRecurrence>('none');

  // Add Stage state
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newStageName, setNewStageName] = useState('');

  const progress = calculateSystemProgress(system);

  // Stage editing functions
  const handleStartEditStage = (stage: SystemStage) => {
    setEditingStageId(stage.id);
    setStageNameInput(stage.name);
  };

  const handleSaveStageName = (stageId: string) => {
    if (!stageNameInput.trim()) return;
    const updatedStages = system.stages.map((s) =>
      s.id === stageId ? { ...s, name: stageNameInput.trim() } : s
    );
    onUpdateSystem({ ...system, stages: updatedStages, updatedAt: new Date().toISOString() });
    setEditingStageId(null);
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= system.stages.length) return;

    const newStages = [...system.stages];
    const temp = newStages[index];
    newStages[index] = newStages[targetIndex];
    newStages[targetIndex] = temp;

    const reordered = newStages.map((s, idx) => ({ ...s, order: idx }));
    onUpdateSystem({ ...system, stages: reordered, updatedAt: new Date().toISOString() });
  };

  const handleDeleteStage = (stageId: string) => {
    if (system.stages.length <= 1) {
      alert('A system must have at least one stage.');
      return;
    }
    if (!confirm('Delete this stage and all its actions?')) return;

    const newStages = system.stages
      .filter((s) => s.id !== stageId)
      .map((s, idx) => ({ ...s, order: idx }));
    onUpdateSystem({ ...system, stages: newStages, updatedAt: new Date().toISOString() });
  };

  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim()) return;

    const newStage: SystemStage = {
      id: `stage-${Date.now()}`,
      systemId: system.id,
      name: newStageName.trim(),
      order: system.stages.length,
      actions: [],
    };

    onUpdateSystem({
      ...system,
      stages: [...system.stages, newStage],
      updatedAt: new Date().toISOString(),
    });
    setNewStageName('');
    setIsAddingStage(false);
  };

  // Action manipulation functions
  const handleAddAction = (stageId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim()) return;

    const newAction: SystemAction = {
      id: `act-${Date.now()}`,
      stageId,
      systemId: system.id,
      title: newActionTitle.trim(),
      estimatedMinutes: Number(newActionMinutes) || 30,
      dueDate: newActionDueDate || undefined,
      recurrence: newActionRecurrence,
      completed: false,
      order: 999,
    };

    const updatedStages = system.stages.map((stage) => {
      if (stage.id === stageId) {
        return {
          ...stage,
          actions: [...stage.actions, { ...newAction, order: stage.actions.length }],
        };
      }
      return stage;
    });

    onUpdateSystem({ ...system, stages: updatedStages, updatedAt: new Date().toISOString() });

    // Reset inputs
    setNewActionTitle('');
    setNewActionMinutes(30);
    setNewActionDueDate('');
    setNewActionRecurrence('none');
    setActiveAddActionStageId(null);
  };

  const handleDeleteAction = (stageId: string, actionId: string) => {
    const updatedStages = system.stages.map((stage) => {
      if (stage.id === stageId) {
        return {
          ...stage,
          actions: stage.actions.filter((a) => a.id !== actionId),
        };
      }
      return stage;
    });
    onUpdateSystem({ ...system, stages: updatedStages, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24">
      {/* Top Back Nav */}
      <button
        id="system-detail-back-btn"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Systems</span>
      </button>

      {/* Header Info */}
      <div id="system-detail-header" className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs uppercase font-semibold tracking-wider text-sky-800">
            {system.category || 'Goal System'}
          </div>
          {system.timeframe && (
            <span className="text-xs text-stone-600 font-medium">
              Target: {system.timeframe}
            </span>
          )}
        </div>

        <h1
          id="system-detail-title"
          className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif mt-1"
        >
          {system.title}
        </h1>

        {system.why && (
          <p className="mt-2 text-sm text-stone-600 italic">
            «{system.why}»
          </p>
        )}

        {/* Progress Display */}
        <div className="mt-6 pt-6 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-2">
            <span>System progress: {progress}%</span>
            <span>{progress === 100 ? '100% Completed' : `${progress}% complete`}</span>
          </div>
          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress === 100 ? 'bg-emerald-600' : 'bg-sky-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Philosophy banner */}
      <div className="mb-8 text-center text-xs sm:text-sm text-stone-600 font-serif italic">
        «This is how I'm getting from where I am to where I want to be.»
      </div>

      {/* Stages Flow: Display system as a simple vertical workflow */}
      <div id="system-stages-flow" className="space-y-6">
        {system.stages.map((stage, stageIndex) => {
          const isCurrentActiveAdd = activeAddActionStageId === stage.id;
          const isEditingName = editingStageId === stage.id;
          const completedActionsCount = stage.actions.filter((a) => a.completed).length;
          const isStageComplete = stage.actions.length > 0 && completedActionsCount === stage.actions.length;

          return (
            <div key={stage.id} className="relative">
              {/* Vertical connecting arrow between stages */}
              {stageIndex > 0 && (
                <div className="flex justify-center -my-3 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-stone-100 border border-stone-300 text-stone-500 flex items-center justify-center text-xs font-bold shadow-xs">
                    ↓
                  </div>
                </div>
              )}

              <div
                id={`stage-card-${stage.id}`}
                className={`bg-white rounded-2xl border transition-all p-5 sm:p-6 shadow-xs ${
                  isStageComplete
                    ? 'border-emerald-200/80 bg-emerald-50/10'
                    : 'border-stone-200/90'
                }`}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5 flex-1">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-900 text-xs font-bold flex items-center justify-center shrink-0">
                      {stageIndex + 1}
                    </span>

                    {isEditingName ? (
                      <div className="flex items-center gap-2 flex-1 max-w-xs">
                        <input
                          type="text"
                          value={stageNameInput}
                          onChange={(e) => setStageNameInput(e.target.value)}
                          className="px-2.5 py-1 text-base font-bold text-stone-900 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 w-full"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveStageName(stage.id)}
                          className="px-2.5 py-1 bg-stone-900 text-white rounded-md text-xs font-medium"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-stone-900">
                          {stage.name}
                        </h2>
                        {isStageComplete && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Completed
                          </span>
                        )}
                        <button
                          onClick={() => handleStartEditStage(stage)}
                          className="text-stone-400 hover:text-stone-700 p-1 rounded"
                          title="Rename stage"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Stage Order & Delete Controls */}
                  <div className="flex items-center gap-1 text-stone-400">
                    <button
                      onClick={() => handleMoveStage(stageIndex, 'up')}
                      disabled={stageIndex === 0}
                      className="p-1 hover:text-stone-700 disabled:opacity-20 transition-colors"
                      title="Move stage up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveStage(stageIndex, 'down')}
                      disabled={stageIndex === system.stages.length - 1}
                      className="p-1 hover:text-stone-700 disabled:opacity-20 transition-colors"
                      title="Move stage down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStage(stage.id)}
                      className="p-1 hover:text-red-600 transition-colors ml-1"
                      title="Delete stage"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Actions Inside This Stage */}
                <div className="space-y-2.5">
                  {stage.actions.length === 0 ? (
                    <p className="text-xs text-stone-600 italic py-2">
                      No actions added to this stage yet.
                    </p>
                  ) : (
                    stage.actions.map((action) => (
                      <div
                        key={action.id}
                        id={`action-item-${action.id}`}
                        className={`group flex items-start justify-between gap-3 p-3 rounded-xl border transition-all ${
                          action.completed
                            ? 'bg-stone-50/70 border-stone-200/50 text-stone-400'
                            : 'bg-white border-stone-200/80 hover:border-stone-300 text-stone-800'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          {/* Checkbox button */}
                          <button
                            onClick={() => onToggleAction(system.id, action.id)}
                            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                              action.completed
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-stone-300 hover:border-stone-500 bg-white'
                            }`}
                            aria-label={action.completed ? 'Mark incomplete' : 'Mark complete'}
                          >
                            {action.completed && <Check className="w-3.5 h-3.5" />}
                          </button>

                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium leading-snug ${
                                action.completed ? 'line-through text-stone-600' : 'text-stone-900'
                              }`}
                            >
                              {action.title}
                            </p>

                            {/* Meta flags */}
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-stone-600">
                              {action.estimatedMinutes && (
                                <span className="inline-flex items-center gap-1 font-medium bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">
                                  <Clock className="w-3 h-3 text-stone-600" />
                                  {action.estimatedMinutes}m
                                </span>
                              )}

                              {action.dueDate && (
                                <span className="inline-flex items-center gap-1 font-medium bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">
                                  <Calendar className="w-3 h-3 text-stone-600" />
                                  {action.dueDate}
                                </span>
                              )}

                              {action.recurrence && action.recurrence !== 'none' && (
                                <span className="inline-flex items-center gap-1 font-medium bg-sky-50 text-sky-800 px-1.5 py-0.5 rounded border border-sky-200/60">
                                  <Repeat className="w-3 h-3 text-sky-700" />
                                  {action.recurrence}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Delete action button */}
                        <button
                          onClick={() => handleDeleteAction(stage.id, action.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-600 transition-opacity"
                          title="Delete action"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Action Form / Trigger */}
                {isCurrentActiveAdd ? (
                  <form
                    onSubmit={(e) => handleAddAction(stage.id, e)}
                    className="mt-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200"
                  >
                    <input
                      type="text"
                      value={newActionTitle}
                      onChange={(e) => setNewActionTitle(e.target.value)}
                      placeholder="e.g. Draft deliverables or test workflow..."
                      className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 mb-2.5"
                      autoFocus
                    />

                    <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
                      <div className="flex items-center gap-1 bg-white border border-stone-300 rounded-lg px-2 py-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <input
                          type="number"
                          value={newActionMinutes}
                          onChange={(e) => setNewActionMinutes(Number(e.target.value))}
                          className="w-10 text-center focus:outline-none"
                          min={5}
                          max={240}
                        />
                        <span className="text-stone-500">min</span>
                      </div>

                      <div className="flex items-center gap-1 bg-white border border-stone-300 rounded-lg px-2 py-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <input
                          type="date"
                          value={newActionDueDate}
                          onChange={(e) => setNewActionDueDate(e.target.value)}
                          className="text-stone-700 focus:outline-none text-xs"
                        />
                      </div>

                      <select
                        value={newActionRecurrence}
                        onChange={(e) => setNewActionRecurrence(e.target.value as ActionRecurrence)}
                        className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-stone-700 focus:outline-none text-xs"
                      >
                        <option value="none">No recurrence</option>
                        <option value="daily">Daily</option>
                        <option value="weekdays">Weekdays</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveAddActionStageId(null)}
                        className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Add Action
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => {
                      setActiveAddActionStageId(stage.id);
                      setNewActionTitle('');
                    }}
                    className="mt-3 w-full py-2 px-3 border border-dashed border-stone-300 hover:border-stone-400 hover:bg-stone-50/50 rounded-xl text-xs font-medium text-stone-600 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-stone-400" />
                    <span>Add action to {stage.name}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Stage Form or Button */}
        {isAddingStage ? (
          <form
            onSubmit={handleAddStage}
            className="bg-white rounded-2xl border border-stone-300 p-5 shadow-xs"
          >
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              New Stage Name
            </label>
            <input
              type="text"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              placeholder="e.g. Practise, Review, Launch, Test"
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 mb-3"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingStage(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Add Stage
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center pt-2">
            <button
              onClick={() => setIsAddingStage(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-medium text-stone-700 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-stone-500" />
              <span>+ Add another stage to this system</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
