import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Send, Tag, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function JournalModal({ isOpen, onClose, onSuccess }) {
  const { fetchWithAuth } = useAuth();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePreviewAnalysis = async () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetchWithAuth('/api/journals/preview', {
        method: 'POST',
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setPreview(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetchWithAuth('/api/journals', {
        method: 'POST',
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save journal');
      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-slate-800 text-white">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Journal & NLP Reflection</h3>
              <p className="text-xs text-slate-500">Unstructured text processed into sentiment & emotional signals</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Express your feelings freely:
              </label>
              <button
                type="button"
                onClick={handlePreviewAnalysis}
                disabled={analyzing || !text.trim()}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 flex items-center space-x-1 disabled:opacity-40"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{analyzing ? 'Analyzing...' : 'Preview NLP Signals'}</span>
              </button>
            </div>

            <textarea
              rows={5}
              placeholder="e.g., I have been feeling very stressed lately and I don't feel connected to anyone at work..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full text-sm p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
              required
            />
          </div>

          {/* NLP Live Inspection Result */}
          {preview && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>NLP Feature Extraction</span>
                </span>
                <span className="font-mono text-slate-900 font-bold">
                  Sentiment: {preview.sentiment > 0 ? `+${preview.sentiment}` : preview.sentiment}
                </span>
              </div>

              {/* Detected Emotion Signals */}
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(preview.emotions || {}).map(([emo, score]) => (
                  <span
                    key={emo}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border capitalize ${
                      score > 0.3 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : score > 0 
                        ? 'bg-slate-100 text-slate-700 border-slate-200' 
                        : 'bg-white text-slate-400 border-slate-100'
                    }`}
                  >
                    {emo}: {Math.round(score * 100)}%
                  </span>
                ))}
              </div>

              <div className="text-[11px] text-slate-500">
                Emotional intensity: <strong>{Math.round((preview.intensity || 0) * 100)}%</strong> • Dominant signal: <strong className="capitalize">{preview.dominant_emotion}</strong>
              </div>
            </div>
          )}

          {/* Guidance disclaimer */}
          <div className="flex items-start space-x-2 text-[11px] text-slate-400">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <p>
              NLP signals serve as continuous supportive variables in feature engineering, not evidence of a clinical disorder.
            </p>
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
              disabled={submitting || !text.trim()}
              className="px-5 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Analyzing...' : 'Save & Update Distress AI'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
