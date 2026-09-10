import React from 'react';
import { PhoneCall, MessageSquare, ShieldAlert, HeartHandshake } from 'lucide-react';

export default function CrisisBanner({ riskLevel, openAlertSender }) {
  const isUrgent = riskLevel === 'high' || riskLevel === 'critical';

  return (
    <div className={`rounded-2xl p-4 sm:p-5 border transition-all ${
      isUrgent 
        ? 'bg-rose-50/90 border-rose-200 shadow-sm shadow-rose-100' 
        : 'bg-teal-50/60 border-teal-100'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-xl shrink-0 ${isUrgent ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-700'}`}>
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                {isUrgent ? 'Need immediate support? Help is available 24/7' : '24/7 Free & Confidential Support Resources'}
              </h4>
              {isUrgent && (
                <span className="bg-rose-600 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-full animate-pulse">
                  Urgent
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              SentinelMind is an AI screening tool, not a human therapist. If you or someone you know is in distress, connect with hotlines or notify emergency contacts:
            </p>
          </div>
        </div>

        {/* Hotlines and Alert action bar */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 w-full sm:w-auto">
          {openAlertSender && (
            <button
              onClick={openAlertSender}
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-xs transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Send SOS Alert</span>
            </button>
          )}

          <a
            href="tel:988"
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 988</span>
          </a>

          <a
            href="sms:741741?body=HOME"
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Text 741741</span>
          </a>
        </div>

      </div>
    </div>
  );
}
