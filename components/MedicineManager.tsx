
import React, { useState } from 'react';
import { Plus, Clock, Pill, Trash2, AlertTriangle, Check, X, Calendar, Hash } from 'lucide-react';
import { Medication } from '../types';
import { checkDrugInteractions } from '../services/geminiService';

const MedicineManager: React.FC = () => {
  const [meds, setMeds] = useState<Medication[]>([
    { id: '1', name: 'Amoxicillin', dosage: '500mg', time: 'Morning', duration: '5 Days', taken: true },
    { id: '2', name: 'Ibuprofen', dosage: '200mg', time: 'Afternoon', duration: 'As needed', taken: false },
  ]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [interactionWarning, setInteractionWarning] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    duration: '',
    selectedTimes: [] as string[]
  });

  const timeOptions = ['Morning', 'Afternoon', 'Evening', 'Night'];

  const toggleTaken = (id: string) => {
    setMeds(meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  const deleteMed = (id: string) => {
    setMeds(meds.filter(m => m.id !== id));
  };

  const handleTimeToggle = (time: string) => {
    setFormData(prev => {
      if (prev.selectedTimes.includes(time)) {
        return { ...prev, selectedTimes: prev.selectedTimes.filter(t => t !== time) };
      } else {
        return { ...prev, selectedTimes: [...prev.selectedTimes, time] };
      }
    });
  };

  const addMedication = async () => {
    if (!formData.name || formData.selectedTimes.length === 0) {
      alert("Please enter a name and select at least one time.");
      return;
    }

    const newMeds: Medication[] = formData.selectedTimes.map(time => ({
      id: Date.now().toString() + Math.random().toString(),
      name: formData.name,
      dosage: formData.dosage || '1 Pill',
      time: time,
      duration: formData.duration || 'Ongoing',
      taken: false
    }));
    
    const updatedMeds = [...meds, ...newMeds];
    setMeds(updatedMeds);
    
    // Reset Form
    setFormData({ name: '', dosage: '', duration: '', selectedTimes: [] });
    setIsAdding(false);

    // AI Check for interactions
    setIsChecking(true);
    const uniqueNames = Array.from(new Set(updatedMeds.map(m => m.name)));
    
    if (uniqueNames.length > 1) {
        try {
          const warning = await checkDrugInteractions(uniqueNames);
          if (warning && !warning.toLowerCase().includes('no interactions')) {
              setInteractionWarning(warning);
          } else {
              setInteractionWarning(null);
          }
        } catch (e) {
          console.error("Interaction check failed");
        }
    }
    setIsChecking(false);
  };

  return (
    <div className="p-4 pb-24 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">My Medicine</h2>

      {/* Interaction Warning */}
      {interactionWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 relative animate-fade-in">
          <AlertTriangle className="text-amber-500 shrink-0 mt-1" />
          <div className="pr-6">
            <h4 className="font-bold text-amber-800 text-sm">Interaction Alert</h4>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">{interactionWarning}</p>
          </div>
          <button 
            onClick={() => setInteractionWarning(null)}
            className="absolute top-2 right-2 text-amber-400 hover:text-amber-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Smart Pill Box Layout */}
      <div className="space-y-6">
        {timeOptions.map((time) => {
          const timeMeds = meds.filter(m => m.time === time);
          if (timeMeds.length === 0) return null;

          return (
            <div key={time} className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{time}</h3>
              </div>
              <div className="space-y-2">
                {timeMeds.map(med => (
                  <div key={med.id} className={`flex items-center justify-between p-4 rounded-xl border transition group ${med.taken ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100 shadow-sm'}`}>
                     <div className="flex items-center gap-3">
                       <div className={`h-10 w-10 rounded-full flex items-center justify-center transition ${med.taken ? 'bg-emerald-200 text-emerald-700' : 'bg-indigo-100 text-indigo-600'}`}>
                         <Pill size={20} />
                       </div>
                       <div>
                         <h4 className={`font-semibold ${med.taken ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>{med.name}</h4>
                         <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{med.dosage}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Calendar size={10} /> {med.duration}</span>
                         </div>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                       <button 
                          onClick={() => deleteMed(med.id)}
                          className="text-slate-300 hover:text-red-500 p-2 hidden group-hover:block transition"
                       >
                          <Trash2 size={16} />
                       </button>
                       <button 
                         onClick={() => toggleTaken(med.id)}
                         className={`h-8 w-8 rounded-full flex items-center justify-center transition ${med.taken ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                       >
                         <Check size={16} />
                       </button>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        
        {meds.length === 0 && !isAdding && (
          <div className="text-center py-10 text-slate-400">
            <Pill size={48} className="mx-auto mb-3 opacity-20" />
            <p>No medicines added yet.</p>
          </div>
        )}
      </div>

      {/* Add Button / Form */}
      {isAdding ? (
          <div className="bg-white p-5 rounded-2xl shadow-xl border border-slate-100 animate-fade-in fixed bottom-24 left-4 right-4 max-w-md mx-auto z-50">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-lg text-slate-800">Add Medicine</h3>
                 <button onClick={() => setIsAdding(false)} className="bg-slate-100 p-1 rounded-full text-slate-500 hover:bg-slate-200">
                   <X size={16} />
                 </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Medicine Name</label>
                  <input 
                    autoFocus
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="e.g. Paracetamol"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                {/* Dosage & Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Dosage</label>
                    <input 
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" 
                      placeholder="e.g. 500mg"
                      value={formData.dosage}
                      onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Duration</label>
                    <input 
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" 
                      placeholder="e.g. 5 Days"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    />
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">When to take? ({formData.selectedTimes.length} times)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeOptions.map(time => (
                      <button
                        key={time}
                        onClick={() => handleTimeToggle(time)}
                        className={`py-2 rounded-lg text-xs font-medium transition border ${
                          formData.selectedTimes.includes(time) 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={addMedication} 
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 mt-2 shadow-lg shadow-indigo-200"
                >
                  {isChecking ? 'Checking Interactions...' : 'Add to Schedule'}
                  {!isChecking && <Plus size={18} />}
                </button>
              </div>
          </div>
      ) : (
          <button 
            onClick={() => setIsAdding(true)} 
            className="w-full py-4 border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl text-indigo-500 font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition"
          >
            <Plus size={20} /> Add Medication
          </button>
      )}
      
      {/* Backdrop for Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsAdding(false)} />
      )}
    </div>
  );
};

export default MedicineManager;
