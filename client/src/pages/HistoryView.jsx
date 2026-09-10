import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, BookOpen, FileText, Sparkles, Clock, AlertCircle } from 'lucide-react';

export default function HistoryView() {
  const { fetchWithAuth } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('checkins');
  const [checkins, setCheckins] = useState([]);
  const [journals, setJournals] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllHistory = async () => {
      setLoading(true);
      try {
        const [cRes, jRes, aRes] = await Promise.all([
          fetchWithAuth('/api/checkins?limit=50'),
          fetchWithAuth('/api/journals'),
          fetchWithAuth('/api/assessments')
        ]);
        const cData = await cRes.json();
        const jData = await jRes.json();
        const aData = await aRes.json();
        setCheckins(cData.checkins || []);
        setJournals(jData.journals || []);
        setAssessments(aData.assessments || []);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllHistory();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Longitudinal History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Historical progression of daily check-ins, NLP journal reflections, and clinical screenings
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('checkins')}
            className={`px-3.5 py-2 rounded-lg transition-all ${
              activeSubTab === 'checkins' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Check-Ins ({checkins.length})
          </button>
          <button
            onClick={() => setActiveSubTab('journals')}
            className={`px-3.5 py-2 rounded-lg transition-all ${
              activeSubTab === 'journals' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Journals & NLP ({journals.length})
          </button>
          <button
            onClick={() => setActiveSubTab('assessments')}
            className={`px-3.5 py-2 rounded-lg transition-all ${
              activeSubTab === 'assessments' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Screenings ({assessments.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading longitudinal timeline...</div>
      ) : (
        <div>
          {/* Check-ins Tab */}
          {activeSubTab === 'checkins' && (
            <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-900 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Date & Time</th>
                      <th className="py-3.5 px-4 text-center">Mood</th>
                      <th className="py-3.5 px-4 text-center">Stress</th>
                      <th className="py-3.5 px-4 text-center">Anxiety</th>
                      <th className="py-3.5 px-4 text-center">Sleep</th>
                      <th className="py-3.5 px-4 text-center">Energy</th>
                      <th className="py-3.5 px-4 text-center">Social</th>
                      <th className="py-3.5 px-4">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {checkins.length > 0 ? (
                      checkins.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono font-medium text-slate-500 whitespace-nowrap">
                            {new Date(c.created_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {c.mood}/10
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-extrabold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                              {c.stress}/10
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              {c.anxiety}/10
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-800">{c.sleep}/10</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-800">{c.energy}/10</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-800">{c.social}/10</td>
                          <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">{c.note || '—'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          No check-ins recorded yet. Click "Daily Check-In" to log your first entry.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Journals Tab */}
          {activeSubTab === 'journals' && (
            <div className="space-y-4">
              {journals.length > 0 ? (
                journals.map((j) => (
                  <div key={j.id} className="glass-panel p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(j.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          Sentiment Polarity: {j.sentiment > 0 ? `+${j.sentiment}` : j.sentiment}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 capitalize">
                          Dominant: {j.dominant_emotion || 'neutral'}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                      {j.text}
                    </p>

                    {/* Detected Emotion Signal Tags */}
                    {j.emotions && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {Object.entries(j.emotions).map(([emo, score]) => (
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
                    )}
                  </div>
                ))
              ) : (
                <div className="glass-panel p-12 text-center text-slate-400 text-sm rounded-2xl border border-slate-200">
                  No journals recorded yet. Write your thoughts using the "Journal" action button.
                </div>
              )}
            </div>
          )}

          {/* Screenings Tab */}
          {activeSubTab === 'assessments' && (
            <div className="space-y-4">
              {assessments.length > 0 ? (
                assessments.map((a) => (
                  <div key={a.id} className="glass-panel p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 text-base">{a.type}</span>
                        <span className="text-xs font-medium text-slate-500 font-mono">
                          {new Date(a.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1">
                        Severity Band: <strong className="text-slate-900">{a.severity}</strong>
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Total Score</div>
                        <div className="text-2xl font-black font-mono text-indigo-900">
                          {a.score} <span className="text-xs text-slate-400 font-normal">/ {a.type === 'PHQ-9' ? 27 : 21}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-panel p-12 text-center text-slate-400 text-sm rounded-2xl border border-slate-200">
                  No assessments taken yet. Take a PHQ-9 or GAD-7 screening to establish symptom baseline.
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
