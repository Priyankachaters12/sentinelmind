import React, { useState } from 'react';
import { X, FileText, CheckCircle2, AlertTriangle, Info, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead or of hurting yourself in some way"
];

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen"
];

const OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" }
];

export default function AssessmentModal({ isOpen, onClose, onSuccess }) {
  const { fetchWithAuth } = useAuth();
  const [testType, setTestType] = useState('PHQ-9'); // 'PHQ-9' or 'GAD-7'
  const questions = testType === 'PHQ-9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS;

  const [answers, setAnswers] = useState(Array(questions.length).fill(0));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTypeSwitch = (type) => {
    setTestType(type);
    const newLen = type === 'PHQ-9' ? 9 : 7;
    setAnswers(Array(newLen).fill(0));
  };

  const handleSelect = (qIdx, val) => {
    const updated = [...answers];
    updated[qIdx] = val;
    setAnswers(updated);
  };

  const totalScore = answers.reduce((a, b) => a + b, 0);

  const getSeverity = () => {
    if (testType === 'PHQ-9') {
      if (totalScore <= 4) return { label: 'Minimal / None', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      if (totalScore <= 9) return { label: 'Mild Symptoms', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      if (totalScore <= 14) return { label: 'Moderate Symptoms', color: 'text-orange-700 bg-orange-50 border-orange-200' };
      if (totalScore <= 19) return { label: 'Moderately Severe', color: 'text-rose-700 bg-rose-50 border-rose-200' };
      return { label: 'Severe Symptoms', color: 'text-rose-800 bg-rose-100 border-rose-300' };
    } else {
      if (totalScore <= 4) return { label: 'Minimal Anxiety', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      if (totalScore <= 9) return { label: 'Mild Anxiety', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      if (totalScore <= 14) return { label: 'Moderate Anxiety', color: 'text-orange-700 bg-orange-50 border-orange-200' };
      return { label: 'Severe Anxiety', color: 'text-rose-800 bg-rose-100 border-rose-300' };
    }
  };

  const severity = getSeverity();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetchWithAuth('/api/assessments', {
        method: 'POST',
        body: JSON.stringify({
          type: testType,
          responses: answers
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit assessment');
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
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Standardized Clinical Screening</h3>
              <p className="text-xs text-slate-500">Over the last 2 weeks, how often have you been bothered by:</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Screening Type Selector Tabs */}
        <div className="flex items-center px-6 pt-4 space-x-2 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => handleTypeSwitch('PHQ-9')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              testType === 'PHQ-9'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            PHQ-9 (Depression Screening)
          </button>
          <button
            type="button"
            onClick={() => handleTypeSwitch('GAD-7')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              testType === 'GAD-7'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            GAD-7 (Anxiety Screening)
          </button>

          <div className="ml-auto flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-semibold">Live Score:</span>
            <span className="font-mono text-sm font-black text-indigo-950 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
              {totalScore} / {testType === 'PHQ-9' ? 27 : 21}
            </span>
          </div>
        </div>

        {/* Questionnaire Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {questions.map((question, qIdx) => (
              <div key={qIdx} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
                <p className="text-xs font-semibold text-slate-800 leading-snug">
                  {qIdx + 1}. {question}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {OPTIONS.map(opt => {
                    const isSelected = answers[qIdx] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(qIdx, opt.value)}
                        className={`p-2 rounded-lg text-xs font-medium text-center border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-semibold'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div>{opt.label}</div>
                        <div className="text-[10px] opacity-70">({opt.value} pts)</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Severity Band Box */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${severity.color}`}>
            <div>
              <div className="text-xs uppercase tracking-wider font-bold">Calculated Severity Band</div>
              <div className="text-base font-extrabold">{severity.label}</div>
            </div>
            <div className="text-2xl font-black font-mono">
              {totalScore}
            </div>
          </div>

          {/* Responsible AI Disclaimer */}
          <div className="flex items-start space-x-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs leading-relaxed">
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-amber-700" />
            <p>
              <strong>Clinical Screening Disclaimer:</strong> PHQ-9 and GAD-7 are validated screening instruments to measure symptom frequency over time. SentinelMind incorporates them into multi-modal distress forecasting, not clinical diagnoses.
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
              disabled={submitting}
              className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Updating AI...' : 'Submit & Recalculate Risk'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
