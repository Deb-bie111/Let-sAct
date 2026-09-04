import { System, SystemAction, SystemStage } from './types';
import { INITIAL_SYSTEMS } from './data/initialSystems';

const STORAGE_KEY = 'system_builder_systems_v2';
const ONBOARDED_KEY = 'system_builder_onboarded_v2';

export function loadSystems(): System[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check if old v1 exists and contains the student exams system
      const oldRaw = localStorage.getItem('system_builder_systems_v1');
      if (oldRaw && !oldRaw.includes('sys-exams') && !oldRaw.includes('COS 222')) {
        try {
          const parsedOld = JSON.parse(oldRaw);
          if (Array.isArray(parsedOld) && parsedOld.length > 0) {
            saveSystems(parsedOld);
            return parsedOld;
          }
        } catch {}
      }
      saveSystems(INITIAL_SYSTEMS);
      return INITIAL_SYSTEMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // If user had previous student demo systems saved, cleanly upgrade to versatile systems
      const hasStudentDemo = parsed.some(
        (s: System) => s.id === 'sys-exams' || s.title?.toLowerCase().includes('exam')
      );
      if (hasStudentDemo) {
        saveSystems(INITIAL_SYSTEMS);
        return INITIAL_SYSTEMS;
      }
      return parsed;
    }
    return INITIAL_SYSTEMS;
  } catch (err) {
    console.warn('Failed to load systems from localStorage, using defaults', err);
    return INITIAL_SYSTEMS;
  }
}

export function saveSystems(systems: System[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(systems));
  } catch (err) {
    console.error('Failed to save systems to localStorage', err);
  }
}

export function resetToDemoSystems(): System[] {
  saveSystems(INITIAL_SYSTEMS);
  return INITIAL_SYSTEMS;
}

export function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setCompletedOnboarding(completed: boolean): void {
  try {
    localStorage.setItem(ONBOARDED_KEY, completed ? 'true' : 'false');
  } catch {}
}

export function calculateSystemProgress(system: System): number {
  let totalActions = 0;
  let completedActions = 0;

  for (const stage of system.stages) {
    for (const act of stage.actions) {
      totalActions += 1;
      if (act.completed) {
        completedActions += 1;
      }
    }
  }

  if (totalActions === 0) return 0;
  return Math.round((completedActions / totalActions) * 100);
}

export function getActiveActionsCount(system: System): number {
  let count = 0;
  for (const stage of system.stages) {
    for (const act of stage.actions) {
      if (!act.completed) count += 1;
    }
  }
  return count;
}
