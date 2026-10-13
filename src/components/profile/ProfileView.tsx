import { useState } from 'react';
import { ArrowLeft, Star, Briefcase, Edit, LogOut, ChevronRight, Award, Check, MapPin, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { AVAILABLE_SKILLS } from '@/types';
import { pageTransition, staggerContainer, cardItem, buttonPress, successBounce } from '@/lib/motion';

interface ProfileViewProps {
  onClose: () => void;
}

export function ProfileView({ onClose }: ProfileViewProps) {
  const { state, dispatch, saveProfile } = useApp();
  const user = state.currentUser!;
  const [verifying, setVerifying] = useState(false);
  const [justVerified, setJustVerified] = useState(false);

  const handleLogout = () => dispatch({ type: 'LOGOUT' });

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await saveProfile({ isVerified: true });
      setJustVerified(true);
      setTimeout(() => setJustVerified(false), 3000);
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  const getSkillName = (id: string) => AVAILABLE_SKILLS.find(s => s.id === id)?.name ?? id;
  const initials = (user.nickname || user.realName || 'U').slice(0, 2).toUpperCase();

  const settingRows = [
    { label: 'Account Settings' },
    { label: 'Notifications' },
    { label: 'Payment Methods' },
    { label: 'Help & Support' },
  ];

  return (
    <motion.div
      {...pageTransition}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--gigma-paper)', overflow: 'hidden' }}
    >
      {/* Header */}
      <div style={{ padding: '54px 20px 0', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.button
          onClick={onClose}
          {...buttonPress}
          style={{ width: 38, height: 38, borderRadius: 12, background: '#fff', border: '1.5px solid var(--gigma-line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={18} color="var(--gigma-black)" />
        </motion.button>
        <span style={{ fontFamily: 'var(--gigma-display)', fontWeight: 700, fontSize: 20, letterSpacing: -0.5, color: 'var(--gigma-black)' }}>
          Profile
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 100px' }}>
        <motion.div variants={staggerContainer} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Profile hero */}
          <motion.div variants={cardItem} style={{ background: '#fff', borderRadius: 24, padding: '28px 24px', border: '1.5px solid var(--gigma-line)', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              {user.photo ? (
                <img src={user.photo} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--gigma-line)' }} />
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--gigma-black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--gigma-display)', fontWeight: 700, fontSize: 28, color: 'var(--gigma-green)' }}>
                  {initials}
                </div>
              )}
              <AnimatePresence>
                {(user.isVerified || justVerified) && (
                  <motion.div
                    {...successBounce}
                    style={{ position: 'absolute', top: -2, right: -2, width: 26, height: 26, borderRadius: '50%', background: 'var(--gigma-green)', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Check size={13} color="#fff" />
                  </motion.div>
                )}
              </AnimatePresence>
              <button style={{ position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: '50%', background: 'var(--gigma-black)', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Edit size={11} color="var(--gigma-green)" />
              </button>
            </div>

            <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 19, fontWeight: 700, color: 'var(--gigma-black)', letterSpacing: -0.5, marginBottom: 4 }}>
              {user.nickname || user.realName}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
              <MapPin size={12} color="var(--gigma-muted)" />
              <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 12, color: 'var(--gigma-muted)' }}>{user.location.address}</p>
            </div>

            {user.roles.includes('worker') && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span style={{ fontFamily: 'var(--gigma-mono)', fontSize: 14, fontWeight: 700, color: 'var(--gigma-black)' }}>
                    {user.rating > 0 ? user.rating.toFixed(1) : 'New'}
                  </span>
                </div>
                <div style={{ width: 1, height: 14, background: 'var(--gigma-line)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Briefcase size={13} color="var(--gigma-muted)" />
                  <span style={{ fontFamily: 'var(--gigma-display)', fontSize: 13, fontWeight: 600, color: 'var(--gigma-muted)' }}>{user.totalJobs} jobs</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <motion.button
                {...buttonPress}
                style={{ flex: 1, height: 44, borderRadius: 12, background: 'var(--gigma-paper)', border: '1.5px solid var(--gigma-line)', fontFamily: 'var(--gigma-display)', fontSize: 13, fontWeight: 600, color: 'var(--gigma-black)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Edit size={14} />
                Edit Profile
              </motion.button>
              {!user.isVerified && (
                <motion.button
                  onClick={handleVerify}
                  disabled={verifying}
                  {...buttonPress}
                  style={{ flex: 1, height: 44, borderRadius: 12, background: 'var(--gigma-black)', border: 'none', fontFamily: 'var(--gigma-display)', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: verifying ? 0.7 : 1 }}
                >
                  <Award size={14} color="var(--gigma-green)" />
                  {verifying ? 'Verifying…' : 'Verify ID'}
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={cardItem} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { value: new Date(user.joinedAt).toLocaleDateString('en-KE', { month: 'short', year: '2-digit' }), label: 'Joined', mono: false },
              { value: (state.wallet?.balance ?? 0).toLocaleString(), label: 'KES Balance', mono: true },
              { value: String(state.notifications.filter(n => !n.isRead).length), label: 'Alerts', mono: true },
            ].map((s) => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '14px 12px', textAlign: 'center', border: '1.5px solid var(--gigma-line)' }}>
                <p style={{ fontFamily: s.mono ? 'var(--gigma-mono)' : 'var(--gigma-display)', fontSize: 16, fontWeight: 700, color: 'var(--gigma-black)', marginBottom: 2 }}>{s.value}</p>
                <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--gigma-muted)' }}>{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Skills */}
          {user.roles.includes('worker') && user.skills.length > 0 && (
            <motion.div variants={cardItem} style={{ background: '#fff', borderRadius: 18, padding: '16px', border: '1.5px solid var(--gigma-line)' }}>
              <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 13, fontWeight: 700, color: 'var(--gigma-black)', marginBottom: 10 }}>Skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {user.skills.map((skill) => (
                  <span key={skill} style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(15,184,106,0.1)', border: '1px solid rgba(15,184,106,0.2)', fontFamily: 'var(--gigma-display)', fontSize: 12, fontWeight: 600, color: 'var(--gigma-green-strong)' }}>
                    {getSkillName(skill)}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Bio */}
          {user.bio && (
            <motion.div variants={cardItem} style={{ background: '#fff', borderRadius: 18, padding: '16px', border: '1.5px solid var(--gigma-line)' }}>
              <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 13, fontWeight: 700, color: 'var(--gigma-black)', marginBottom: 8 }}>About</p>
              <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 13, color: 'var(--gigma-muted)', lineHeight: 1.6 }}>{user.bio}</p>
            </motion.div>
          )}

          {/* Verification */}
          <motion.div variants={cardItem} style={{ background: '#fff', borderRadius: 18, padding: '16px', border: '1.5px solid var(--gigma-line)' }}>
            <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 13, fontWeight: 700, color: 'var(--gigma-black)', marginBottom: 12 }}>Verification</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Phone Verified', sub: user.phone, done: true, Icon: Shield },
                { label: 'Identity Verified', sub: user.isVerified ? 'Verified with ID' : 'Not verified yet', done: user.isVerified, Icon: Award },
                { label: 'Location Set', sub: user.location.address, done: !!user.location.address, Icon: MapPin },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: row.done ? 'rgba(15,184,106,0.12)' : 'var(--gigma-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <row.Icon size={16} color={row.done ? 'var(--gigma-green)' : 'var(--gigma-muted)'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 13, fontWeight: 600, color: 'var(--gigma-black)' }}>{row.label}</p>
                    <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 11, color: 'var(--gigma-muted)' }}>{row.sub}</p>
                  </div>
                  {row.done && <Check size={15} color="var(--gigma-green)" />}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Settings */}
          <motion.div variants={cardItem} style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1.5px solid var(--gigma-line)' }}>
            {settingRows.map((row, i) => (
              <div key={row.label}>
                <motion.button
                  {...buttonPress}
                  style={{ width: '100%', padding: '15px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontFamily: 'var(--gigma-display)', fontSize: 14, fontWeight: 600, color: 'var(--gigma-black)' }}>{row.label}</span>
                  <ChevronRight size={16} color="var(--gigma-muted)" />
                </motion.button>
                {i < settingRows.length - 1 && <div style={{ height: 1, background: 'var(--gigma-line)', margin: '0 16px' }} />}
              </div>
            ))}
          </motion.div>

          {/* Logout */}
          <motion.button
            variants={cardItem}
            onClick={handleLogout}
            {...buttonPress}
            style={{ width: '100%', height: 52, borderRadius: 16, border: '1.5px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.04)', fontFamily: 'var(--gigma-display)', fontSize: 15, fontWeight: 600, color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <LogOut size={16} />
            Log Out
          </motion.button>

          <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 11, fontWeight: 600, color: 'var(--gigma-line)', textAlign: 'center', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Gigma v1.0 · TerraWork Ltd
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
