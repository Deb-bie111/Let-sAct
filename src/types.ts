export type ActionRecurrence = 'none' | 'daily' | 'weekdays' | 'weekly';

export interface SystemAction {
  id: string;
  stageId: string;
  systemId: string;
  title: string;
  dueDate?: string; // ISO date string YYYY-MM-DD
  estimatedMinutes?: number;
  recurrence?: ActionRecurrence;
  completed: boolean;
  completedAt?: string;
  order: number;
}

export interface SystemStage {
  id: string;
  systemId: string;
  name: string;
  order: number;
  actions: SystemAction[];
}

export interface System {
  id: string;
  title: string;
  category: string;
  why?: string;
  timeframe?: string;
  createdAt: string;
  updatedAt: string;
  stages: SystemStage[];
  status: 'active' | 'archived';
}

export type AppView = 'landing' | 'today' | 'systems' | 'system-detail' | 'builder';

export interface SmartRecommendation {
  action: SystemAction;
  system: System;
  stage: SystemStage;
  reason: string;
  urgency: 'high' | 'medium' | 'normal';
}

export interface GoalInput {
  title: string;
  why?: string;
  timeframe?: string;
  category?: string;
}
