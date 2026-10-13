import { ArrowLeft, Briefcase, MessageSquare, DollarSign, Info, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { pageTransition, staggerContainer, cardItem, buttonPress } from '@/lib/motion';

interface NotificationsViewProps {
  onClose: () => void;
}

const typeConfig = {
  job: { Icon: Briefcase, bg: 'rgba(15,184,106,0.12)', color: 'var(--gigma-green)', label: 'Job' },
  message: { Icon: MessageSquare, bg: 'rgba(99,102,241,0.12)', color: '#6366f1', label: 'Message' },
  payment: { Icon: DollarSign, bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'Payment' },
  system: { Icon: Info, bg: 'rgba(107,118,113,0.12)', color: 'var(--gigma-muted)', label: 'System' },
} as const;

export function NotificationsView({ onClose }: NotificationsViewProps) {
  const { state, dispatch } = useApp();
  const notifications = state.notifications;
  const unread = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = (id: string) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  const handleMarkAllRead = () => notifications.forEach(n => !n.isRead && dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id }));

  return (
    <motion.div
      {...pageTransition}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--gigma-paper)', overflow: 'hidden' }}
    >
      {/* Header */}
      <div style={{ padding: '54px 20px 16px', background: 'var(--gigma-paper)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <motion.button
            onClick={onClose}
            {...buttonPress}
            style={{ width: 38, height: 38, borderRadius: 12, background: '#fff', border: '1.5px solid var(--gigma-line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft size={18} color="var(--gigma-black)" />
          </motion.button>
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: 'var(--gigma-display)', fontWeight: 700, fontSize: 20, letterSpacing: -0.5, color: 'var(--gigma-black)' }}>
              Notifications
            </span>
            {unread > 0 && (
              <span style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 10, background: 'var(--gigma-green)', fontFamily: 'var(--gigma-display)', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                {unread}
              </span>
            )}
          </div>
          {unread > 0 && (
            <motion.button
              onClick={handleMarkAllRead}
              {...buttonPress}
              style={{ fontFamily: 'var(--gigma-display)', fontSize: 12, fontWeight: 600, color: 'var(--gigma-green-strong)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Mark all read
            </motion.button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 100px' }}>
        <AnimatePresence>
          {notifications.length === 0 ? (
            <motion.div
              key="empty"
              {...cardItem}
              style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 20, background: '#fff', border: '1.5px solid var(--gigma-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                <Bell size={28} color="var(--gigma-line)" />
              </div>
              <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 15, fontWeight: 700, color: 'var(--gigma-black)' }}>All caught up</p>
              <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 13, color: 'var(--gigma-muted)', maxWidth: 220, lineHeight: 1.5 }}>
                We'll notify you about jobs, messages, and payments
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              {notifications.map((n) => {
                const cfg = typeConfig[n.type as keyof typeof typeConfig] ?? typeConfig.system;
                const { Icon } = cfg;
                return (
                  <motion.div
                    key={n.id}
                    variants={cardItem}
                    layout
                    onClick={() => handleMarkRead(n.id)}
                    style={{
                      background: n.isRead ? '#fff' : 'rgba(15,184,106,0.04)',
                      borderRadius: 16,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      border: `1.5px solid ${n.isRead ? 'var(--gigma-line)' : 'rgba(15,184,106,0.18)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <Icon size={18} color={cfg.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 13, fontWeight: 700, color: 'var(--gigma-black)', lineHeight: 1.3 }}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--gigma-green)', flexShrink: 0, marginTop: 4 }} />
                        )}
                      </div>
                      <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 12, color: 'var(--gigma-muted)', marginTop: 3, lineHeight: 1.4 }}>
                        {n.message}
                      </p>
                      <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 10, fontWeight: 600, letterSpacing: 0.4, color: 'var(--gigma-line)', textTransform: 'uppercase', marginTop: 8 }}>
                        {new Date(n.createdAt).toLocaleString('en-KE', { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
