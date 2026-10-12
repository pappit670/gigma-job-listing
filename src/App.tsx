import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from '@/context/AppContext';
import { PhoneLogin } from '@/components/auth/PhoneLogin';
import { Onboarding } from '@/components/auth/Onboarding';
import { WorkerDashboard } from '@/components/dashboard/WorkerDashboard';
import { ClientDashboard } from '@/components/dashboard/ClientDashboard';
import { JobPosting } from '@/components/jobs/JobPosting';
import { WalletView } from '@/components/wallet/WalletView';
import { ChatView } from '@/components/chat/ChatView';
import { NotificationsView } from '@/components/notifications/NotificationsView';
import { ProfileView } from '@/components/profile/ProfileView';
import { ComponentShowcase } from '@/components/demos/ComponentShowcase';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

type ViewType =
  | 'auth'
  | 'onboarding'
  | 'main'
  | 'post-job'
  | 'wallet'
  | 'chat'
  | 'notifications'
  | 'profile'
  | 'component-showcase';

function AppContent() {
  const { state } = useApp();
  const [view, setView] = useState<ViewType>('auth');

  const handleAuthComplete = () => setView('onboarding');

  const handleOnboardingComplete = () => {
    setView('main');
    toast.success('Welcome to Gigma!', { description: 'Your profile is now live.' });
  };

  const handlePostJob = () => setView('post-job');

  const handleJobPosted = () => {
    setView('main');
    toast.success('Job posted successfully!', { description: 'Nearby workers have been notified.' });
  };

  const renderView = () => {
    switch (view) {
      case 'auth':
        return <PhoneLogin onComplete={handleAuthComplete} />;

      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} />;

      case 'main': {
        const user = state.currentUser;
        if (!user) return <PhoneLogin onComplete={handleAuthComplete} />;
        if (user.roles.includes('worker') && !user.roles.includes('client')) {
          return <WorkerDashboard />;
        }
        return <ClientDashboard onPostJob={handlePostJob} />;
      }

      case 'post-job':
        return <JobPosting onClose={() => setView('main')} onSuccess={handleJobPosted} />;

      case 'wallet':
        return <WalletView onClose={() => setView('main')} />;

      case 'chat':
        return <ChatView onClose={() => setView('main')} />;

      case 'notifications':
        return <NotificationsView onClose={() => setView('main')} />;

      case 'profile':
        return <ProfileView onClose={() => setView('main')} />;

      case 'component-showcase':
        return <ComponentShowcase onBack={() => setView('main')} />;

      default:
        return <PhoneLogin onComplete={handleAuthComplete} />;
    }
  };

  return (
    <div className="g-app-shell">
      <div className="g-device-wrap">
        <div className="app-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              style={{ height: '100%' }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
          <Toaster position="top-center" />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
