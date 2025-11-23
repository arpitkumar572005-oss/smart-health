
import React, { useState, useEffect } from 'react';
import { Activity, Droplets, Moon, Smile, ArrowRight, Zap, LogOut, Plus, Edit2, RotateCcw, Clock, Hash } from 'lucide-react';
import { AppView, User } from '../types';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, user, onLogout }) => {
  const [mood, setMood] = useState(70);
  
  // Water State
  const [waterCurrent, setWaterCurrent] = useState(1200); // in ml
  const [waterGoal, setWaterGoal] = useState(2500); // in ml

  // Sleep State
  const [isManualSleep, setIsManualSleep] = useState(false);
  const [bedtime, setBedtime] = useState('22:30');
  const [waketime, setWaketime] = useState('06:30');
  const [manualSleepDuration, setManualSleepDuration] = useState(8.0); // Hours
  const [displaySleepDuration, setDisplaySleepDuration] = useState('8h 0m');

  useEffect(() => {
    if (isManualSleep) {
      const hours = Math.floor(manualSleepDuration);
      const minutes = Math.round((manualSleepDuration - hours) * 60);
      setDisplaySleepDuration(`${hours}h ${minutes}m`);
    } else {
      calculateSleepDuration();
    }
  }, [bedtime, waketime, isManualSleep, manualSleepDuration]);

  const calculateSleepDuration = () => {
    if (!bedtime || !waketime) return;

    const [bedH, bedM] = bedtime.split(':').map(Number);
    const [wakeH, wakeM] = waketime.split(':').map(Number);

    let bedDate = new Date();
    bedDate.setHours(bedH, bedM, 0);

    let wakeDate = new Date();
    wakeDate.setHours(wakeH, wakeM, 0);

    // If wake time is earlier than bed time, assume wake time is next day
    if (wakeDate <= bedDate) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }

    const diffMs = wakeDate.getTime() - bedDate.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.round((diffMs % 3600000) / 60000);

    setDisplaySleepDuration(`${diffHrs}h ${diffMins}m`);
  };

  const handleAddWater = () => {
    setWaterCurrent(prev => Math.min(prev + 250, waterGoal * 2)); // Cap at 2x goal logic
  };

  const handleSetWaterGoal = () => {
    const newGoal = prompt("Set your daily water goal (in ml):", waterGoal.toString());
    if (newGoal && !isNaN(Number(newGoal))) {
      setWaterGoal(Number(newGoal));
    }
  };

  const handleResetWater = () => {
    // Reset immediately to zero without confirmation as requested
    setWaterCurrent(0);
  };

  const handleLogoutClick = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      onLogout();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Greeting */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{getGreeting()}, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-500">Here is your daily health snapshot.</p>
        </div>
        <button 
          onClick={handleLogoutClick}
          className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold hover:bg-red-100 hover:text-red-600 transition group"
          title="Log Out"
        >
          <span className="group-hover:hidden">{user.name.charAt(0).toUpperCase()}</span>
          <LogOut size={18} className="hidden group-hover:block" />
        </button>
      </div>

      {/* Daily Rings / Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Steps */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
          <Activity className="text-emerald-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-slate-800">6,240</span>
          <span className="text-xs text-slate-400">Steps / 10k</span>
          <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
             <div className="bg-emerald-400 h-full w-[62%]"></div>
          </div>
        </div>

        {/* Water */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
          <div className="flex justify-between w-full items-start">
            <Droplets className="text-blue-500" size={24} />
            <button onClick={handleResetWater} className="text-slate-400 hover:text-red-500 transition p-1" title="Reset to 0">
              <RotateCcw size={16} />
            </button>
          </div>
          
          <div className="text-center my-2">
             <span className="text-3xl font-bold text-slate-800">{(waterCurrent / 1000).toFixed(1)}L</span>
             <button 
               onClick={handleSetWaterGoal}
               className="text-xs text-slate-500 block mt-1 hover:text-blue-600 transition flex items-center justify-center gap-1 mx-auto"
               title="Change Goal"
             >
               Goal: {(waterGoal / 1000).toFixed(1)}L <Edit2 size={10} />
             </button>
          </div>

          <div className="w-full space-y-3">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-400 h-full transition-all duration-500" 
                style={{ width: `${Math.min((waterCurrent / waterGoal) * 100, 100)}%` }}
              ></div>
            </div>
            <button 
              onClick={handleAddWater}
              className="w-full py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-1"
            >
              <Plus size={14} /> Add 250ml
            </button>
          </div>
        </div>

        {/* Sleep */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-400"></div>
          
          {/* Header with Toggle */}
          <div className="w-full flex justify-between items-start mb-1">
            <Moon className="text-purple-500" size={24} />
            <button 
              onClick={() => setIsManualSleep(!isManualSleep)} 
              className="text-xs text-purple-400 bg-purple-50 px-2 py-1 rounded-lg hover:bg-purple-100 transition flex items-center gap-1"
            >
              {isManualSleep ? <Clock size={12} /> : <Hash size={12} />}
              {isManualSleep ? 'Auto' : 'Manual'}
            </button>
          </div>
          
          <div className="text-center mb-2">
            <span className="text-2xl font-bold text-slate-800">{displaySleepDuration}</span>
            <span className="text-xs text-slate-400 block">Sleep Duration</span>
          </div>

          {/* Inputs */}
          <div className="w-full">
            {isManualSleep ? (
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] text-center mb-1">Total Hours</span>
                <input 
                  type="number"
                  step="0.5"
                  value={manualSleepDuration}
                  onChange={(e) => setManualSleepDuration(Number(e.target.value))}
                  className="bg-slate-50 rounded px-2 py-1 w-full text-center text-slate-900 border border-slate-200 font-bold"
                />
              </div>
            ) : (
              <div className="flex justify-between gap-1 text-xs">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px]">Bed</span>
                  <input 
                    type="time" 
                    value={bedtime} 
                    onChange={(e) => setBedtime(e.target.value)}
                    className="bg-slate-50 rounded px-1 py-0.5 w-16 text-center text-slate-900 border border-slate-200"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px]">Wake</span>
                  <input 
                    type="time" 
                    value={waketime} 
                    onChange={(e) => setWaketime(e.target.value)}
                    className="bg-slate-50 rounded px-1 py-0.5 w-16 text-center text-slate-900 border border-slate-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mood Tracker */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
           <Smile className="text-amber-500 mb-2" size={24} />
           <span className="text-lg font-bold text-slate-800">Mood</span>
           <input 
            type="range" 
            min="0" 
            max="100" 
            value={mood} 
            onChange={(e) => setMood(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2 accent-amber-500"
           />
           <span className="text-xs text-slate-400 mt-1">{mood > 70 ? 'Great!' : mood > 40 ? 'Okay' : 'Low'}</span>
        </div>
      </div>

      {/* AI Suggestion Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <Zap className="absolute top-4 right-4 text-white/20" size={48} />
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Zap size={18} fill="currentColor"/> AI Tip of the Day</h3>
        <p className="text-indigo-100 text-sm mb-4">
          Your sleep quality has improved by 15% this week! Try to maintain your 10:30 PM bedtime to keep this streak going.
        </p>
        <button onClick={() => onNavigate(AppView.INSIGHTS)} className="bg-white/20 hover:bg-white/30 transition backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          View Insights <ArrowRight size={14} />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => onNavigate(AppView.SYMPTOM_CHECKER)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-left hover:bg-slate-50 transition group">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
          </div>
          <h4 className="font-semibold text-slate-800">Symptom Checker</h4>
          <p className="text-xs text-slate-500">Check your health</p>
        </button>

        <button onClick={() => onNavigate(AppView.REPORT)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-left hover:bg-slate-50 transition group">
          <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 transition">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h4 className="font-semibold text-slate-800">Upload Report</h4>
          <p className="text-xs text-slate-500">Get instant analysis</p>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
