import React, { useState } from 'react';
import { ArrowDown, ArrowRight, CheckCircle2, Sparkles, Briefcase, Activity, Cog, Target } from 'lucide-react';

interface LandingPageProps {
  onStartBuilding: (prefillGoal?: string) => void;
  onGoToToday: () => void;
  onGoToSystems: () => void;
}

interface ExampleSystem {
  id: string;
  category: string;
  icon: React.ReactNode;
  goal: string;
  stages: string[];
  actions: { title: string; duration: string }[];
}

const EXAMPLES: ExampleSystem[] = [
  {
    id: 'work',
    category: 'Work & Projects',
    icon: <Briefcase className="w-3.5 h-3.5 text-sky-700" />,
    goal: 'Deliver quarterly project milestone',
    stages: ['Scope & Align', 'Build', 'Refine', 'Ship'],
    actions: [
      { title: 'Draft presentation deck & core deliverables', duration: '45m' },
      { title: 'Review priority blocker tickets with team leads', duration: '30m' },
      { title: 'Incorporate feedback from stakeholder walkthrough', duration: '25m' },
    ],
  },
  {
    id: 'operations',
    category: 'Operations & Team',
    icon: <Cog className="w-3.5 h-3.5 text-sky-700" />,
    goal: 'Streamline weekly team operations',
    stages: ['Audit', 'Standardize', 'Automate', 'Review'],
    actions: [
      { title: 'Draft reusable weekly async status update template', duration: '20m' },
      { title: 'Publish guidelines for meeting-free focus mornings', duration: '25m' },
      { title: 'Set up recurring status prompt in workspace', duration: '15m' },
    ],
  },
  {
    id: 'health',
    category: 'Health & Wellbeing',
    icon: <Activity className="w-3.5 h-3.5 text-sky-700" />,
    goal: 'Build a consistent workout habit',
    stages: ['Plan', 'Start', 'Train', 'Recover', 'Review'],
    actions: [
      { title: '30-minute cardio & resistance training session', duration: '30m' },
      { title: '10-minute restorative stretch & hydration', duration: '10m' },
      { title: 'Weekly consistency review & calibration', duration: '15m' },
    ],
  },
  {
    id: 'business',
    category: 'Business & Freelance',
    icon: <Target className="w-3.5 h-3.5 text-sky-700" />,
    goal: 'Launch independent consulting practice',
    stages: ['Position', 'Validate', 'Package', 'Outreach', 'Deliver'],
    actions: [
      { title: 'Draft 1-page service scope of work & agreement', duration: '45m' },
      { title: 'Send outreach proposal to first 3 prospective clients', duration: '40m' },
      { title: 'Standardize client delivery checklist', duration: '30m' },
    ],
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartBuilding,
  onGoToToday,
}) => {
  const [activeExampleIndex, setActiveExampleIndex] = useState(0);
  const activeExample = EXAMPLES[activeExampleIndex];

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 pb-24">
      {/* Hero Section */}
      <section id="landing-hero" className="text-center max-w-2xl mx-auto">
        {/* Subtle Concept Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/80 border border-sky-200/80 text-sky-900 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-sky-700" />
          <span>Goal → System → Actions → Progress</span>
        </div>

        {/* Hero Headline */}
        <h1
          id="landing-hero-headline"
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.15]"
        >
          Turn goals into systems.
        </h1>

        {/* Supporting Text */}
        <p
          id="landing-hero-supporting-text"
          className="mt-5 text-lg sm:text-xl text-stone-600 leading-relaxed max-w-xl mx-auto"
        >
          Stop wondering what to do next. Build a simple system around your goals
          and always know your next move.
        </p>

        {/* CTAs */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            id="landing-primary-cta"
            onClick={() => onStartBuilding()}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
          >
            <span>Build a System</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="landing-secondary-cta"
            onClick={scrollToHowItWorks}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 font-medium text-base transition-colors"
          >
            See how it works
          </button>
        </div>

        <div className="mt-4">
          <button
            id="landing-jump-to-today"
            onClick={onGoToToday}
            className="text-xs text-stone-500 hover:text-stone-800 underline underline-offset-4 transition-colors"
          >
            Already have systems? Go straight to Today's Dashboard →
          </button>
        </div>
      </section>

      {/* Simple Visual: Goal -> System -> Actions -> Progress */}
      <section
        id="landing-simple-visual"
        className="mt-16 sm:mt-20 max-w-md mx-auto"
      >
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col items-center space-y-3 text-center">
            {/* Goal Step */}
            <div className="w-full py-2.5 px-4 rounded-xl bg-stone-100 border border-stone-200 font-semibold text-stone-800 text-base">
              Goal
            </div>
            <ArrowDown className="w-4 h-4 text-stone-400" />

            {/* System Step */}
            <div className="w-full py-2.5 px-4 rounded-xl bg-sky-50 border border-sky-200/90 font-semibold text-sky-900 text-base">
              System
            </div>
            <ArrowDown className="w-4 h-4 text-stone-400" />

            {/* Actions Step */}
            <div className="w-full py-2.5 px-4 rounded-xl bg-stone-100 border border-stone-200 font-semibold text-stone-800 text-base">
              Actions
            </div>
            <ArrowDown className="w-4 h-4 text-stone-400" />

            {/* Progress Step */}
            <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200 font-semibold text-emerald-900 text-base flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Progress</span>
            </div>
          </div>
        </div>
      </section>

      {/* Explanation & Multi-Disciplinary Example Section */}
      <section
        id="how-it-works-section"
        className="mt-16 sm:mt-20 max-w-2xl mx-auto text-center"
      >
        <blockquote
          id="landing-quote-explanation"
          className="text-xl sm:text-2xl font-serif italic text-stone-800 leading-snug px-4"
        >
          «Most goals fail because they're vague. Let'sAct turns them into
          repeatable actions you can actually follow.»
        </blockquote>

        {/* Versatile Example Box with Category Tabs */}
        <div
          id="landing-small-example"
          className="mt-10 text-left bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs"
        >
          {/* Example Selector Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-6 border-b border-stone-100 pb-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-stone-400">
              Interactive Examples
            </span>
            <div className="flex flex-wrap gap-1">
              {EXAMPLES.map((ex, idx) => (
                <button
                  key={ex.id}
                  onClick={() => setActiveExampleIndex(idx)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeExampleIndex === idx
                      ? 'bg-sky-100 text-sky-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {ex.icon}
                  <span>{ex.category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Goal Display */}
          <div className="mb-5">
            <span className="text-xs font-medium text-stone-500">Goal:</span>
            <p className="text-lg sm:text-xl font-semibold text-stone-900 mt-0.5">
              {activeExample.goal}
            </p>
          </div>

          {/* System Breakdown Stages */}
          <div className="mb-6">
            <span className="text-xs font-medium text-stone-500">
              Let'sAct transforms it into:
            </span>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm font-medium text-stone-800">
              {activeExample.stages.map((stg, i) => (
                <React.Fragment key={stg}>
                  <span className="px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200/80 text-sky-900 text-xs sm:text-sm">
                    {stg}
                  </span>
                  {i < activeExample.stages.length - 1 && (
                    <span className="text-stone-300 text-xs">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Today's Actions Preview */}
          <div className="border-t border-stone-100 pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                Clear Next Actions
              </span>
              <button
                onClick={() => onStartBuilding(activeExample.goal)}
                className="text-xs text-sky-700 hover:text-sky-800 font-medium hover:underline"
              >
                Use this system template →
              </button>
            </div>
            <ul className="space-y-2.5">
              {activeExample.actions.map((act) => (
                <li
                  key={act.title}
                  className="flex items-center justify-between gap-3 text-sm text-stone-800 bg-stone-50/60 hover:bg-stone-50 px-3 py-2 rounded-xl border border-stone-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full border border-stone-300 flex items-center justify-center text-[10px] text-transparent">
                      ✓
                    </div>
                    <span>{act.title}</span>
                  </div>
                  <span className="text-xs text-stone-600 shrink-0 font-medium font-mono">
                    {act.duration}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom prompt to build */}
        <div className="mt-10">
          <button
            id="landing-bottom-cta"
            onClick={() => onStartBuilding()}
            className="px-7 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-base transition-colors inline-flex items-center gap-2"
          >
            <span>Start with your own goal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
