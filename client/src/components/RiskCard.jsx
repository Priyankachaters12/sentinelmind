import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  ShieldCheck, 
  Info,
  Clock
} from 'lucide-react';

export default function RiskCard({ distress, onRefresh }) {
  const score = distress?.score ?? 35;
  const level = distress?.risk_level || 'moderate';
  const trajectory = distress?.trajectory || 'stable';
  const lastUpdated = distress?.last_updated ? new Date(distress.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent';

  // Risk band styling
  const getTheme = () => {
    switch (level.toLowerCase()) {
      case 'low':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dialStroke: '#10b981',
          shadow: 'shadow-emerald-500/10',
          label: 'Low Distress Risk',
          subtext: 'Your current signals reflect stable emotional balance and healthy baseline functioning.'
        };
      case 'moderate':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-200',
          text: 'text-amber-700',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          dialStroke: '#f59e0b',
          shadow: 'shadow-amber-500/10',
          label: 'Moderate Distress Risk',
          subtext: 'Elevated stress or mild mood disruption detected. Recommended proactive coping routines.'
        };
      case 'high':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-200',
          text: 'text-orange-700',
          badge: 'bg-orange-100 text-orange-800 border-orange-300',
          dialStroke: '#f97316',
          shadow: 'shadow-orange-500/10',
          label: 'High Distress Risk',
          subtext: 'Pronounced anxiety or depressive symptom elevation detected. Prioritize grounding and supportive outreach.'
        };
      case 'critical':
        return {
          bg: 'bg-rose-500/10',
          border: 'border-rose-200',
          text: 'text-rose-700',
          badge: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse',
          dialStroke: '#f43f5e',
          shadow: 'shadow-rose-500/10',
          label: 'Critical Distress Risk',
          subtext: 'Significant distress levels detected across multiple metrics. Please consider connecting with professional care or 24/7 helplines.'
        };
      default:
        return {
          bg: 'bg-slate-500/10',
          border: 'border-slate-200',
          text: 'text-slate-700',
          badge: 'bg-slate-100 text-slate-800 border-slate-300',
          dialStroke: '#64748b',
          shadow: 'shadow-slate-500/10',
          label: 'Calibrating...',
          subtext: 'Collecting daily inputs to formulate distress estimation.'
        };
    }
  };

  const theme = getTheme();

  // Circular gauge calculations
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`glass-panel p-6 rounded-2xl border ${theme.border} shadow-sm ${theme.shadow} relative overflow-hidden transition-all`}>
      {/* Background ambient glow */}
      <div className={`absolute -right-12 -bottom-12 w-48 h-48 rounded-full ${theme.bg} blur-3xl -z-10 pointer-events-none`}></div>

      {/* Card Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <h2 className="font-bold text-slate-900 text-base sm:text-lg">Dynamic Distress Score</h2>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1 text-[11px] text-slate-500">
            <Clock className="w-3 h-3" />
            <span>Updated {lastUpdated}</span>
          </span>
        </div>
      </div>

      {/* Main Meter Area */}
      <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* SVG Circular Dial */}
        <div className="relative flex items-center justify-center">
          <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 140 140">
            {/* Background ring */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              className="stroke-slate-100"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Value ring */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke={theme.dialStroke}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Centered Score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {score}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              / 100
            </span>
          </div>
        </div>

        {/* Risk Classification and Trajectory details */}
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${theme.badge} uppercase tracking-wider`}>
              {theme.label}
            </span>

            {/* Trajectory pill */}
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              trajectory === 'worsening' 
                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                : trajectory === 'improving'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              {trajectory === 'worsening' && <TrendingUp className="w-3.5 h-3.5 text-rose-600" />}
              {trajectory === 'improving' && <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />}
              {trajectory === 'stable' && <Minus className="w-3.5 h-3.5 text-slate-500" />}
              <span className="capitalize">{trajectory} Trajectory</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            {theme.subtext}
          </p>

          {/* Risk Band Scale Legend */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
              <span>0 (Low)</span>
              <span>25 (Mod)</span>
              <span>50 (High)</span>
              <span>75-100 (Critical)</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div className="w-1/4 bg-emerald-400"></div>
              <div className="w-1/4 bg-amber-400"></div>
              <div className="w-1/4 bg-orange-400"></div>
              <div className="w-1/4 bg-rose-500"></div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Responsible AI Disclaimer */}
      <div className="pt-3 border-t border-slate-100 flex items-start space-x-2 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
        <p>
          Calculated via trained Random Forest ML combining longitudinal check-ins, standardized screening questionnaires, and NLP reflections. Project-defined indicator, not a clinical diagnosis.
        </p>
      </div>
    </div>
  );
}
