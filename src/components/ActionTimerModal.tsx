import React, { useState, useEffect } from 'react';
import { System, SystemAction, SystemStage } from '../types';
import { X, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';

interface ActionTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: SystemAction | null;
  system: System | null;
  stage: SystemStage | null;
  onMarkDone: (systemId: string, actionId: string) => void;
}

export const ActionTimerModal: React.FC<ActionTimerModalProps> = ({
  isOpen,
  onClose,
  action,
  system,
  stage,
  onMarkDone,
}) => {
  const defaultMinutes = action?.estimatedMinutes || 25;
  const [secondsRemaining, setSecondsRemaining] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (action) {
      setSecondsRemaining((action.estimatedMinutes || 25) * 60);
      setIsRunning(true);
    }
  }, [action]);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsRemaining]);

  if (!isOpen || !action || !system || !stage) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleFinish = () => {
    onMarkDone(system.id, action.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl border border-stone-200 p-8 shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Small system context */}
        <div className="text-xs uppercase tracking-wider font-semibold text-sky-800 mb-1">
          {system.category} · {stage.name}
        </div>

        {/* Task Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
          {action.title}
        </h3>

        {/* Large Timer Display */}
        <div className="my-8 py-6 rounded-2xl bg-stone-50 border border-stone-200/80">
          <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-stone-900">
            {formattedTime}
          </div>
          <p className="mt-2 text-xs text-stone-500">
            {isRunning ? 'Focus on this single action right now' : 'Timer paused'}
          </p>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium transition-colors"
            title={isRunning ? 'Pause' : 'Resume'}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <button
            onClick={() => {
              setSecondsRemaining((action.estimatedMinutes || 25) * 60);
              setIsRunning(false);
            }}
            className="p-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleFinish}
            className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark as Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
