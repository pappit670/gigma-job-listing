import { Home, Briefcase, User, MessageSquare, Wallet } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function BottomNav() {
  const { state, dispatch } = useApp();
  const user = state.currentUser;
  const isWorker = user?.roles.includes('worker');
  const isClient = user?.roles.includes('client');

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    ...(isWorker ? [{ id: 'jobs', label: 'Jobs', icon: Briefcase }] : []),
    ...(isClient ? [{ id: 'workers', label: 'Workers', icon: User }] : []),
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];

  return (
    <nav className="bottom-nav safe-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = state.activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: item.id })}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
