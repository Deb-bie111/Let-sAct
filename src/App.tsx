import React, { useState, useEffect } from 'react';
import { AppView, System, SystemAction, SystemStage } from './types';
import { loadSystems, saveSystems, resetToDemoSystems } from './storage';
import { Navigation } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { TodayView } from './components/TodayView';
import { SystemsList } from './components/SystemsList';
import { SystemDetail } from './components/SystemDetail';
import { SystemBuilderWizard } from './components/SystemBuilderWizard';
import { SmartNextMoveModal } from './components/SmartNextMoveModal';
import { ActionTimerModal } from './components/ActionTimerModal';

export default function App() {
  const [systems, setSystems] = useState<System[]>(() => loadSystems());
  const [currentView, setCurrentView] = useState<AppView>('today');
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [prefillGoal, setPrefillGoal] = useState<string>('');

  // Smart "What Should I Do?" modal state
  const [isSmartModalOpen, setIsSmartModalOpen] = useState(false);

  // Focus Timer modal state
  const [focusModalState, setFocusModalState] = useState<{
    isOpen: boolean;
    action: SystemAction | null;
    system: System | null;
    stage: SystemStage | null;
  }>({
    isOpen: false,
    action: null,
    system: null,
    stage: null,
  });

  // Calculate active today actions count for badge
  const todayCount = React.useMemo(() => {
    let count = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    for (const sys of systems) {
      if (sys.status !== 'active') continue;
      for (const stg of sys.stages) {
        for (const act of stg.actions) {
          if (!act.completed) {
            if (
              act.dueDate === todayStr ||
              act.recurrence === 'daily' ||
              stg.order === 0
            ) {
              count += 1;
            }
          }
        }
      }
    }
    return count;
  }, [systems]);

  // Persist systems changes
  const updateSystemsState = (newSystems: System[]) => {
    setSystems(newSystems);
    saveSystems(newSystems);
  };

  // Toggle action completion
  const handleToggleAction = (systemId: string, actionId: string) => {
    const updated = systems.map((sys) => {
      if (sys.id !== systemId) return sys;
      return {
        ...sys,
        stages: sys.stages.map((stg) => ({
          ...stg,
          actions: stg.actions.map((act) => {
            if (act.id !== actionId) return act;
            const newCompleted = !act.completed;
            return {
              ...act,
              completed: newCompleted,
              completedAt: newCompleted ? new Date().toISOString() : undefined,
            };
          }),
        })),
        updatedAt: new Date().toISOString(),
      };
    });
    updateSystemsState(updated);
  };

  // Update a single system
  const handleUpdateSystem = (updatedSystem: System) => {
    const updated = systems.map((s) => (s.id === updatedSystem.id ? updatedSystem : s));
    updateSystemsState(updated);
  };

  // Delete a system
  const handleDeleteSystem = (systemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this system?')) return;
    const updated = systems.filter((s) => s.id !== systemId);
    updateSystemsState(updated);
    if (selectedSystemId === systemId) {
      setSelectedSystemId(null);
      setCurrentView('systems');
    }
  };

  // Reset to demo systems
  const handleResetDemo = () => {
    if (confirm('Reset to the initial example systems? (Deliver project milestone, workout habit, team operations, etc.)')) {
      const reset = resetToDemoSystems();
      setSystems(reset);
      setCurrentView('today');
    }
  };

  // Start building new system
  const handleStartBuilding = (initialGoal?: string) => {
    setPrefillGoal(initialGoal || '');
    setCurrentView('builder');
  };

  // Save newly built system
  const handleSaveNewSystem = (newSystem: System) => {
    const updated = [newSystem, ...systems];
    updateSystemsState(updated);
    setSelectedSystemId(newSystem.id);
    setCurrentView('today');
  };

  // Select system to view detail
  const handleSelectSystem = (systemId: string) => {
    setSelectedSystemId(systemId);
    setCurrentView('system-detail');
  };

  // Start focus timer on an action
  const handleStartFocusTimer = (action: SystemAction, system: System, stage: SystemStage) => {
    setFocusModalState({
      isOpen: true,
      action,
      system,
      stage,
    });
  };

  const selectedSystem = systems.find((s) => s.id === selectedSystemId);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col antialiased">
      {/* Navigation bar (Desktop header & Mobile bottom bar) */}
      <Navigation
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'builder') {
            handleStartBuilding();
          } else {
            setCurrentView(view);
          }
        }}
        onResetDemo={handleResetDemo}
        todayCount={todayCount}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full">
        {currentView === 'landing' && (
          <LandingPage
            onStartBuilding={(goal) => handleStartBuilding(goal)}
            onGoToToday={() => setCurrentView('today')}
            onGoToSystems={() => setCurrentView('systems')}
          />
        )}

        {currentView === 'today' && (
          <TodayView
            systems={systems}
            onToggleAction={handleToggleAction}
            onOpenSmartNextMove={() => setIsSmartModalOpen(true)}
            onOpenSystem={handleSelectSystem}
            onBuildFirstSystem={() => handleStartBuilding()}
            onStartBuilding={(goal) => handleStartBuilding(goal)}
            onStartActionTimer={handleStartFocusTimer}
          />
        )}

        {currentView === 'systems' && (
          <SystemsList
            systems={systems}
            onSelectSystem={handleSelectSystem}
            onBuildNewSystem={() => handleStartBuilding()}
            onDeleteSystem={handleDeleteSystem}
          />
        )}

        {currentView === 'system-detail' && selectedSystem && (
          <SystemDetail
            system={selectedSystem}
            onBack={() => setCurrentView('systems')}
            onUpdateSystem={handleUpdateSystem}
            onToggleAction={handleToggleAction}
          />
        )}

        {currentView === 'builder' && (
          <SystemBuilderWizard
            onCancel={() => setCurrentView('today')}
            onSaveSystem={handleSaveNewSystem}
            prefillGoal={prefillGoal}
          />
        )}
      </main>

      {/* Smart "What Should I Do Next?" signature modal */}
      <SmartNextMoveModal
        isOpen={isSmartModalOpen}
        onClose={() => setIsSmartModalOpen(false)}
        systems={systems}
        onToggleAction={handleToggleAction}
        onStartActionTimer={handleStartFocusTimer}
      />

      {/* Focus Timer Modal */}
      <ActionTimerModal
        isOpen={focusModalState.isOpen}
        onClose={() =>
          setFocusModalState({ isOpen: false, action: null, system: null, stage: null })
        }
        action={focusModalState.action}
        system={focusModalState.system}
        stage={focusModalState.stage}
        onMarkDone={handleToggleAction}
      />
    </div>
  );
}
