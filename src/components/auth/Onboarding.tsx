import { useState, useRef } from 'react';
import { Camera, User, Briefcase, MapPin, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';
import { AVAILABLE_SKILLS } from '@/types';
import type { UserRole } from '@/types';
import { LocationPicker } from '@/components/ui/LocationPicker';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { state, saveProfile, uploadImage } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string>('');
  const [realName, setRealName] = useState('');
  const [nickname, setNickname] = useState('');
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [location, setLocation] = useState(state.currentUser?.location.address || 'Nairobi, Kenya');
  const [coordinates, setCoordinates] = useState({ 
    lat: state.currentUser?.location.lat || -1.2921, 
    lng: state.currentUser?.location.lng || 36.8219 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 5;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        const publicUrl = await uploadImage(file, 'profile-photos');
        if (publicUrl) {
          setPhoto(publicUrl);
        }
      } catch (err) {
        console.error('Photo upload failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRoleToggle = (role: UserRole) => {
    if (role === 'both') {
      setRoles(['worker', 'client']);
    } else {
      setRoles([role]);
    }
  };

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(s => s !== skillId)
        : [...prev, skillId]
    );
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      try {
        // Save all data to database
        await saveProfile({
          photo,
          realName,
          nickname: nickname || realName,
          roles: roles.length > 0 ? roles : ['client'],
          skills: selectedSkills,
          location: { 
            lat: coordinates.lat,
            lng: coordinates.lng,
            address: location 
          },
        });
        onComplete();
      } catch (err) {
        console.error('Failed to save profile:', err);
        // We could show a toast here, but for now we'll just keep the user on the step
      } finally {
        setIsLoading(false);
      }
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return photo;
      case 2: return realName.trim().length >= 2;
      case 3: return roles.length > 0;
      case 4: return roles.includes('worker') ? selectedSkills.length > 0 : true;
      case 5: return location.trim().length > 0;
      default: return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-title mb-2">Add your photo</h2>
              <p className="text-small text-gray-500">
                A clear photo helps build trust with clients and workers
              </p>
            </div>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-32 h-32 mx-auto cursor-pointer"
            >
              {photo ? (
                <img 
                  src={photo} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover border-4 border-emerald-100"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-gray-400" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            
            <p className="text-caption text-gray-400">
              Tap to upload from your gallery
            </p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-title mb-2">What's your name?</h2>
              <p className="text-small text-gray-500">
                Your real name is kept private. We'll ask for a display name next.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-small font-medium text-gray-700 mb-2 block">
                  Full Name (as on ID)
                </label>
                <Input
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  placeholder="e.g. John Kamau"
                  className="input-gigma"
                />
              </div>
              
              <div>
                <label className="text-small font-medium text-gray-700 mb-2 block">
                  Display Name (optional)
                </label>
                <Input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. John the Plumber"
                  className="input-gigma"
                />
                <p className="text-caption text-gray-400 mt-2">
                  This is what others will see
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-title mb-2">How will you use Gigma?</h2>
              <p className="text-small text-gray-500">
                You can change this later in your settings
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleRoleToggle('worker')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  roles.includes('worker') && !roles.includes('client')
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    roles.includes('worker') && !roles.includes('client') ? 'bg-emerald-500' : 'bg-gray-100'
                  }`}>
                    <Briefcase className={`w-6 h-6 ${
                      roles.includes('worker') && !roles.includes('client') ? 'text-white' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">I'm a Worker</h3>
                    <p className="text-small text-gray-500">I want to find jobs and earn money</p>
                  </div>
                  {roles.includes('worker') && !roles.includes('client') && (
                    <Check className="w-6 h-6 text-emerald-500" />
                  )}
                </div>
              </button>

              <button
                onClick={() => handleRoleToggle('client')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  roles.includes('client') && !roles.includes('worker')
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    roles.includes('client') && !roles.includes('worker') ? 'bg-emerald-500' : 'bg-gray-100'
                  }`}>
                    <User className={`w-6 h-6 ${
                      roles.includes('client') && !roles.includes('worker') ? 'text-white' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">I'm a Client</h3>
                    <p className="text-small text-gray-500">I want to hire workers for tasks</p>
                  </div>
                  {roles.includes('client') && !roles.includes('worker') && (
                    <Check className="w-6 h-6 text-emerald-500" />
                  )}
                </div>
              </button>

              <button
                onClick={() => handleRoleToggle('both')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  roles.includes('worker') && roles.includes('client')
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    roles.includes('worker') && roles.includes('client') ? 'bg-emerald-500' : 'bg-gray-100'
                  }`}>
                    <div className="flex -space-x-1">
                      <Briefcase className={`w-4 h-4 ${
                        roles.includes('worker') && roles.includes('client') ? 'text-white' : 'text-gray-500'
                      }`} />
                      <User className={`w-4 h-4 ${
                        roles.includes('worker') && roles.includes('client') ? 'text-white' : 'text-gray-500'
                      }`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Both</h3>
                    <p className="text-small text-gray-500">I want to do both - hire and work</p>
                  </div>
                  {roles.includes('worker') && roles.includes('client') && (
                    <Check className="w-6 h-6 text-emerald-500" />
                  )}
                </div>
              </button>
            </div>
          </div>
        );

      case 4:
        if (!roles.includes('worker')) {
          setStep(5);
          return null;
        }
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-title mb-2">What skills do you have?</h2>
              <p className="text-small text-gray-500">
                Select all that apply. This helps clients find you.
              </p>
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {['Trades', 'Home Services', 'Personal Services', 'General'].map((category) => (
                <div key={category}>
                  <h3 className="text-small font-semibold text-gray-700 mb-2">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SKILLS.filter(s => s.category === category).map((skill) => (
                      <button
                        key={skill.id}
                        onClick={() => handleSkillToggle(skill.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedSkills.includes(skill.id)
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {skill.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-caption text-gray-500">
              {selectedSkills.length} skills selected
            </p>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-title mb-2">Where are you located?</h2>
              <p className="text-small text-gray-500">
                This helps match you with nearby jobs and workers
              </p>
            </div>
            
            <div className="space-y-4">
              <LocationPicker 
                initialLocation={coordinates}
                onLocationChange={(lat, lng, address) => {
                  setCoordinates({ lat, lng });
                  setLocation(address);
                }}
              />
              
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="line-clamp-1">{location}</span>
              </div>
            </div>
            
            <div className="bg-emerald-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-emerald-900">Almost there!</p>
                  <p className="text-small text-emerald-700">
                    Your profile will be live once you complete this step.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress Bar */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-caption text-gray-500">
            Step {step} of {totalSteps}
          </span>
          <span className="text-caption font-medium text-emerald-600">
            {Math.round((step / totalSteps) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4">
        {renderStep()}
      </div>

      {/* Footer */}
      <div className="px-6 py-6 border-t border-gray-100">
        <Button
          onClick={handleNext}
          disabled={!canProceed() || isLoading}
          className="w-full btn-primary h-14 text-lg"
        >
          {isLoading ? (
            <span className="animate-pulse">Saving Profile...</span>
          ) : step === totalSteps ? (
            <>
              Complete Setup
              <Check className="w-5 h-5 ml-2" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
