import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  ShieldAlert, 
  Calendar, 
  BookOpen, 
  FileText, 
  Wind, 
  LogOut, 
  Menu, 
  X, 
  PhoneCall, 
  Sparkles,
  User,
  Smartphone
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  openCheckIn, 
  openJournal, 
  openAssessment, 
  openGrounding,
  openAlertSender,
  distressRisk 
}) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'moderate': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'critical': return 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Sentinel<span className="text-teal-600">Mind</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                  AI Dynamic Risk
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">Predictive Mental Wellness System</p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'history' 
                  ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Longitudinal History
            </button>
            <button
              onClick={openGrounding}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center space-x-1.5"
            >
              <Wind className="w-4 h-4 text-teal-600" />
              <span>4-7-8 Breath</span>
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="hidden lg:flex items-center space-x-2.5">
            {/* Real-time Risk Level indicator badge */}
            {distressRisk && (
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(distressRisk.risk_level)}`}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                <span>Distress: {distressRisk.score} ({distressRisk.risk_level?.toUpperCase()})</span>
              </div>
            )}

            {/* Quick action buttons */}
            <button
              onClick={openCheckIn}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Check-In</span>
            </button>

            <button
              onClick={openJournal}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Journal</span>
            </button>

            <button
              onClick={openAssessment}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold flex items-center space-x-1.5 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Screening</span>
            </button>

            {/* Send Distress Alert button */}
            <button
              onClick={openAlertSender}
              className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center space-x-1.5 transition-all active:scale-95 shadow-xs"
              title="Send Emergency Distress Alert via Email & SMS"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Send Alert</span>
            </button>

            {/* User profile and logout */}
            <div className="flex items-center pl-2 border-l border-slate-200 space-x-2">
              <span className="text-xs font-medium text-slate-600 max-w-[120px] truncate" title={user?.name}>
                {user?.name || 'User'}
              </span>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={openAlertSender}
              className="p-1.5 rounded-lg text-rose-700 bg-rose-50 border border-rose-200 text-xs font-bold flex items-center space-x-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send Alert</span>
            </button>
            {distressRisk && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getRiskColor(distressRisk.risk_level)}`}>
                {distressRisk.score}
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-sm font-semibold text-center border ${
                activeTab === 'dashboard' ? 'bg-teal-50 border-teal-300 text-teal-800' : 'bg-slate-50 text-slate-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-sm font-semibold text-center border ${
                activeTab === 'history' ? 'bg-teal-50 border-teal-300 text-teal-800' : 'bg-slate-50 text-slate-700'
              }`}
            >
              History & Trends
            </button>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <button
              onClick={() => { openCheckIn(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-semibold"
            >
              <span className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Submit Daily Check-In</span>
              </span>
              <span className="text-xs bg-teal-700 px-2 py-0.5 rounded">6 Parameters</span>
            </button>

            <button
              onClick={() => { openJournal(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-800 text-white text-sm font-semibold"
            >
              <span className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Write Journal Entry</span>
              </span>
              <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">NLP Analysis</span>
            </button>

            <button
              onClick={() => { openAssessment(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm font-semibold"
            >
              <span className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>PHQ-9 & GAD-7 Screening</span>
              </span>
              <span className="text-xs bg-indigo-100 px-2 py-0.5 rounded">Standardized</span>
            </button>

            <button
              onClick={() => { openGrounding(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold"
            >
              <span className="flex items-center space-x-2">
                <Wind className="w-4 h-4" />
                <span>4-7-8 Breathing Grounding</span>
              </span>
              <span className="text-xs bg-emerald-100 px-2 py-0.5 rounded">Live Tool</span>
            </button>

            <button
              onClick={() => { openAlertSender(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold"
            >
              <span className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Send Emergency Distress Alert</span>
              </span>
              <span className="text-xs bg-rose-100 text-rose-900 px-2 py-0.5 rounded">Email & SMS</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
              <User className="w-4 h-4 text-teal-600" />
              <span>{user?.name || user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="text-xs text-rose-600 font-semibold flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
