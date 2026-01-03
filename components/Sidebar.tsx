
import React from 'react';

// Re-implementing icons
const IconDashboard = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="15" rx="1"/></svg>;
const IconCar = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>;
const IconHistory = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>;
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconBrain = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.248 4 4 0 0 0 6.953 1.835 4 4 0 0 0 6.953-1.835 4 4 0 0 0 .52-8.248 4 4 0 0 0-2.526-5.77A3 3 0 1 0 12 5z"/></svg>;
const IconLogout = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <IconDashboard /> },
    { id: 'inventory', label: 'Inventory', icon: <IconCar /> },
    { id: 'sales', label: 'Sales History', icon: <IconHistory /> },
    { id: 'partners', label: 'Partners', icon: <IconUsers /> },
    { id: 'advisor', label: 'AI Advisor', icon: <IconBrain /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl uppercase tracking-tighter">
          <IconCar />
          <span>V.T AutoProfit</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-600' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-2">
        <div className="bg-slate-900 rounded-xl p-4 text-white">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Business Pool</p>
          <p className="text-sm font-medium">V.T Partnership Active</p>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
        >
          <IconLogout />
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
