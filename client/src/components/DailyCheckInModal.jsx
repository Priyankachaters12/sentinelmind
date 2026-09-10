import React, { useState } from 'react';
import { X, Calendar, Smile, Zap, Moon, Users, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DailyCheckInModal({ isOpen, onClose, onSuccess }) {
  const { fetchWithAuth } = useAuth();

  const [metrics, setMetrics] = useState({
    mood: 5,
    stress: 5,
    anxiety: 5,
    sleep: 6,
    energy: 5,
    social: 5,
    note: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setMetrics(prev => ({ ...prev, [field]: Number(val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetchWithAuth('/api/checkins', {
        method: 'POST',
        body: JSON.stringify(metrics)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit check-in');
      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const items = [
    { key: 'mood', label: 'Mood Balance', minDesc: '1 (Very Low / Sad)', maxDesc: '10 (Joyful / Content)', color: 'accent-emerald-600' },
    { key: 'stress', label: 'Stress / Pressure', minDesc: '1 (Completely Calm)', maxDesc: '10 (Overwhelmed)', color: 'accent-orange-600' },
    { key: 'anxiety', label: 'Anxiety / Restlessness', minDesc: '1 (Peaceful)', maxDesc: '10 (Panic / High Tension)', color: 'accent-rose-600' },
    { key: 'sleep', label: 'Sleep Quality', minDesc: '1 (Insomnia / Exhausted)', maxDesc: '10 (Deep Rest)', color: 'accent-indigo-600' },
    { key: 'energy', label: 'Physical Energy', minDesc: '1 (Drained)', maxDesc: '10 (Vibrant)', color: 'accent-teal-600' },
    { key: 'social', label: 'Social Connection', minDesc: '1 (Isolated / Alone)', maxDesc: '10 (Deeply Connected)', color: 'accent-cyan-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Daily Mental Check-In</h3>
              <p className="text-xs text-slate-500">6 core wellness dimensions to build longitudinal time-series</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {items.map(({ key, label, minDesc, maxDesc, color }) => (
              <div key={key} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-800">{label}</span>
                  <span className="font-mono font-extrabold text-teal-700 text-base bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                    {metrics[key]} / 10
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="10"
                  value={metrics[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${color}`}
                />

                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>{minDesc}</span>
                  <span>{maxDesc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Optional context note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Context Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Had exams today, stayed up late studying..."
              value={metrics.note}
              onChange={(e) => setMetrics(prev => ({ ...prev, note: e.target.value }))}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-500/20 disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              {submitting ? (
                <span>Predicting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Prediction</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
