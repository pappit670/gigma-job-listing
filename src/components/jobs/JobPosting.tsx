import { useState } from 'react';
import { ArrowLeft, MapPin, Camera, Check, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { JOB_CATEGORIES } from '@/types';
import { LocationPicker } from '@/components/ui/LocationPicker';
import { pageTransition, tabContent, buttonPress, successBounce } from '@/lib/motion';

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
    lng: state.currentUser?.location.lng || 36.8219,
  });
  const [preferredTime, setPreferredTime] = useState('');
  const [broadcastRadius, setBroadcastRadius] = useState(5);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posted, setPosted] = useState(false);

  const totalSteps = 4;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && photos.length < 3) {
      setIsSubmitting(true);
      try {
        const publicUrl = await uploadImage(file, 'job-photos');
        if (publicUrl) setPhotos([...photos, publicUrl]);
      } catch (err) {
        console.error('Job photo upload failed:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const removePhoto = (index: number) => setPhotos(photos.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const jobId = await postJob({ title, description, category, budget: parseInt(budget), location: { lat: coordinates.lat, lng: coordinates.lng, address: location }, preferredTime, broadcastRadius, photos });
      if (jobId) {
        setPosted(true);
        setTimeout(onSuccess, 1800);
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

  const inputStyle = {
    width: '100%', height: 50, padding: '0 16px', borderRadius: 14,
    background: '#fff', border: '1.5px solid var(--gigma-line)',
    fontFamily: 'var(--gigma-sans)', fontSize: 14, color: 'var(--gigma-black)',
    outline: 'none', boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block', marginBottom: 8,
    fontFamily: 'var(--gigma-display)', fontSize: 11, fontWeight: 700,
    letterSpacing: 0.8, textTransform: 'uppercase' as const, color: 'var(--gigma-muted)',
  };

  const pillBtn = (active: boolean) => ({
    padding: '10px 12px', borderRadius: 12, border: `1.5px solid ${active ? 'var(--gigma-green)' : 'var(--gigma-line)'}`,
    background: active ? 'rgba(15,184,106,0.08)' : '#fff',
    fontFamily: 'var(--gigma-display)', fontSize: 13, fontWeight: 600,
    color: active ? 'var(--gigma-green-strong)' : 'var(--gigma-black)',
    cursor: 'pointer', textAlign: 'left' as const,
  });

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 22, fontWeight: 700, letterSpacing: -0.6, color: 'var(--gigma-black)', marginBottom: 6 }}>What do you need done?</p>
              <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 13, color: 'var(--gigma-muted)' }}>Be specific so workers know what to expect</p>
            </div>

            <div>
              <label style={labelStyle}>Job Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fix leaking kitchen sink" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {JOB_CATEGORIES.slice(0, 8).map((cat) => (
                  <motion.button key={cat} onClick={() => setCategory(cat)} {...buttonPress} style={pillBtn(category === cat)}>
                    {cat}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the job in detail…"
                rows={4}
                style={{ ...inputStyle, height: 'auto', padding: '14px 16px', resize: 'none', lineHeight: 1.5 }}
              />
              <p style={{ fontFamily: 'var(--gigma-mono)', fontSize: 11, color: description.length >= 20 ? 'var(--gigma-green)' : 'var(--gigma-muted)', marginTop: 6 }}>
                {description.length} / 20 min chars
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 22, fontWeight: 700, letterSpacing: -0.6, color: 'var(--gigma-black)', marginBottom: 6 }}>What's your budget?</p>
              <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 13, color: 'var(--gigma-muted)' }}>Set a fair price for the work needed</p>
            </div>

            <div>
              <label style={labelStyle}>Amount (KES)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--gigma-display)', fontSize: 13, fontWeight: 600, color: 'var(--gigma-muted)' }}>KES</span>
                <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="0" min={500} style={{ ...inputStyle, paddingLeft: 52, fontFamily: 'var(--gigma-mono)', fontSize: 22, fontWeight: 700 }} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Quick Picks</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Small task', amount: '1500', sub: 'Quick fix, 1–2 hours' },
                  { label: 'Medium task', amount: '3500', sub: 'Half-day job' },
                  { label: 'Large task', amount: '7000', sub: 'Full-day or more' },
                ].map((opt) => (
                  <motion.button
                    key={opt.amount}
                    onClick={() => setBudget(opt.amount)}
                    {...buttonPress}
                    style={{ ...pillBtn(budget === opt.amount), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 14, fontWeight: 600, color: 'var(--gigma-black)', marginBottom: 2 }}>{opt.label}</p>
                      <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 11, color: 'var(--gigma-muted)' }}>{opt.sub}</p>
                    </div>
                    <span style={{ fontFamily: 'var(--gigma-mono)', fontSize: 14, fontWeight: 700, color: budget === opt.amount ? 'var(--gigma-green-strong)' : 'var(--gigma-muted)' }}>
                      {Number(opt.amount).toLocaleString()}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 22, fontWeight: 700, letterSpacing: -0.6, color: 'var(--gigma-black)', marginBottom: 6 }}>When and where?</p>
              <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 13, color: 'var(--gigma-muted)' }}>Help workers find and plan for your job</p>
            </div>

            <div>
              <label style={labelStyle}>Location</label>
              <LocationPicker
                initialLocation={coordinates}
                onLocationChange={(lat, lng, address) => { setCoordinates({ lat, lng }); setLocation(address); }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--gigma-paper)', borderRadius: 12, marginTop: 8, border: '1.5px solid var(--gigma-line)' }}>
                <MapPin size={14} color="var(--gigma-green)" />
                <span style={{ fontFamily: 'var(--gigma-sans)', fontSize: 12, color: 'var(--gigma-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{location}</span>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Preferred Time</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {['Today, ASAP', 'Today, Afternoon', 'Tomorrow', 'This Week', 'Flexible'].map((time) => (
                  <motion.button key={time} onClick={() => setPreferredTime(time)} {...buttonPress} style={pillBtn(preferredTime === time)}>
                    {time}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Broadcast Radius</label>
              <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 12, color: 'var(--gigma-muted)', marginBottom: 8 }}>How far should we notify workers?</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[3, 5, 10, 15].map((r) => (
                  <motion.button key={r} onClick={() => setBroadcastRadius(r)} {...buttonPress}
                    style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: `1.5px solid ${broadcastRadius === r ? 'var(--gigma-green)' : 'var(--gigma-line)'}`, background: broadcastRadius === r ? 'rgba(15,184,106,0.08)' : '#fff', fontFamily: 'var(--gigma-display)', fontSize: 13, fontWeight: 700, color: broadcastRadius === r ? 'var(--gigma-green-strong)' : 'var(--gigma-muted)', cursor: 'pointer' }}>
                    {r}km
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 22, fontWeight: 700, letterSpacing: -0.6, color: 'var(--gigma-black)', marginBottom: 6 }}>Add photos</p>
              <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 13, color: 'var(--gigma-muted)' }}>Optional — helps workers understand the scope</p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {photos.map((photo, index) => (
                <div key={index} style={{ position: 'relative', width: 88, height: 88 }}>
                  <img src={photo} alt={`Job ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
                  <button onClick={() => removePhoto(index)} style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', background: '#ef4444', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={10} color="#fff" />
                  </button>
                </div>
              ))}
              {photos.length < 3 && (
                <label style={{ width: 88, height: 88, borderRadius: 14, border: '2px dashed var(--gigma-line)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', background: 'var(--gigma-paper)' }}>
                  <Camera size={20} color="var(--gigma-muted)" />
                  <span style={{ fontFamily: 'var(--gigma-display)', fontSize: 10, fontWeight: 600, color: 'var(--gigma-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Add</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Summary */}
            <div style={{ background: '#fff', borderRadius: 18, padding: '18px 16px', border: '1.5px solid var(--gigma-line)' }}>
              <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 13, fontWeight: 700, color: 'var(--gigma-black)', marginBottom: 12 }}>Summary</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Title', value: title },
                  { label: 'Category', value: category },
                  { label: 'Budget', value: `KES ${parseInt(budget).toLocaleString()}`, green: true },
                  { label: 'Location', value: location },
                  { label: 'When', value: preferredTime },
                  { label: 'Radius', value: `${broadcastRadius} km` },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <span style={{ fontFamily: 'var(--gigma-display)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--gigma-muted)', flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontFamily: 'var(--gigma-display)', fontSize: 13, fontWeight: 600, color: row.green ? 'var(--gigma-green-strong)' : 'var(--gigma-black)', textAlign: 'right' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  if (posted) {
    return (
      <motion.div
        style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--gigma-paper)', padding: 32 }}
      >
        <motion.div {...successBounce}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gigma-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Check size={32} color="#fff" />
          </div>
        </motion.div>
        <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 22, fontWeight: 700, letterSpacing: -0.6, color: 'var(--gigma-black)', textAlign: 'center', marginBottom: 8 }}>Job Posted!</p>
        <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 14, color: 'var(--gigma-muted)', textAlign: 'center' }}>Notifying nearby workers…</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      {...pageTransition}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--gigma-paper)', overflow: 'hidden' }}
    >
      {/* Header with progress */}
      <div style={{ padding: '54px 20px 16px', background: '#fff', borderBottom: '1px solid var(--gigma-line)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <motion.button
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
            {...buttonPress}
            style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gigma-paper)', border: '1.5px solid var(--gigma-line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft size={17} color="var(--gigma-black)" />
          </motion.button>
          <div style={{ flex: 1 }}>
            <div style={{ height: 6, background: 'var(--gigma-line)', borderRadius: 3, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ type: 'spring', damping: 22, stiffness: 200 }}
                style={{ height: '100%', background: 'var(--gigma-green)', borderRadius: 3 }}
              />
            </div>
          </div>
          <span style={{ fontFamily: 'var(--gigma-mono)', fontSize: 12, fontWeight: 700, color: 'var(--gigma-muted)' }}>{step}/{totalSteps}</span>
        </div>
      </div>

      {/* Step content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={step} {...tabContent}>
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div style={{ padding: '12px 20px 32px', background: '#fff', borderTop: '1px solid var(--gigma-line)', flexShrink: 0 }}>
        <motion.button
          onClick={step === totalSteps ? handleSubmit : () => setStep(step + 1)}
          disabled={!canProceed() || isSubmitting}
          {...buttonPress}
          style={{
            width: '100%', height: 56, borderRadius: 16, border: 'none',
            background: canProceed() && !isSubmitting ? 'var(--gigma-black)' : 'var(--gigma-line)',
            color: canProceed() && !isSubmitting ? '#fff' : 'var(--gigma-muted)',
            fontFamily: 'var(--gigma-display)', fontSize: 16, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: canProceed() && !isSubmitting ? 'pointer' : 'default',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          {isSubmitting ? (
            'Posting…'
          ) : step === totalSteps ? (
            <>
              <Zap size={18} color={canProceed() ? 'var(--gigma-green)' : 'var(--gigma-muted)'} />
              Post Job
            </>
          ) : (
            <>
              Continue
              <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
