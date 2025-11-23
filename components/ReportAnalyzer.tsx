import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Loader2 } from 'lucide-react';
import { analyzeMedicalReport } from '../services/geminiService';
import { ReportAnalysis } from '../types';

const ReportAnalyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ReportAnalysis[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImage(base64);
      setAnalysis(null);
      setIsAnalyzing(true);
      
      try {
        const resultString = await analyzeMedicalReport(base64);
        // Clean JSON formatting if Gemini adds markdown blocks
        const cleanJson = resultString.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed: ReportAnalysis[] = JSON.parse(cleanJson);
        setAnalysis(parsed);
      } catch (error) {
        console.error("Analysis failed", error);
        alert("Failed to analyze report. Please try again.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 pb-24 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Report Analyzer</h2>
        <p className="text-slate-500 text-sm">Upload a photo of your blood test, X-ray, or prescription for instant AI analysis.</p>
      </div>

      {/* Upload Area */}
      {!image && (
        <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-indigo-50/50 hover:bg-indigo-50 transition cursor-pointer relative">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-indigo-600">
            <Upload size={32} />
          </div>
          <span className="font-semibold text-indigo-900">Tap to Upload Report</span>
          <span className="text-xs text-indigo-400 mt-2">Supports JPG, PNG</span>
        </div>
      )}

      {/* Preview & Loading */}
      {image && (
        <div className="space-y-4">
           <div className="relative h-48 w-full rounded-2xl overflow-hidden shadow-sm">
             <img src={image} alt="Report" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                 {isAnalyzing ? (
                   <div className="text-white flex flex-col items-center animate-pulse">
                     <Loader2 size={32} className="animate-spin mb-2" />
                     <span className="font-medium">Analyzing with Gemini...</span>
                   </div>
                 ) : (
                   <button onClick={() => setImage(null)} className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm hover:bg-white/30 transition">
                     Upload Different Photo
                   </button>
                 )}
             </div>
           </div>
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">Analysis Results</h3>
            <button className="text-indigo-600 text-sm font-medium flex items-center gap-1">
              <Download size={16} /> PDF
            </button>
          </div>

          <div className="space-y-3">
            {analysis.map((item, index) => (
              <div key={index} className={`bg-white rounded-xl p-4 border-l-4 shadow-sm ${item.status === 'Normal' ? 'border-emerald-500' : 'border-red-500'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-800">{item.testName}</h4>
                    <span className="text-sm text-slate-500">{item.value} {item.unit}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Normal' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg leading-relaxed">
                  <span className="font-medium block text-xs text-slate-400 mb-1 uppercase tracking-wider">Explanation</span>
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
             <div className="shrink-0 text-blue-500 mt-1">
               <AlertCircle size={20} />
             </div>
             <div>
               <h4 className="font-semibold text-blue-900 text-sm">Disclaimer</h4>
               <p className="text-xs text-blue-700 mt-1">
                 This analysis is generated by AI and may contain errors. Always consult a certified medical professional for diagnosis.
               </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportAnalyzer;