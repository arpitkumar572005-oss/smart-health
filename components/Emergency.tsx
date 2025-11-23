import React, { useState } from 'react';
import { Phone, MapPin, ChevronRight, HeartPulse } from 'lucide-react';
import { EmergencyGuide } from '../types';

const Emergency: React.FC = () => {
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);

  const guides: EmergencyGuide[] = [
    { title: 'CPR (Adult)', icon: '🫀', steps: ['Check responsiveness', 'Call 911', 'Push hard & fast in center of chest (100-120 bpm)', 'Give 2 rescue breaths after 30 compressions'] },
    { title: 'Choking', icon: '😮', steps: ['Stand behind person', 'Wrap arms around waist', 'Make a fist above navel', 'Thrust inward and upward'] },
    { title: 'Severe Bleeding', icon: '🩸', steps: ['Apply direct pressure with cloth', 'Keep applying pressure', 'Use tourniquet if needed', 'Keep person warm'] },
    { title: 'Burns', icon: '🔥', steps: ['Cool with running water (10 mins)', 'Do NOT use ice', 'Cover with sterile dressing', 'Do not pop blisters'] },
  ];

  return (
    <div className="p-4 pb-24 space-y-6">
       {/* SOS Header */}
       <div className="bg-red-500 rounded-2xl p-6 text-white text-center shadow-red-200 shadow-xl">
         <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
           <HeartPulse size={32} />
         </div>
         <h1 className="text-3xl font-black mb-1">EMERGENCY</h1>
         <p className="text-red-100 text-sm mb-6">Tap below to call or share location</p>
         
         <div className="grid grid-cols-2 gap-3">
           <button className="bg-white text-red-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50">
             <Phone size={18} /> Call 911
           </button>
           <button className="bg-red-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-red-400 hover:bg-red-600">
             <MapPin size={18} /> Share Loc
           </button>
         </div>
       </div>

       {/* Guides */}
       <div className="space-y-3">
         <h2 className="font-bold text-slate-800 mb-2">First Aid Guides</h2>
         {guides.map((guide) => (
           <div key={guide.title} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
             <button 
               onClick={() => setSelectedGuide(selectedGuide === guide.title ? null : guide.title)}
               className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition"
             >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{guide.icon}</span>
                  <span className="font-semibold text-slate-800">{guide.title}</span>
                </div>
                <ChevronRight size={20} className={`text-slate-400 transition-transform ${selectedGuide === guide.title ? 'rotate-90' : ''}`} />
             </button>
             
             {selectedGuide === guide.title && (
               <div className="bg-slate-50 p-4 border-t border-slate-100">
                 <ul className="space-y-3">
                   {guide.steps.map((step, idx) => (
                     <li key={idx} className="flex gap-3 text-sm text-slate-700">
                       <span className="h-5 w-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                       {step}
                     </li>
                   ))}
                 </ul>
               </div>
             )}
           </div>
         ))}
       </div>
    </div>
  );
};

export default Emergency;