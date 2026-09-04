import React, { useState } from 'react';
import { System, SystemStage, SystemAction, ActionRecurrence } from '../types';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Clock,
  Calendar,
  Layers,
  Loader2,
} from 'lucide-react';

interface SystemBuilderWizardProps {
  onCancel: () => void;
  onSaveSystem: (newSystem: System) => void;
  prefillGoal?: string;
}

interface DraftStage {
  id: string;
  name: string;
  actions: Array<{
    id: string;
    title: string;
    estimatedMinutes?: number;
    dueDate?: string;
    recurrence?: ActionRecurrence;
  }>;
}

export const SystemBuilderWizard: React.FC<SystemBuilderWizardProps> = ({
  onCancel,
  onSaveSystem,
  prefillGoal = '',
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 Form fields
  const [goal, setGoal] = useState(prefillGoal);
  const [why, setWhy] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [category, setCategory] = useState('Work & Career');
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Loading indicator for smart breakdown
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSource, setGenerationSource] = useState<'gemini' | 'heuristic' | null>(null);

  // Step 2 & 3 Draft Stages
  const [stages, setStages] = useState<DraftStage[]>([]);
  const [newStageName, setNewStageName] = useState('');

  // Quick goal sample clicker
  const sampleGoals = [
    { title: 'Deliver quarterly project milestone', cat: 'Work & Career' },
    { title: 'Streamline team weekly operations', cat: 'Operations' },
    { title: 'Build a consistent workout habit', cat: 'Health & Wellbeing' },
    { title: 'Launch independent consulting service', cat: 'Business' },
  ];

  // Request breakdown from server
  const handleProceedToSystem = async () => {
    if (!goal.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, why, timeframe }),
      });

      if (res.ok) {
        const data = await res.json();
        setGenerationSource(data.source === 'gemini' ? 'gemini' : 'heuristic');

        if (Array.isArray(data.stages) && data.stages.length > 0) {
          const formatted: DraftStage[] = data.stages.map((stg: any, sIdx: number) => ({
            id: `draft-stg-${sIdx}-${Date.now()}`,
            name: stg.name || `Stage ${sIdx + 1}`,
            actions: Array.isArray(stg.actions)
              ? stg.actions.map((act: any, aIdx: number) => ({
                  id: `draft-act-${sIdx}-${aIdx}-${Date.now()}`,
                  title: act.title || 'Take action',
                  estimatedMinutes: act.estimatedMinutes || 30,
                  recurrence: 'none',
                }))
              : [],
          }));
          setStages(formatted);
        } else {
          fallbackStages();
        }
      } else {
        fallbackStages();
      }
    } catch {
      fallbackStages();
    } finally {
      setIsGenerating(false);
      setStep(2);
    }
  };

  const fallbackStages = () => {
    setStages([
      {
        id: `stg-1-${Date.now()}`,
        name: 'Understand',
        actions: [{ id: `act-1-${Date.now()}`, title: 'Map out core prerequisites', estimatedMinutes: 30 }],
      },
      {
        id: `stg-2-${Date.now()}`,
        name: 'Practise',
        actions: [{ id: `act-2-${Date.now()}`, title: 'Complete first practice iteration', estimatedMinutes: 45 }],
      },
      {
        id: `stg-3-${Date.now()}`,
        name: 'Review',
        actions: [{ id: `act-3-${Date.now()}`, title: 'Identify and fix weak spots', estimatedMinutes: 20 }],
      },
      {
        id: `stg-4-${Date.now()}`,
        name: 'Test',
        actions: [{ id: `act-4-${Date.now()}`, title: 'Execute full trial and assess results', estimatedMinutes: 45 }],
      },
    ]);
  };

  // Stage Manipulation in Step 2
  const handleRenameStage = (index: number, newName: string) => {
    const updated = [...stages];
    updated[index].name = newName;
    setStages(updated);
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= stages.length) return;
    const updated = [...stages];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setStages(updated);
  };

  const handleDeleteStage = (index: number) => {
    if (stages.length <= 1) {
      alert('Your system must have at least one stage.');
      return;
    }
    setStages(stages.filter((_, i) => i !== index));
  };

  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim()) return;
    setStages([
      ...stages,
      {
        id: `draft-stg-${Date.now()}`,
        name: newStageName.trim(),
        actions: [],
      },
    ]);
    setNewStageName('');
  };

  // Action Manipulation in Step 3
  const handleAddActionToStage = (stageIndex: number, actionTitle: string) => {
    if (!actionTitle.trim()) return;
    const updated = [...stages];
    updated[stageIndex].actions.push({
      id: `act-${Date.now()}-${Math.random()}`,
      title: actionTitle.trim(),
      estimatedMinutes: 30,
      recurrence: 'none',
    });
    setStages(updated);
  };

  const handleDeleteActionFromStage = (stageIndex: number, actionIndex: number) => {
    const updated = [...stages];
    updated[stageIndex].actions = updated[stageIndex].actions.filter((_, i) => i !== actionIndex);
    setStages(updated);
  };

  // Final Complete
  const handleFinishAndActivate = () => {
    const systemId = `sys-${Date.now()}`;
    const newSystem: System = {
      id: systemId,
      title: goal.trim(),
      category: category || 'Personal',
      why: why.trim() || undefined,
      timeframe: timeframe.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      stages: stages.map((stg, sIdx) => ({
        id: `stg-${systemId}-${sIdx}`,
        systemId,
        name: stg.name,
        order: sIdx,
        actions: stg.actions.map((act, aIdx) => ({
          id: `act-${systemId}-${sIdx}-${aIdx}`,
          stageId: `stg-${systemId}-${sIdx}`,
          systemId,
          title: act.title,
          estimatedMinutes: act.estimatedMinutes || 30,
          dueDate: act.dueDate || (sIdx === 0 && aIdx === 0 ? new Date().toISOString().split('T')[0] : undefined),
          recurrence: act.recurrence || 'none',
          completed: false,
          order: aIdx,
        })),
      })),
    };

    onSaveSystem(newSystem);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={step === 1 ? onCancel : () => setStep((prev) => (prev - 1) as any)}
          className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{step === 1 ? 'Cancel' : 'Previous step'}</span>
        </button>

        {/* 3 Step Indicator */}
        <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium">
          <span className={step >= 1 ? 'text-sky-700 font-bold' : ''}>1. Goal</span>
          <span>→</span>
          <span className={step >= 2 ? 'text-sky-700 font-bold' : ''}>2. System</span>
          <span>→</span>
          <span className={step >= 3 ? 'text-sky-700 font-bold' : ''}>3. Actions</span>
        </div>
      </div>

      {/* STEP 1: What is the goal? */}
      {step === 1 && (
        <div id="builder-step-1" className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-xs">
          <div className="text-xs uppercase font-semibold tracking-wider text-sky-800 mb-1">
            Step 1 of 3
          </div>

          <h2
            id="builder-step1-headline"
            className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif"
          >
            What are you trying to accomplish?
          </h2>

          <p className="mt-2 text-sm text-stone-600">
            Describe your goal naturally. We will transform it into a simple, repeatable system.
          </p>

          {/* Large Goal Input */}
          <div className="mt-6">
            <textarea
              id="goal-input-field"
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. &quot;Deliver quarterly project milestone&quot; or &quot;Build a consistent workout habit&quot;"
              className="w-full p-4 text-base sm:text-lg text-stone-900 bg-stone-50 border border-stone-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all resize-none"
              autoFocus
            />
          </div>

          {/* Sample quick picks */}
          <div className="mt-3">
            <span className="text-xs text-stone-400">Or pick an example: </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {sampleGoals.map((sample) => (
                <button
                  key={sample.title}
                  type="button"
                  onClick={() => {
                    setGoal(sample.title);
                    setCategory(sample.cat);
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Fields Accordion */}
          <div className="mt-6 pt-5 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 inline-flex items-center gap-1"
            >
              <span>{showOptionalFields ? 'Hide optional details' : '+ Add optional context (why & deadline)'}</span>
            </button>

            {showOptionalFields && (
              <div className="mt-4 space-y-4 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Why does this matter?
                  </label>
                  <input
                    type="text"
                    value={why}
                    onChange={(e) => setWhy(e.target.value)}
                    placeholder="e.g. Deliver our milestone on time without last-minute panic or fatigue"
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      When do you want to achieve it?
                    </label>
                    <input
                      type="text"
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      placeholder="e.g. In 4 weeks, or by end of quarter"
                      className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-stone-800"
                    >
                      <option value="Work & Career">Work & Career</option>
                      <option value="Operations">Operations</option>
                      <option value="Health & Wellbeing">Health & Wellbeing</option>
                      <option value="Business">Business</option>
                      <option value="Personal Growth">Personal Growth</option>
                      <option value="Creative">Creative</option>
                      <option value="Life & Home">Life & Home</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 1 Submit Button */}
          <div className="mt-8">
            <button
              id="build-my-system-btn"
              type="button"
              disabled={!goal.trim() || isGenerating}
              onClick={handleProceedToSystem}
              className="w-full py-4 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white font-medium text-base shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Transforming goal into system...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Build my system</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Build the System (Stages) */}
      {step === 2 && (
        <div id="builder-step-2" className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-xs">
          <div className="text-xs uppercase font-semibold tracking-wider text-sky-800 mb-1">
            Step 2 of 3 · System Stages
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
            Let's turn it into a system.
          </h2>

          <p className="mt-2 text-sm text-stone-600">
            {generationSource === 'gemini' ? (
              <span className="inline-flex items-center gap-1 text-sky-900 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                AI suggested workflow for "{goal}".
              </span>
            ) : (
              <span>Recommended sequential workflow for "{goal}".</span>
            )}
            {' '}Does this look right? You can rename, reorder, or add stages.
          </p>

          {/* Horizontal / linear flow visual */}
          <div className="my-6 p-4 rounded-2xl bg-sky-50/70 border border-sky-200/60 flex flex-wrap items-center gap-2 text-sm font-semibold text-sky-950">
            {stages.map((stg, idx) => (
              <React.Fragment key={stg.id}>
                <span className="px-3 py-1 rounded-lg bg-white border border-sky-200 text-sky-900 shadow-2xs">
                  {stg.name}
                </span>
                {idx < stages.length - 1 && (
                  <span className="text-sky-400 font-bold">→</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Editable list of stages */}
          <div className="space-y-3 mt-6">
            {stages.map((stage, idx) => (
              <div
                key={stage.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-stone-200 bg-stone-50/50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>

                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => handleRenameStage(idx, e.target.value)}
                    className="flex-1 px-2.5 py-1 text-sm font-semibold text-stone-900 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="flex items-center gap-1 text-stone-400">
                  <button
                    type="button"
                    onClick={() => handleMoveStage(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 hover:text-stone-700 disabled:opacity-20"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveStage(idx, 'down')}
                    disabled={idx === stages.length - 1}
                    className="p-1 hover:text-stone-700 disabled:opacity-20"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteStage(idx)}
                    className="p-1 hover:text-red-600 ml-1"
                    title="Delete stage"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Stage Inline */}
          <form onSubmit={handleAddStage} className="mt-4 flex items-center gap-2">
            <input
              type="text"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              placeholder="Add another stage (e.g. Review, Polish)..."
              className="flex-1 px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Continue Button */}
          <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              ← Back to goal
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="py-3.5 px-6 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm transition-colors flex items-center gap-2"
            >
              <span>Continue to Actions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Actions within each stage */}
      {step === 3 && (
        <div id="builder-step-3" className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-xs">
          <div className="text-xs uppercase font-semibold tracking-wider text-sky-800 mb-1">
            Step 3 of 3 · Actions
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
            Here's what you should do first.
          </h2>

          <p className="mt-2 text-sm text-stone-600">
            Concrete actions inside each stage. Keep them simple and actionable.
          </p>

          {/* Stages and their actions */}
          <div className="mt-6 space-y-6">
            {stages.map((stage, stageIdx) => (
              <div
                key={stage.id}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-900 text-xs font-bold flex items-center justify-center">
                    {stageIdx + 1}
                  </span>
                  <h3 className="font-bold text-stone-900 text-sm">{stage.name}</h3>
                </div>

                {/* Actions list */}
                <div className="space-y-2">
                  {stage.actions.map((act, actIdx) => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-stone-200/80 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                        <span className="font-medium text-stone-800 truncate">{act.title}</span>
                        {act.estimatedMinutes && (
                          <span className="text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded text-[11px] shrink-0">
                            {act.estimatedMinutes}m
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteActionFromStage(stageIdx, actIdx)}
                        className="text-stone-400 hover:text-red-600 p-1 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Inline add action to this stage */}
                <div className="mt-2.5">
                  <input
                    type="text"
                    placeholder={`+ Add action to ${stage.name} (press Enter)`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddActionToStage(stageIdx, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-dashed border-stone-300 rounded-lg focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Finish CTA */}
          <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              ← Back to stages
            </button>

            <button
              id="finish-system-btn"
              type="button"
              onClick={handleFinishAndActivate}
              className="py-3.5 px-7 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm shadow-sm transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Activate My System</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
