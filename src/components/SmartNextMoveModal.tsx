import React, { useState, useMemo } from 'react';
import { System, SystemAction, SystemStage, SmartRecommendation } from '../types';
import { Sparkles, Clock, X, Check, Play, RefreshCw } from 'lucide-react';

interface SmartNextMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  systems: System[];
  onToggleAction: (systemId: string, actionId: string) => void;
  onStartActionTimer: (action: SystemAction, system: System, stage: SystemStage) => void;
}

export const SmartNextMoveModal: React.FC<SmartNextMoveModalProps> = ({
  isOpen,
  onClose,
  systems,
  onToggleAction,
  onStartActionTimer,
}) => {
  const [candidateIndex, setCandidateIndex] = useState(0);

  // Analyze all systems, stages, and actions to produce ranked recommendations
  const recommendations: SmartRecommendation[] = useMemo(() => {
    const list: SmartRecommendation[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    const activeSystems = systems.filter((s) => s.status === 'active');

    for (const system of activeSystems) {
      // Find the current active (earliest incomplete) stage
      let currentStage: SystemStage | null = null;
      for (const stage of system.stages) {
        const hasIncomplete = stage.actions.some((a) => !a.completed);
        if (hasIncomplete) {
          currentStage = stage;
          break;
        }
      }

      for (const stage of system.stages) {
        for (const action of stage.actions) {
          if (action.completed) continue;

          const isCurrentStage = currentStage?.id === stage.id;
          const isDueToday = action.dueDate === todayStr;
          const isOverdue = action.dueDate && action.dueDate < todayStr;

          let urgency: 'high' | 'medium' | 'normal' = 'normal';
          let reason = `It's the next unfinished action in your current stage "${stage.name}".`;

          if (isOverdue) {
            urgency = 'high';
            reason = `This action was due previously and finishing it will unblock your forward momentum in "${system.title}".`;
          } else if (isDueToday) {
            urgency = 'high';
            reason = `It's scheduled for today and keeps your current stage "${stage.name}" moving without delay.`;
          } else if (system.timeframe && system.timeframe.toLowerCase().includes('week')) {
            urgency = 'medium';
            reason = `It's the next unfinished action in your current stage and your milestone deadline (${system.timeframe}) is approaching.`;
          } else if (isCurrentStage) {
            urgency = 'medium';
            reason = `It is the sequential bottleneck in "${stage.name}" before your system can advance to the next phase.`;
          }

          list.push({
            action,
            system,
            stage,
            reason,
            urgency,
          });
        }
      }
    }

    // Rank list: high urgency first, then earliest stages
    return list.sort((a, b) => {
      const urgencyScore = { high: 3, medium: 2, normal: 1 };
      const scoreDiff = urgencyScore[b.urgency] - urgencyScore[a.urgency];
      if (scoreDiff !== 0) return scoreDiff;
      if (a.stage.order !== b.stage.order) {
        return a.stage.order - b.stage.order;
      }
      return a.action.order - b.action.order;
    });
  }, [systems]);

  if (!isOpen) return null;

  const currentRecommendation = recommendations[candidateIndex % (recommendations.length || 1)];

  const handleNextAlternative = () => {
    if (recommendations.length > 1) {
      setCandidateIndex((prev) => (prev + 1) % recommendations.length);
    }
  };

  return (
    <div
      id="smart-next-move-overlay"
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        id="smart-next-move-dialog"
        className="bg-white w-full max-w-lg rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-2xl relative"
      >
        {/* Close Button */}
        <button
          id="close-recommendation-modal"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-sky-700" />
          </div>
          <span className="text-xs uppercase font-semibold tracking-wider text-sky-800">
            Let'sAct Guidance
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-xl font-bold text-stone-900">All systems clear</h3>
            <p className="mt-2 text-stone-600 text-sm">
              You've completed all active actions across your systems. You're completely caught up!
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium"
            >
              Great, close
            </button>
          </div>
        ) : (
          <div>
            {/* Headline */}
            <h2
              id="recommendation-headline"
              className="text-xs uppercase font-bold tracking-widest text-stone-600"
            >
              Your next move
            </h2>

            {/* Recommended Action Title */}
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
              {currentRecommendation.action.title}
            </div>

            {/* Context meta */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-600">
              <span className="px-2.5 py-1 rounded-md bg-stone-100 font-medium text-stone-700">
                {currentRecommendation.system.category} · {currentRecommendation.system.title}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-sky-50 border border-sky-200 text-sky-900 font-medium">
                Stage: {currentRecommendation.stage.name}
              </span>
              {currentRecommendation.action.estimatedMinutes && (
                <span className="flex items-center gap-1 font-medium text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  {currentRecommendation.action.estimatedMinutes} min
                </span>
              )}
            </div>

            {/* "Why?" section */}
            <div className="mt-6 p-4.5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Why?
              </span>
              <p
                id="recommendation-why-text"
                className="text-sm sm:text-base text-stone-700 font-serif italic leading-relaxed"
              >
                «{currentRecommendation.reason}»
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <button
                id="recommendation-start-btn"
                onClick={() => {
                  onStartActionTimer(
                    currentRecommendation.action,
                    currentRecommendation.system,
                    currentRecommendation.stage
                  );
                  onClose();
                }}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start</span>
              </button>

              <button
                id="recommendation-done-quick-btn"
                onClick={() => {
                  onToggleAction(
                    currentRecommendation.system.id,
                    currentRecommendation.action.id
                  );
                  onClose();
                }}
                className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-stone-900 hover:bg-emerald-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Mark Done</span>
              </button>
            </div>

            {/* Secondary Option: Show me alternatives */}
            {recommendations.length > 1 && (
              <div className="mt-4 text-center">
                <button
                  id="recommendation-show-alternatives-btn"
                  onClick={handleNextAlternative}
                  className="text-xs font-medium text-stone-500 hover:text-stone-900 inline-flex items-center gap-1.5 transition-colors py-1 px-2 rounded-md hover:bg-stone-100"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    Show me alternatives ({candidateIndex + 1} of {recommendations.length})
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
