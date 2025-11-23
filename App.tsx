
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ChatAssistant from './components/ChatAssistant';
import ReportAnalyzer from './components/ReportAnalyzer';
import MedicineManager from './components/MedicineManager';
import Emergency from './components/Emergency';
import HealthInsights from './components/HealthInsights';
import SymptomChecker from './components/SymptomChecker';
import Auth from './components/Auth';
import { AppView, User } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  // Initialize user from local storage
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lifePulseUser');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('lifePulseUser', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lifePulseUser');
    setCurrentView(AppView.DASHBOARD);
  };

  // If not authenticated, show Auth screen
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onNavigate={setCurrentView} user={user} onLogout={handleLogout} />;
      case AppView.CHAT:
        return <ChatAssistant />;
      case AppView.REPORT:
        return <ReportAnalyzer />;
      case AppView.MEDICINE:
        return <MedicineManager />;
      case AppView.EMERGENCY:
        return <Emergency />;
      case AppView.INSIGHTS:
        return <HealthInsights />;
      case AppView.SYMPTOM_CHECKER:
        return <SymptomChecker />;
      default:
        return <Dashboard onNavigate={setCurrentView} user={user} onLogout={handleLogout} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      <div className="pt-6 px-2">
        {renderView()}
      </div>
    </Layout>
  );
};

export default App;
