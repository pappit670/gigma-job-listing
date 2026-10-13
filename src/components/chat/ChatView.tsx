import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Phone, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { pageTransition, slideInFromRight, staggerContainer, cardItem, buttonPress } from '@/lib/motion';

interface ChatViewProps {
  onClose: () => void;
}

export function ChatView({ onClose }: ChatViewProps) {
  const { state, sendMessage } = useApp();
  const [message, setMessage] = useState('');
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myJobs = state.jobs.filter(j =>
    (j.clientId === state.currentUser?.id || j.workerId === state.currentUser?.id) && j.status !== 'ready'
  );

  const conversations = myJobs.map(job => {
    const isClient = job.clientId === state.currentUser?.id;
    const otherPartyId = isClient ? job.workerId : job.clientId;
    const otherParty = state.workers.find(w => w.id === otherPartyId) ||
      (state.currentUser?.id === otherPartyId ? state.currentUser : null);
    const jobMessages = state.messages.filter(m => m.jobId === job.id);
    const lastMsg = jobMessages[jobMessages.length - 1];
    return {
      id: job.id,
      name: otherParty?.nickname || otherParty?.realName || 'User',
      photo: otherParty?.photo || '',
      lastMessage: lastMsg?.content || 'No messages yet',
      time: lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      unread: 0,
      jobTitle: job.title,
    };
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat, state.messages.length]);

  const handleSend = async () => {
    if (!message.trim() || !activeChat) return;
    try {
      await sendMessage(activeChat, message.trim());
      setMessage('');
    } catch (err) {
      console.error('Failed to send:', err);
    }
  };

  if (activeChat) {
    const chat = conversations.find(c => c.id === activeChat);
    const msgs = state.messages.filter(m => m.jobId === activeChat);

    return (
      <motion.div
        key="chat-thread"
        {...slideInFromRight}
        style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--gigma-paper)', overflow: 'hidden' }}
      >
        {/* Thread header */}
        <div style={{ padding: '54px 16px 12px', background: '#fff', borderBottom: '1px solid var(--gigma-line)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.button
            onClick={() => setActiveChat(null)}
            {...buttonPress}
            style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid var(--gigma-line)', background: 'var(--gigma-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft size={17} color="var(--gigma-black)" />
          </motion.button>
          {chat?.photo ? (
            <img src={chat.photo} alt={chat.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gigma-line)' }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gigma-black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--gigma-display)', fontWeight: 700, fontSize: 14, color: 'var(--gigma-green)' }}>
              {(chat?.name?.[0] ?? 'U').toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 14, fontWeight: 700, color: 'var(--gigma-black)', lineHeight: 1.2 }}>{chat?.name}</p>
            <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 11, color: 'var(--gigma-muted)' }}>{chat?.jobTitle}</p>
          </div>
          <motion.button
            {...buttonPress}
            style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid var(--gigma-line)', background: 'var(--gigma-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Phone size={16} color="var(--gigma-muted)" />
          </motion.button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AnimatePresence initial={false}>
            {msgs.length === 0 ? (
              <motion.div key="no-msgs" {...cardItem} style={{ textAlign: 'center', padding: '40px 20px', marginTop: 'auto' }}>
                <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 13, color: 'var(--gigma-muted)' }}>Send a message to get started</p>
              </motion.div>
            ) : (
              msgs.map((msg) => {
                const isMe = msg.senderId === state.currentUser?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                    style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}
                  >
                    <div style={{
                      maxWidth: '80%',
                      padding: '10px 14px',
                      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isMe ? 'var(--gigma-black)' : '#fff',
                      border: isMe ? 'none' : '1.5px solid var(--gigma-line)',
                    }}>
                      <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 14, color: isMe ? '#fff' : 'var(--gigma-black)', lineHeight: 1.4, margin: 0 }}>
                        {msg.content}
                      </p>
                      <p style={{ fontFamily: 'var(--gigma-mono)', fontSize: 10, color: isMe ? 'rgba(255,255,255,0.4)' : 'var(--gigma-muted)', marginTop: 4 }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '10px 16px 24px', background: '#fff', borderTop: '1px solid var(--gigma-line)', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Message…"
            style={{
              flex: 1, height: 44, padding: '0 16px', borderRadius: 22,
              background: 'var(--gigma-paper)', border: '1.5px solid var(--gigma-line)',
              fontFamily: 'var(--gigma-sans)', fontSize: 14, color: 'var(--gigma-black)', outline: 'none',
            }}
          />
          <motion.button
            onClick={handleSend}
            disabled={!message.trim()}
            {...buttonPress}
            style={{
              width: 44, height: 44, borderRadius: 22, border: 'none',
              background: message.trim() ? 'var(--gigma-black)' : 'var(--gigma-line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: message.trim() ? 'pointer' : 'default',
              transition: 'background 0.15s',
            }}
          >
            <Send size={18} color={message.trim() ? 'var(--gigma-green)' : 'var(--gigma-muted)'} />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="chat-list"
      {...pageTransition}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--gigma-paper)', overflow: 'hidden' }}
    >
      {/* Header */}
      <div style={{ padding: '54px 20px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <motion.button
            onClick={onClose}
            {...buttonPress}
            style={{ width: 38, height: 38, borderRadius: 12, background: '#fff', border: '1.5px solid var(--gigma-line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft size={18} color="var(--gigma-black)" />
          </motion.button>
          <span style={{ fontFamily: 'var(--gigma-display)', fontWeight: 700, fontSize: 20, letterSpacing: -0.5, color: 'var(--gigma-black)', flex: 1 }}>
            Messages
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 100px' }}>
        {conversations.length === 0 ? (
          <motion.div
            {...cardItem}
            style={{ textAlign: 'center', padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
          >
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#fff', border: '1.5px solid var(--gigma-line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={28} color="var(--gigma-line)" />
            </div>
            <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 15, fontWeight: 700, color: 'var(--gigma-black)' }}>No messages yet</p>
            <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 13, color: 'var(--gigma-muted)', maxWidth: 220, lineHeight: 1.5 }}>
              Start a job to connect with workers or clients
            </p>
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {conversations.map((chat) => (
              <motion.button
                key={chat.id}
                variants={cardItem}
                onClick={() => setActiveChat(chat.id)}
                {...buttonPress}
                style={{ width: '100%', background: '#fff', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, border: '1.5px solid var(--gigma-line)', textAlign: 'left', cursor: 'pointer' }}
              >
                {chat.photo ? (
                  <img src={chat.photo} alt={chat.name} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--gigma-black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--gigma-display)', fontWeight: 700, fontSize: 18, color: 'var(--gigma-green)', flexShrink: 0 }}>
                    {(chat.name[0] ?? 'U').toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 14, fontWeight: 700, color: 'var(--gigma-black)' }}>{chat.name}</p>
                    <span style={{ fontFamily: 'var(--gigma-mono)', fontSize: 11, color: 'var(--gigma-muted)' }}>{chat.time}</span>
                  </div>
                  <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 12, color: 'var(--gigma-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.lastMessage}</p>
                  <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 11, fontWeight: 600, color: 'var(--gigma-green-strong)', marginTop: 4 }}>{chat.jobTitle}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
