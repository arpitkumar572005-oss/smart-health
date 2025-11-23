import React from 'react';
import { Home, MessageCircle, FileText, Pill, Siren, BarChart2 } from 'lucide-react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const NavItem = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => (
    <button 
      onClick={() => onNavigate(view)}
      className={`flex flex-col items-center justify-center w-full py-1 ${currentView === view ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <Icon size={24} strokeWidth={currentView === view ? 2.5 : 2} />
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl overflow-hidden relative">
      {/* Content */}
      <main className="h-full overflow-y-auto scrollbar-hide">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 px-2 py-2 flex justify-between items-center z-50 pb-safe">
        <NavItem view={AppView.DASHBOARD} icon={Home} label="Home" />
        <NavItem view={AppView.CHAT} icon={MessageCircle} label="Chat" />
        <NavItem view={AppView.REPORT} icon={FileText} label="Report" />
        <NavItem view={AppView.MEDICINE} icon={Pill} label="Meds" />
        <NavItem view={AppView.INSIGHTS} icon={BarChart2} label="Insights" />
        <NavItem view={AppView.EMERGENCY} icon={Siren} label="Help" />
      </nav>
    </div>
  );
};

export default Layout;