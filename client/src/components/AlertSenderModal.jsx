import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Send, 
  Mail, 
  Phone, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function AlertSenderModal({ isOpen, onClose, distressRisk }) {
  const { user, fetchWithAuth } = useAuth();
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [alertType, setAlertType] = useState('both'); // 'both', 'email', 'sms'
  const [customNote, setCustomNote] = useState("I am currently experiencing elevated distress and would appreciate a check-in.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  if (!isOpen) return null;

  const handleSendAlert = async (e) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      setError('Please provide recipient contact name.');
      return;
    }
    if (!recipientEmail.trim() && !recipientPhone.trim()) {
      setError('Please provide at least an email address or phone number.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetchWithAuth('/api/alerts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          recipientEmail: recipientEmail.trim(),
          recipientPhone: recipientPhone.trim(),
          alertType,
          customNote: customNote.trim(),
          distressScore: distressRisk?.score || 0,
          riskLevel: distressRisk?.risk_level || 'unknown'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessResult(data);
      } else {
        throw new Error(data.error || 'Failed to dispatch alert notification.');
      }
    } catch (err) {
      console.error('Alert error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessResult(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Send Distress Alert</h3>
              <p className="text-[11px] text-slate-500">Dispatch instant Email & SMS alert to trusted contacts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Distress Snapshot Badge */}
        {distressRisk && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
              <span className="text-xs font-bold text-rose-900">Current Distress Risk:</span>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-mono">
              {distressRisk.score} / 100 ({distressRisk.risk_level?.toUpperCase()})
            </span>
          </div>
        )}

        {/* Success Confirmation View */}
        {successResult ? (
          <div className="py-4 space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-lg">Alert Dispatched Successfully!</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                {successResult.message}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1.5 text-xs font-mono text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Dispatch ID:</span>
                <span className="font-bold text-slate-900">{successResult.dispatchId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-bold text-slate-900">{successResult.details?.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time:</span>
                <span className="text-slate-800">{new Date(successResult.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSendAlert} className="space-y-4">

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recipient Contact Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Johnson / Mom / Trusted Friend"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="contact@example.com"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Mobile / SMS
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Alert Channel Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dispatch Notification Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAlertType('both')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    alertType === 'both'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Email & SMS
                </button>
                <button
                  type="button"
                  onClick={() => setAlertType('email')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    alertType === 'email'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Email Only
                </button>
                <button
                  type="button"
                  onClick={() => setAlertType('sms')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    alertType === 'sms'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  SMS Only
                </button>
              </div>
            </div>

            {/* Personal SOS Message Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Message / SOS Note
              </label>
              <textarea
                rows={3}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Include a personalized note for your contact..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Dispatching Alert...' : 'Send Emergency Alert'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
