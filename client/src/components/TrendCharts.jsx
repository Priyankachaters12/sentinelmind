import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Layers, Moon } from 'lucide-react';

export default function TrendCharts({ timeline = [] }) {
  const [activeChartTab, setActiveChartTab] = useState('distress');

  // If no historical data yet, provide sample progression for demonstration
  const chartData = timeline && timeline.length > 0 ? timeline : [
    { date: 'Mon', distress: 32, mood: 7, stress: 4, anxiety: 3, sleep: 7 },
    { date: 'Tue', distress: 38, mood: 6, stress: 5, anxiety: 4, sleep: 6 },
    { date: 'Wed', distress: 44, mood: 5, stress: 6, anxiety: 5, sleep: 5 },
    { date: 'Thu', distress: 57, mood: 4, stress: 7, anxiety: 6, sleep: 4 },
    { date: 'Fri', distress: 68, mood: 4, stress: 8, anxiety: 7, sleep: 3 }
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm">
      {/* Header & Chart Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
            <BarChart3 className="w-4 h-4" />
          </span>
          <div>
            <h2 className="font-bold text-slate-900 text-base sm:text-lg">Longitudinal Trend Analysis</h2>
            <p className="text-xs text-slate-500">Dynamic tracking over time (Recharts)</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveChartTab('distress')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeChartTab === 'distress' 
                ? 'bg-white text-teal-800 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Distress Score (0-100)
          </button>
          <button
            onClick={() => setActiveChartTab('signals')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeChartTab === 'signals' 
                ? 'bg-white text-teal-800 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mood, Anxiety & Stress
          </button>
          <button
            onClick={() => setActiveChartTab('sleep')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeChartTab === 'sleep' 
                ? 'bg-white text-teal-800 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sleep vs Energy
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="pt-6 h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeChartTab === 'distress' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="distressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderRadius: '10px', 
                  border: 'none', 
                  color: '#f8fafc',
                  fontSize: '12px'
                }} 
              />
              <ReferenceLine y={25} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Moderate (25)', position: 'insideTopLeft', fill: '#10b981', fontSize: 10 }} />
              <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'High (50)', position: 'insideTopLeft', fill: '#f59e0b', fontSize: 10 }} />
              <ReferenceLine y={75} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Critical (75)', position: 'insideTopLeft', fill: '#f43f5e', fontSize: 10 }} />
              <Area 
                type="monotone" 
                dataKey="distress" 
                stroke="#0d9488" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#distressGrad)" 
                name="Distress Score" 
              />
            </AreaChart>
          ) : activeChartTab === 'signals' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis domain={[1, 10]} stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderRadius: '10px', 
                  border: 'none', 
                  color: '#f8fafc',
                  fontSize: '12px'
                }} 
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={2.5} name="Mood (1-10)" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="anxiety" stroke="#f43f5e" strokeWidth={2.5} name="Anxiety (1-10)" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" name="Stress (1-10)" />
              <Line type="monotone" dataKey="sleep" stroke="#6366f1" strokeWidth={2} name="Sleep (1-10)" />
            </LineChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis domain={[1, 10]} stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderRadius: '10px', 
                  border: 'none', 
                  color: '#f8fafc',
                  fontSize: '12px'
                }} 
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
              <Area type="monotone" dataKey="sleep" stroke="#6366f1" strokeWidth={2.5} fill="url(#sleepGrad)" name="Sleep Quality (1-10)" />
              <Line type="monotone" dataKey="energy" stroke="#14b8a6" strokeWidth={2.5} name="Energy (1-10)" dot={{ r: 3 }} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Time-series pattern detection: SentinelMind analyzes the multi-day trajectory slope.</span>
        <span className="font-semibold text-slate-600">Longitudinal Signal Engine</span>
      </div>
    </div>
  );
}
