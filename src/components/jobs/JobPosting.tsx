import { useState } from 'react';
import { ArrowLeft, MapPin, Camera, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';
import { JOB_CATEGORIES } from '@/types';
import { LocationPicker } from '@/components/ui/LocationPicker';

interface JobPostingProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function JobPosting({ onClose, onSuccess }: JobPostingProps) {
  const { state, postJob, uploadImage } = useApp();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState(state.currentUser?.location.address || 'Nairobi, Kenya');
  const [coordinates, setCoordinates] = useState({ 
    lat: state.currentUser?.location.lat || -1.2921, 
    lng: state.currentUser?.location.lng || 36.8219 
  });
  const [preferredTime, setPreferredTime] = useState('');
  const [broadcastRadius, setBroadcastRadius] = useState(5);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && photos.length < 3) {
      setIsSubmitting(true);
      try {
        const publicUrl = await uploadImage(file, 'job-photos');
        if (publicUrl) {
          setPhotos([...photos, publicUrl]);
        }
      } catch (err) {
        console.error('Job photo upload failed:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const jobId = await postJob({
        title,
        description,
        category,
        budget: parseInt(budget),
        location: {
          lat: coordinates.lat,
          lng: coordinates.lng,
          address: location,
        },
        preferredTime,
        broadcastRadius,
        photos,
      });

      if (jobId) {
        onSuccess();
      }
    } catch (err) {
      console.error('Failed to post job:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return title.trim().length >= 5 && description.trim().length >= 20 && category;
      case 2: return budget && parseInt(budget) >= 500;
      case 3: return location.trim().length > 0 && preferredTime;
      case 4: return true;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-title mb-2">What do you need done?</h2>
              <p className="text-small text-gray-500">
                Be specific so workers know what to expect
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-small font-medium text-gray-700 mb-2 block">
                  Job Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fix leaking kitchen sink"
                  className="input-gigma"
                />
              </div>

              <div>
                <label className="text-small font-medium text-gray-700 mb-2 block">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {JOB_CATEGORIES.slice(0, 8).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`p-3 rounded-xl text-sm font-medium text-left transition-all ${
                        category === cat
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-small font-medium text-gray-700 mb-2 block">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the job in detail..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                  rows={4}
                />
                <p className="text-caption text-gray-400 mt-1">
                  {description.length} characters (min 20)
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-title mb-2">What's your budget?</h2>
              <p className="text-small text-gray-500">
                Set a fair price for the work needed
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-small font-medium text-gray-700 mb-2 block">
                  Budget (KES)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    KES
                  </span>
                  <Input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 2500"
                    className="input-gigma pl-14 text-lg"
                    min={500}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-small font-medium text-gray-700 mb-2">Suggested rates:</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => setBudget('1500')}
                    className="w-full text-left p-3 bg-white rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <span className="font-medium">Small task</span>
                    <span className="text-gray-500 ml-2">~ KES 1,500</span>
                  </button>
                  <button 
                    onClick={() => setBudget('3500')}
                    className="w-full text-left p-3 bg-white rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <span className="font-medium">Medium task</span>
                    <span className="text-gray-500 ml-2">~ KES 3,500</span>
                  </button>
                  <button 
                    onClick={() => setBudget('7000')}
                    className="w-full text-left p-3 bg-white rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <span className="font-medium">Large task</span>
                    <span className="text-gray-500 ml-2">~ KES 7,000+</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-title mb-2">When and where?</h2>
              <p className="text-small text-gray-500">
                Help workers find and plan for your job
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-small font-medium text-gray-700 mb-2 block">
                  Location
                </label>
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
              </div>

              <div>
                <label className="text-small font-medium text-gray-700 mb-2 block">
                  Preferred Time
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Today, ASAP', 'Today, Afternoon', 'Tomorrow', 'This Week', 'Flexible'].map((time) => (
                    <button
                      key={time}
                      onClick={() => setPreferredTime(time)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        preferredTime === time
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Broadcast Radius */}
              <div>
                <label className="text-small font-medium text-gray-700 mb-2 block">
                  Broadcast Radius
                </label>
                <p className="text-caption text-gray-500 mb-2">
                  How far should we notify workers?
                </p>
                <div className="flex gap-2">
                  {[3, 5, 10, 15].map((radius) => (
                    <button
                      key={radius}
                      onClick={() => setBroadcastRadius(radius)}
                      className={`flex-1 p-3 rounded-xl text-sm font-medium transition-all ${
                        broadcastRadius === radius
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {radius} km
                    </button>
                  ))}
                </div>
                <p className="text-caption text-gray-400 mt-2">
                  ~{broadcastRadius === 3 ? '50' : broadcastRadius === 5 ? '100' : broadcastRadius === 10 ? '250' : '400'}+ workers in this area
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-title mb-2">Add photos (optional)</h2>
              <p className="text-small text-gray-500">
                Photos help workers understand the job better
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                {photos.map((photo, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <img 
                      src={photo} 
                      alt={`Job photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 3 && (
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
                    <Camera className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-caption text-gray-500">Add</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold">Job Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Title</span>
                    <span className="font-medium text-right max-w-[60%]">{title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category</span>
                    <span className="font-medium">{category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Budget</span>
                    <span className="font-medium text-emerald-600">KES {parseInt(budget).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location</span>
                    <span className="font-medium text-right max-w-[60%]">{location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">When</span>
                    <span className="font-medium">{preferredTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Broadcast Radius</span>
                    <span className="font-medium">{broadcastRadius} km</span>
                  </div>
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
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-4">
        <button 
          onClick={step === 1 ? onClose : () => setStep(step - 1)}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        <span className="text-caption text-gray-500">{step}/{totalSteps}</span>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        {renderStep()}
      </div>

      {/* Footer */}
      <div className="px-4 py-6 border-t border-gray-100">
        <Button
          onClick={step === totalSteps ? handleSubmit : () => setStep(step + 1)}
          disabled={!canProceed() || isSubmitting}
          className="w-full btn-primary h-14 text-lg"
        >
          {isSubmitting ? (
            <span className="animate-pulse">Posting...</span>
          ) : step === totalSteps ? (
            <>
              Post Job
              <Check className="w-5 h-5 ml-2" />
            </>
          ) : (
            <>
              Continue
              <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
