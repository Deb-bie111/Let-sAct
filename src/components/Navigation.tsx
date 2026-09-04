import React from 'react';
import { AppView } from '../types';
import { Sun, Layers, PlusCircle, Compass, RotateCcw } from 'lucide-react';

interface NavigationProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onResetDemo: () => void;
  todayCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  onResetDemo,
  todayCount,
}) => {
  return (
    <>
      {/* Desktop Header */}
      <header
        id="desktop-navigation-header"
        className="sticky top-0 z-40 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/80 transition-colors"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <button
              id="brand-home-button"
              onClick={() => onNavigate('landing')}
              className="group flex items-center space-x-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-stone-50 flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-sky-700 transition-colors">
                LA
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-stone-900 tracking-tight text-base group-hover:text-sky-900 transition-colors">
                  Let'sAct
                </span>
                <span className="text-[11px] text-stone-500 -mt-0.5 tracking-wide hidden sm:inline">
                  Goal → System → Actions
                </span>
              </div>
            </button>

            {/* Desktop Nav Links */}
            <nav id="desktop-main-nav" className="hidden md:flex items-center space-x-1 pl-4 border-l border-stone-200">
              <button
                id="nav-today-btn"
                onClick={() => onNavigate('today')}
                className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentView === 'today'
                    ? 'text-stone-900 bg-stone-200/70'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-sky-600" />
                  Today
                  {todayCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[11px] font-semibold rounded-full bg-sky-100 text-sky-900 border border-sky-300">
                      {todayCount}
                    </span>
                  )}
                </span>
              </button>

              <button
                id="nav-systems-btn"
                onClick={() => onNavigate('systems')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentView === 'systems' || currentView === 'system-detail'
                    ? 'text-stone-900 bg-stone-200/70'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-stone-500" />
                  My Systems
                </span>
              </button>

              <button
                id="nav-landing-toggle"
                onClick={() => onNavigate('landing')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentView === 'landing'
                    ? 'text-stone-900 bg-stone-200/70'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-stone-400" />
                  How It Works
                </span>
              </button>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2.5">
            <button
              id="reset-demo-data-btn"
              onClick={onResetDemo}
              title="Reset to example systems"
              className="hidden lg:flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 px-2.5 py-1.5 rounded-md hover:bg-stone-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
              Reset Examples
            </button>

            <button
              id="header-build-system-btn"
              onClick={() => onNavigate('builder')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
                currentView === 'builder'
                  ? 'bg-stone-900 text-stone-50 hover:bg-stone-800'
                  : 'bg-sky-600 text-white hover:bg-sky-700'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Build System</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div
        id="mobile-bottom-navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-50/95 backdrop-blur-md border-t border-stone-200/80 px-4 py-2"
      >
        <div className="grid grid-cols-3 gap-1 max-w-sm mx-auto">
          <button
            id="mobile-nav-today-btn"
            onClick={() => onNavigate('today')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
              currentView === 'today'
                ? 'text-sky-700 bg-sky-50 font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <div className="relative">
              <Sun className="w-5 h-5 mb-0.5" />
              {todayCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {todayCount}
                </span>
              )}
            </div>
            <span className="text-[11px] leading-tight">Today</span>
          </button>

          <button
            id="mobile-nav-systems-btn"
            onClick={() => onNavigate('systems')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
              currentView === 'systems' || currentView === 'system-detail'
                ? 'text-stone-900 bg-stone-200/60 font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight">Systems</span>
          </button>

          <button
            id="mobile-nav-build-btn"
            onClick={() => onNavigate('builder')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
              currentView === 'builder'
                ? 'text-sky-800 bg-sky-100 font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <PlusCircle className="w-5 h-5 mb-0.5 text-sky-600" />
            <span className="text-[11px] leading-tight">Build</span>
          </button>
        </div>
      </div>
    </>
  );
};
