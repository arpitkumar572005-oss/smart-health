
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Activity, Clock, AlertCircle, FileText, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { analyzeSymptoms } from '../services/geminiService';
import { SymptomAnalysis } from '../types';

const SymptomChecker: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SymptomAnalysis[] | null>(null);

  const [formData, setFormData] = useState({
    symptoms: '',
    duration: '',
    severity: 5,
    history: ''
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await analyzeSymptoms(formData);
      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      setResults(JSON.parse(cleanJson));
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Activity className="text-blue-600" size={32} />
            </div>
            <h2 className="text-xl font-bold text-center text-slate-800">What are your symptoms?</h2>
            <p className="text-center text-slate-500 text-sm mb-6">Describe exactly what you are feeling (e.g., headache, nausea, fever).</p>
            <textarea
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none text-slate-900"
              placeholder="I have a throbbing headache on the left side..."
              value={formData.symptoms}
              onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
             <div className="bg-emerald-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Clock className="text-emerald-600" size={32} />
            </div>
            <h2 className="text-xl font-bold text-center text-slate-800">How long have you felt this?</h2>
            <p className="text-center text-slate-500 text-sm mb-6">When did the symptoms start?</p>
            <div className="grid grid-cols-2 gap-3">
              {['Just today', 'A few days', '1 Week', 'Over 2 weeks'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setFormData({...formData, duration: opt})}
                  className={`p-4 rounded-xl border text-sm font-medium transition ${formData.duration === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="w-full p-3 border border-slate-200 rounded-xl mt-4 text-slate-900"
              placeholder="Or type specific duration..."
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
             <div className="bg-amber-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-amber-600" size={32} />
            </div>
            <h2 className="text-xl font-bold text-center text-slate-800">Severity Level</h2>
            <p className="text-center text-slate-500 text-sm mb-6">On a scale of 1 to 10, how intense is the discomfort?</p>
            
            <div className="px-4">
              <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={formData.severity}
                onChange={(e) => setFormData({...formData, severity: parseInt(e.target.value)})}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="text-center mt-4 text-3xl font-bold text-amber-500">{formData.severity}</div>
            </div>
          </div>
        );
      case 4:
        return (
           <div className="space-y-4 animate-fade-in">
             <div className="bg-purple-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <FileText className="text-purple-600" size={32} />
            </div>
            <h2 className="text-xl font-bold text-center text-slate-800">Medical History</h2>
            <p className="text-center text-slate-500 text-sm mb-6">Do you have any existing conditions or allergies?</p>
            <textarea
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none h-32 resize-none text-slate-900"
              placeholder="E.g., Asthma, Diabetes, Allergic to Penicillin..."
              value={formData.history}
              onChange={(e) => setFormData({...formData, history: e.target.value})}
            />
            <button 
              onClick={() => setFormData({...formData, history: "None"})}
              className="text-sm text-slate-400 underline w-full text-center"
            >
              Skip (I have no conditions)
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  if (results) {
    return (
      <div className="p-4 pb-24 space-y-6">
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center">
           <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
             <CheckCircle size={24} />
           </div>
           <h2 className="text-xl font-bold text-emerald-900">Analysis Complete</h2>
           <p className="text-sm text-emerald-700">Here are potential causes based on your inputs.</p>
        </div>

        <div className="space-y-4">
          {results.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 relative overflow-hidden">
               <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.severity === 'High' ? 'bg-red-500' : item.severity === 'Moderate' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
               <div className="flex justify-between items-start mb-2 pl-2">
                 <h3 className="font-bold text-lg text-slate-800">{item.condition}</h3>
                 <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{item.probability}</span>
               </div>
               <p className="text-slate-600 text-sm mb-3 pl-2">{item.description}</p>
               <div className="bg-slate-50 p-3 rounded-lg pl-2">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Recommendation</span>
                 <p className="text-sm text-slate-800 font-medium">{item.recommendation}</p>
               </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 items-start">
           <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={20} />
           <p className="text-xs text-amber-800 leading-relaxed">
             <strong>Disclaimer:</strong> This is an AI-generated assessment and NOT a medical diagnosis. If your symptoms persist or worsen, please consult a doctor immediately. Call emergency services for severe pain.
           </p>
        </div>

        <button 
          onClick={() => { setResults(null); setStep(1); setFormData({symptoms: '', duration: '', severity: 5, history: ''}); }}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
        >
          Check Another Symptom
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 h-full flex flex-col">
       {/* Progress Bar */}
       <div className="w-full bg-slate-100 h-1.5 rounded-full mb-8 overflow-hidden">
         <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }}></div>
       </div>

       {loading ? (
         <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Analyzing Symptoms...</h3>
            <p className="text-slate-500 mt-2">Consulting our medical database to find potential matches.</p>
         </div>
       ) : (
         <>
           <div className="flex-1">
             {renderStep()}
           </div>

           {/* Navigation */}
           <div className="flex gap-4 mt-8">
             {step > 1 && (
               <button 
                 onClick={handleBack}
                 className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition"
               >
                 Back
               </button>
             )}
             <button 
               onClick={handleNext}
               disabled={step === 1 && !formData.symptoms}
               className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
               {step === 4 ? 'Analyze Now' : 'Next Step'}
               {step < 4 && <ChevronRight size={20} />}
             </button>
           </div>
         </>
       )}
    </div>
  );
};

export default SymptomChecker;
