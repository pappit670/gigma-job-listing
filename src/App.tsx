import { useState } from 'react';
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

function AppContent() {
  const { state } = useApp();
  const [view, setView] = useState<'auth' | 'onboarding' | 'main' | 'post-job' | 'wallet' | 'chat' | 'notifications' | 'profile' | 'component-showcase'>('auth');

  // Handle auth completion
  const handleAuthComplete = () => {
    setView('onboarding');
  };

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setView('main');
    toast.success('Welcome to Gigma!', {
      description: 'Your profile is now live.',
    });
  };

  // Handle job posting
  const handlePostJob = () => {
    setView('post-job');
  };

  const handleJobPosted = () => {
    setView('main');
    toast.success('Job posted successfully!', {
      description: 'Nearby workers have been notified.',
    });
  };

  // Navigation is handled through view state

  // Render the appropriate view
  const renderView = () => {
    switch (view) {
      case 'auth':
        return <PhoneLogin onComplete={handleAuthComplete} />;
      
      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} />;
      
      case 'main':
        const user = state.currentUser;
        if (!user) return <PhoneLogin onComplete={handleAuthComplete} />;
        
        // Show appropriate dashboard based on user's primary role
        if (user.roles.includes('worker') && !user.roles.includes('client')) {
          return <WorkerDashboard />;
        } else if (user.roles.includes('client') && !user.roles.includes('worker')) {
          return <ClientDashboard onPostJob={handlePostJob} />;
        } else {
          // Dual role - show client dashboard by default with option to switch
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
        <div className="g-scroll-wheel" aria-hidden="true" />
        <div className="app-container">
          {renderView()}
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
