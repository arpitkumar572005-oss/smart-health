import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Target, Brain } from 'lucide-react';
import { getHealthInsights } from '../services/geminiService';

const HealthInsights: React.FC = () => {
  const [summary, setSummary] = useState("Analyzing your weekly health data...");
  const data = [
    { day: 'M', steps: 4000 },
    { day: 'T', steps: 6500 },
    { day: 'W', steps: 5000 },
    { day: 'T', steps: 8000 },
    { day: 'F', steps: 10200 },
    { day: 'S', steps: 11000 },
    { day: 'S', steps: 7500 },
  ];

  useEffect(() => {
    const fetchInsights = async () => {
        try {
            const result = await getHealthInsights({ steps: data, sleepAvg: '7h', waterAvg: '1.8L' });
            setSummary(result);
        } catch (e) {
            setSummary("Could not load AI insights at the moment.");
        }
    };
    fetchInsights();
  }, []);

  return (
    <div className="p-4 pb-24 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Weekly Insights</h2>

      {/* Weekly Score */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white flex justify-between items-center shadow-lg">
        <div>
          <span className="text-indigo-200 text-sm font-medium">Health Score</span>
          <h1 className="text-5xl font-black tracking-tight">84<span className="text-xl font-normal text-indigo-300">/100</span></h1>
        </div>
        <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <TrendingUp size={32} className="text-white" />
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm h-64">
         <h3 className="font-semibold text-slate-700 mb-4 text-sm">Steps Activity</h3>
         <ResponsiveContainer width="100%" height="85%">
           <BarChart data={data}>
             <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
             <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
             <Bar dataKey="steps" radius={[4, 4, 0, 0]}>
               {data.map((entry, index) => (
                 <Cell key={`cell-${index}`} fill={entry.steps >= 8000 ? '#10b981' : '#6366f1'} />
               ))}
             </Bar>
           </BarChart>
         </ResponsiveContainer>
      </div>

      {/* AI Summary */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 relative overflow-hidden">
        <Brain className="text-indigo-200 absolute -top-2 -right-2 h-24 w-24 opacity-20" />
        <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2"><Target size={18} /> AI Analysis</h3>
        <p className="text-sm text-indigo-800 leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
           <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold text-sm">
             <TrendingUp size={16} /> Improved
           </div>
           <p className="text-xs text-emerald-800">Sleep consistency improved by 20% compared to last week.</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
           <div className="flex items-center gap-2 mb-2 text-red-700 font-bold text-sm">
             <TrendingDown size={16} /> Attention
           </div>
           <p className="text-xs text-red-800">Water intake was low on Tuesday and Wednesday.</p>
        </div>
      </div>
    </div>
  );
};

export default HealthInsights;