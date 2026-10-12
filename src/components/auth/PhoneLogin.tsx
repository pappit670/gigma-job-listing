import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import type { User } from '@/types';

interface PhoneLoginProps {
  onComplete: () => void;
}

export function PhoneLogin({ onComplete }: PhoneLoginProps) {
  const { dispatch } = useApp();

  const continueAsDemo = () => {
    const demoUser: User = {
      id: 'demo-user',
      phone: '+254700000000',
      realName: 'Demo User',
      nickname: 'Demo',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      location: {
        lat: -1.2921,
        lng: 36.8219,
        address: 'Nairobi, Kenya',
      },
      roles: ['client'],
      skills: ['handyman', 'cleaning'],
      rating: 4.8,
      totalJobs: 12,
      joinedAt: new Date(),
      isVerified: true,
      recentWorkers: [],
    };

    dispatch({
      type: 'SET_SESSION',
      payload: { user: demoUser },
    });

    onComplete();
  };

  return (
    <div className="g-auth-shell">
      <div className="g-status-bar">
        <span>9:41</span>
        <div className="g-status-right">
          <div className="g-bars">
            <span />
            <span />
            <span />
            <span />
          </div>
          <span>5G</span>
          <div className="g-signal">
            <div className="g-signal-inner" />
          </div>
        </div>
      </div>

      <div className="g-auth-inner">
        <div className="g-brand-mark">g</div>

        <h1 className="g-title">Get it done<br />in minutes.</h1>
        <p className="g-subtitle">
          Post a job or find quick work near you. Enter your phone to start.
        </p>

        <label className="g-field-label">Phone number</label>

        <div className="g-phone-field">
          <span className="g-country">+254</span>
          <div className="g-divider" />
          <span className="g-phone-text">712 345 678</span>
        </div>

        <Button
          type="button"
          onClick={continueAsDemo}
          className="g-send-button"
        >
          Send code
          <ArrowRight className="w-4 h-4" />
        </Button>

        <p className="g-legal">
          By continuing you agree to Gigma&apos;s <a href="#">Terms</a> &amp; <a href="#">Privacy</a>
          <br />
          <span>Powered by TerraWork</span>
        </p>
      </div>
    </div>
  );
}
