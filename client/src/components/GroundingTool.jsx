import React, { useState, useEffect } from 'react';
import { X, Wind, Play, Pause, RotateCcw } from 'lucide-react';

export default function GroundingTool({ isOpen, onClose }) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('Ready'); // 'Inhale', 'Hold', 'Exhale'
  const [countdown, setCountdown] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let timer;
    if (isActive) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            // Transition phases
            if (phase === 'Inhale') {
              setPhase('Hold');
              return 7;
            } else if (phase === 'Hold') {
              setPhase('Exhale');
              return 8;
            } else {
              setPhase('Inhale');
              setCycleCount(c => c + 1);
              return 4;
            }
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phase]);

  const startExercise = () => {
    setIsActive(true);
    setPhase('Inhale');
    setCountdown(4);
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const resetExercise = () => {
    setIsActive(false);
    setPhase('Ready');
    setCountdown(4);
    setCycleCount(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col items-center text-center p-6 space-y-6">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <Wind className="w-5 h-5" />
            </span>
            <div className="text-left">
              <h3 className="font-bold text-slate-900 text-base">4-7-8 Somatic Grounding</h3>
              <p className="text-[11px] text-slate-500">Vagal nerve stimulation for acute stress</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Breathing Circle Container */}
        <div className="relative w-56 h-56 flex items-center justify-center my-4">
          {/* Animated Background Ring */}
          <div 
            className={`absolute inset-0 rounded-full transition-all duration-1000 ease-in-out ${
              phase === 'Inhale' 
                ? 'bg-teal-500/20 scale-125 border-4 border-teal-400' 
                : phase === 'Hold' 
                ? 'bg-indigo-500/20 scale-125 border-4 border-indigo-400 animate-pulse' 
                : phase === 'Exhale'
                ? 'bg-slate-400/20 scale-95 border-2 border-slate-300'
                : 'bg-teal-50 border-2 border-teal-200'
            }`}
          />

          {/* Central Counter */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <span className="text-xs uppercase tracking-widest font-extrabold text-teal-800">
              {phase === 'Ready' ? 'Click Start' : phase}
            </span>
            <span className="text-5xl font-black font-mono text-slate-900 my-1">
              {countdown}
            </span>
            <span className="text-[11px] text-slate-500">
              Seconds
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-slate-600 max-w-xs leading-relaxed">
          {phase === 'Inhale' && 'Breathe in quietly through your nose...'}
          {phase === 'Hold' && 'Hold your breath gently. Relax your shoulders...'}
          {phase === 'Exhale' && 'Exhale completely through your mouth with a gentle whoosh...'}
          {phase === 'Ready' && '4 seconds inhale • 7 seconds hold • 8 seconds exhale'}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center space-x-3">
          {!isActive ? (
            <button
              onClick={startExercise}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{phase === 'Ready' ? 'Start Exercise' : 'Resume'}</span>
            </button>
          ) : (
            <button
              onClick={pauseExercise}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={resetExercise}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {cycleCount > 0 && (
          <div className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Completed {cycleCount} breath cycle{cycleCount > 1 ? 's' : ''}
          </div>
        )}

      </div>
    </div>
  );
}
