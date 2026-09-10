import React from 'react';
import { 
  Sparkles, 
  Wind, 
  Moon, 
  Sun, 
  Users, 
  Brain, 
  HeartPulse, 
  BookOpen, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export default function RecommendationList({ recommendations = [], onOpenGrounding }) {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'wind': return <Wind className="w-5 h-5 text-teal-600" />;
      case 'moon': return <Moon className="w-5 h-5 text-indigo-600" />;
      case 'sun': return <Sun className="w-5 h-5 text-amber-600" />;
      case 'users': return <Users className="w-5 h-5 text-cyan-600" />;
      case 'brain': return <Brain className="w-5 h-5 text-purple-600" />;
      case 'heart-pulse': return <HeartPulse className="w-5 h-5 text-rose-600" />;
      default: return <Sparkles className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h2 className="font-bold text-slate-900 text-base sm:text-lg">Dynamic Coping Recommendations</h2>
            <p className="text-xs text-slate-500">Non-clinical supportive interventions tailored to your current pattern</p>
          </div>
        </div>
      </div>

      {/* Grid of Recommendation Cards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((item, idx) => {
          const isCrisis = item.priority === 'urgent';
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isCrisis
                  ? 'bg-rose-50/70 border-rose-200 shadow-xs'
                  : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      {getIcon(item.icon)}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{item.category}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                      isCrisis ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-white text-slate-600 border-slate-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <div className="text-[11px] font-medium text-slate-700 flex-1 pr-2">
                  <span className="font-semibold text-slate-900">Action: </span>
                  {item.actionable_step}
                </div>

                {item.id === 'breathing_grounding' && onOpenGrounding && (
                  <button
                    onClick={onOpenGrounding}
                    className="shrink-0 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    Open Tool
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-[11px] text-slate-400 text-center">
        Recommendations are algorithmic supportive self-care strategies and do not constitute psychotherapeutic treatment.
      </div>
    </div>
  );
}
