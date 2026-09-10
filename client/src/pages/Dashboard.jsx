import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import RiskCard from '../components/RiskCard';
import ExplainableAI from '../components/ExplainableAI';
import TrendCharts from '../components/TrendCharts';
import RecommendationList from '../components/RecommendationList';
import CrisisBanner from '../components/CrisisBanner';
import { 
  Plus, 
  Calendar, 
  BookOpen, 
  FileText, 
  Wind, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function Dashboard({ 
  openCheckIn, 
  openJournal, 
  openAssessment, 
  openGrounding,
  openAlertSender,
  dashboardData,
  loading,
  refreshDashboard
}) {
  const { user } = useAuth();

  const distress = dashboardData?.distress;
  const screenings = dashboardData?.screenings;
  const currentMetrics = dashboardData?.current_metrics;
  const timeline = dashboardData?.timeline || [];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hello, <span className="text-teal-600">{user?.name?.split(' ')[0] || 'Friend'}</span>
            </h1>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              Live Tracker
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Continuous multi-modal mental wellness monitoring & dynamic distress forecasting
          </p>
        </div>

        {/* Quick action triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openCheckIn}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 transition-all active:scale-95"
          >
            <Calendar className="w-4 h-4" />
            <span>Daily Check-In</span>
          </button>

          <button
            onClick={openJournal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>Journal</span>
          </button>

          <button
            onClick={openAssessment}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Screening</span>
          </button>

          <button
            onClick={refreshDashboard}
            title="Refresh AI Predictions"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Immediate Crisis Resources Banner */}
      <CrisisBanner riskLevel={distress?.risk_level} openAlertSender={openAlertSender} />

      {/* Top Row: Dynamic Risk Card & Explainable AI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <RiskCard distress={distress} onRefresh={refreshDashboard} />
        </div>
        <div className="lg:col-span-7">
          <ExplainableAI contributingFactors={distress?.contributing_factors} />
        </div>
      </div>

      {/* Middle Row: Longitudinal Trend Charts (Recharts) */}
      <div>
        <TrendCharts timeline={timeline} />
      </div>

      {/* Bottom Row: Supportive Recommendations & Clinical Screenings Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recommendations */}
        <div className="lg:col-span-8">
          <RecommendationList 
            recommendations={distress?.recommendations} 
            onOpenGrounding={openGrounding}
          />
        </div>

        {/* Standardized Screening Card (PHQ-9 & GAD-7) */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <FileText className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-slate-900 text-base">Standardized Screenings</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Instruments
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {/* PHQ-9 Item */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">PHQ-9 (Depression)</span>
                  <span className="font-mono font-black text-indigo-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {screenings?.phq9 ? `${screenings.phq9.score} / 27` : 'Not recorded'}
                  </span>
                </div>
                {screenings?.phq9 && (
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-600">{screenings.phq9.severity}</span>
                    {screenings.phq9.delta !== 0 && (
                      <span className={`font-bold flex items-center ${screenings.phq9.delta > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {screenings.phq9.delta > 0 ? `+${screenings.phq9.delta}` : screenings.phq9.delta} vs prev
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* GAD-7 Item */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">GAD-7 (Anxiety)</span>
                  <span className="font-mono font-black text-indigo-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {screenings?.gad7 ? `${screenings.gad7.score} / 21` : 'Not recorded'}
                  </span>
                </div>
                {screenings?.gad7 && (
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-600">{screenings.gad7.severity}</span>
                    {screenings.gad7.delta !== 0 && (
                      <span className={`font-bold flex items-center ${screenings.gad7.delta > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {screenings.gad7.delta > 0 ? `+${screenings.gad7.delta}` : screenings.gad7.delta} vs prev
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={openAssessment}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-all text-center block"
            >
              Take / Retake Screening
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Screening instruments evaluate symptom frequency, not medical diagnoses.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
