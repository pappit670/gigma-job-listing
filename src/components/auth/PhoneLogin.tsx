import { ArrowRight, Check, Phone, Shield } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Phone className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-display mb-3">Welcome to Gigma</h1>
            <p className="text-body text-gray-500">
              SMS verification is still being set up, so this build is using demo access for now.
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-3 py-2.5 mb-5 border border-emerald-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Launch-ready demo mode</p>
              </div>
            </div>

            <Button
              type="button"
              onClick={continueAsDemo}
              className="w-full btn-primary h-14 text-base font-medium"
            >
              Continue without SMS
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
              <span>Phone OTP will be enabled once the Supabase SMS provider is configured.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
