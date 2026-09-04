import React, { useState, useEffect } from 'react';
import { System, SystemAction, SystemStage } from '../types';
import {
  Check,
  Clock,
  Sparkles,
  ArrowRight,
  PlusCircle,
  CheckCircle,
  Compass,
  SlidersHorizontal,
} from 'lucide-react';

interface TodayItem {
  action: SystemAction;
  system: System;
  stage: SystemStage;
}

interface TodayViewProps {
  systems: System[];
  onToggleAction: (systemId: string, actionId: string) => void;
  onOpenSmartNextMove: () => void;
  onOpenSystem: (systemId: string) => void;
  onBuildFirstSystem: () => void;
  onStartBuilding?: (prefillGoal?: string) => void;
  onStartActionTimer?: (action: SystemAction, system: System, stage: SystemStage) => void;
}

const ROTATING_TITLES = [
  'Leader',
  'Thinker',
  'Builder',
  'Creator',
  'Strategist',
  'Planner',
];

export const TodayView: React.FC<TodayViewProps> = ({
  systems,
  onToggleAction,
  onOpenSmartNextMove,
  onOpenSystem,
  onBuildFirstSystem,
  onStartBuilding,
  onStartActionTimer,
}) => {
  // Quick goal input state for the top Build System card
  const [quickGoalInput, setQuickGoalInput] = useState('');

  // Typing animation states for the welcome header
  const [titleIndex, setTitleIndex] = useState(0);
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine greeting prefix based on current time of day
  const getGreetingPrefix = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Typewriter effect cycle:
  // Starts with 'Leader', types calmly, pauses for 5s, deletes gently, and moves to 'Thinker', etc.
  useEffect(() => {
    const targetWord = ROTATING_TITLES[titleIndex];
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (displayedTitle.length < targetWord.length) {
        // Typing characters with calm, deliberate pacing
        timer = setTimeout(() => {
          setDisplayedTitle(targetWord.slice(0, displayedTitle.length + 1));
        }, 180);
      } else {
        // Full word typed out; generous calm pause for comfortable reading (5 seconds)
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 5000);
      }
    } else {
      if (displayedTitle.length > 0) {
        // Deleting characters calmly
        timer = setTimeout(() => {
          setDisplayedTitle(displayedTitle.slice(0, -1));
        }, 90);
      } else {
        // Finished deleting, peaceful breath before typing next title
        timer = setTimeout(() => {
          setIsDeleting(false);
          setTitleIndex((prev) => (prev + 1) % ROTATING_TITLES.length);
        }, 700);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedTitle, isDeleting, titleIndex]);

  // Formatted date string
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  // Filter and prioritize today's active items
  const activeSystems = systems.filter((s) => s.status === 'active');
  const incompleteItems: TodayItem[] = [];
  const completedTodayItems: TodayItem[] = [];
  const todayDateStr = new Date().toISOString().split('T')[0];

  for (const system of activeSystems) {
    for (const stage of system.stages) {
      for (const action of stage.actions) {
        if (!action.completed) {
          incompleteItems.push({ action, system, stage });
        } else {
          if (action.completedAt && action.completedAt.startsWith(todayDateStr)) {
            completedTodayItems.push({ action, system, stage });
          }
        }
      }
    }
  }

  // Intelligently prioritize top 3 to 4 actions
  const prioritizedNextMoves = incompleteItems
    .sort((a, b) => {
      const aDue = a.action.dueDate === todayDateStr ? 1 : 0;
      const bDue = b.action.dueDate === todayDateStr ? 1 : 0;
      if (aDue !== bDue) return bDue - aDue;

      if (a.stage.order !== b.stage.order) {
        return a.stage.order - b.stage.order;
      }
      return a.action.order - b.action.order;
    })
    .slice(0, 4);

  const handleStartBuild = (goal?: string) => {
    if (onStartBuilding) {
      onStartBuilding(goal);
    } else {
      onBuildFirstSystem();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-28">
      {/* 1. Welcoming Header with Typing Animation */}
      <header id="today-welcome-header" className="mb-6">
        <p className="text-xs uppercase tracking-wider font-semibold text-stone-500 mb-1.5">
          {formattedDate}
        </p>

        {/* Dynamic Typing Title */}
        <h1
          id="today-greeting-headline"
          className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 font-serif leading-snug"
        >
          <span>{getGreetingPrefix()},{' '}</span>
          <span className="text-sky-700 underline decoration-sky-300 decoration-2 underline-offset-6 inline-block min-w-[2ch]">
            {displayedTitle}
          </span>
          <span
            className="inline-block w-[3px] h-[0.8em] bg-sky-600 ml-1.5 align-middle animate-pulse"
            aria-hidden="true"
          />
        </h1>

        {/* Short bio in full sentences explaining what Let'sAct is about */}
        <div
          id="lets-act-bio-card"
          className="mt-4 p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs text-stone-700 leading-relaxed text-sm sm:text-base"
        >
          <p>
            Let'sAct helps you take anything you want to accomplish—whether that is launching a major project milestone, establishing a consistent personal habit, or streamlining team operations—and turns it into a clear, structured system. Instead of getting stuck in vague intentions or navigating an overwhelming to-do list, your work is organized into sequential stages so you always have an immediate answer to what you should do next.
          </p>
        </div>
      </header>

      {/* 2. THE FIRST THING THEY SEE BEFORE SAMPLE MOVES: Build Your System */}
      <section id="build-system-top-card" className="mb-8">
        <div className="p-6 sm:p-7 rounded-2xl bg-stone-900 text-stone-100 shadow-sm border border-stone-800 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Primary Action</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Build a System
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed max-w-md">
                Enter any objective you want to achieve, and Let'sAct will map it into sequential stages and actionable daily moves.
              </p>
            </div>

            <button
              id="top-build-system-btn"
              onClick={() => handleStartBuild(quickGoalInput.trim() || undefined)}
              className="self-start sm:self-center px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-stone-950 font-semibold text-sm shadow-sm transition-all flex items-center gap-2 shrink-0 hover:shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Build System</span>
            </button>
          </div>

          {/* Inline Quick Goal Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStartBuild(quickGoalInput.trim() || undefined);
            }}
            className="mt-5 flex flex-col sm:flex-row items-stretch gap-2"
          >
            <input
              id="quick-goal-input"
              type="text"
              value={quickGoalInput}
              onChange={(e) => setQuickGoalInput(e.target.value)}
              placeholder="e.g. Deliver quarterly project milestone, or build a consistent workout habit..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-stone-800/90 border border-stone-700 text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
            <button
              id="quick-goal-submit-btn"
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-sky-300 font-medium text-sm transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Begin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </section>

      {/* 3. Decision Relief: "What should I do right now?" */}
      <section className="mb-10">
        <button
          id="what-should-i-do-btn"
          onClick={onOpenSmartNextMove}
          className="w-full group text-left p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-sm hover:shadow-md hover:from-sky-700 hover:to-sky-800 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wide uppercase text-sky-200">
                Decision Relief
              </span>
              <div className="text-base sm:text-lg font-semibold leading-tight">
                What should I do right now?
              </div>
              <p className="text-xs text-sky-100/90 mt-0.5 hidden sm:block">
                Analyse active systems and get one clear, prioritized recommendation.
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0 ml-2">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </button>
      </section>

      {/* 4. Sample Moves Section with Explicit Tweak Heading */}
      <section id="sample-moves-section">
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h2
              id="sample-moves-heading"
              className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight"
            >
              Sample Moves (Tweak or replace these as needed)
            </h2>
            <span className="text-xs text-stone-500 font-medium">
              {prioritizedNextMoves.length === 0
                ? 'All clear'
                : `${prioritizedNextMoves.length} example actions`}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
            These are sample actions generated from example systems to show how goals turn into practical daily actions. Feel free to check them off, tweak their details, or build your own system above to replace them.
          </p>
        </div>

        {/* Empty State when all actions are completed */}
        {prioritizedNextMoves.length === 0 ? (
          <div
            id="today-empty-state"
            className="bg-white rounded-2xl border border-stone-200/90 p-8 sm:p-10 text-center shadow-xs"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 id="today-clear-headline" className="text-xl font-bold text-stone-900">
              You're clear for today.
            </h3>
            <p className="mt-2 text-stone-600 text-sm max-w-sm mx-auto">
              Nice work. All prioritized sample moves are checked off. Build a new custom system or review your existing workflows.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => handleStartBuild()}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium transition-colors"
              >
                + Build a New System
              </button>
            </div>
          </div>
        ) : (
          /* List of Sample Moves */
          <div className="space-y-3">
            {prioritizedNextMoves.map((item, index) => {
              const { action, system, stage } = item;
              return (
                <div
                  key={action.id}
                  id={`today-action-card-${action.id}`}
                  className="group bg-white rounded-2xl border border-stone-200/90 hover:border-stone-300 p-4 sm:p-5 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Position indicator */}
                    <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>

                    <div>
                      {/* Action Title */}
                      <p className="text-base font-semibold text-stone-900 leading-snug group-hover:text-sky-950 transition-colors">
                        {action.title}
                      </p>

                      {/* System context & duration */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                        {action.estimatedMinutes && (
                          <span className="inline-flex items-center gap-1 font-medium text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3 text-stone-500" />
                            {action.estimatedMinutes} min
                          </span>
                        )}

                        {/* Direct link to tweak or view system */}
                        <button
                          onClick={() => onOpenSystem(system.id)}
                          className="hover:underline text-stone-600 hover:text-stone-900 inline-flex items-center gap-1"
                          title="View and tweak this system"
                        >
                          <span>{system.title}</span>
                          <span className="text-[11px] text-sky-700 font-medium">
                            (tweak →)
                          </span>
                        </button>

                        <span className="text-stone-300">·</span>

                        <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-900 font-medium text-[11px] border border-sky-200/60">
                          {stage.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions right: Start timer or Mark Done */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-1 sm:pt-0">
                    {onStartActionTimer && (
                      <button
                        onClick={() => onStartActionTimer(action, system, stage)}
                        className="px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors"
                        title="Focus on this action now"
                      >
                        Focus
                      </button>
                    )}

                    <button
                      id={`done-btn-${action.id}`}
                      onClick={() => onToggleAction(system.id, action.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Completed Today Section */}
      {completedTodayItems.length > 0 && (
        <section className="mt-10 border-t border-stone-200/80 pt-6">
          <div className="flex items-center justify-between mb-3 text-xs text-stone-500">
            <span className="font-semibold uppercase tracking-wider">
              Completed today ({completedTodayItems.length})
            </span>
          </div>

          <div className="space-y-2">
            {completedTodayItems.map(({ action, system }) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-100/70 border border-stone-200/60 text-stone-500 text-xs"
              >
                <div className="flex items-center gap-2.5 line-through truncate">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{action.title}</span>
                  <span className="text-stone-400 text-[11px] hidden sm:inline">
                    ({system.title})
                  </span>
                </div>

                <button
                  onClick={() => onToggleAction(system.id, action.id)}
                  className="text-[11px] text-stone-400 hover:text-stone-700 ml-2 underline shrink-0"
                >
                  Undo
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
