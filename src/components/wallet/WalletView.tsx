import { useState } from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Plus, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { pageTransition, cardItem, staggerContainer, bottomSheet, backdrop, successBounce, buttonPress } from '@/lib/motion';

interface WalletViewProps {
  onClose: () => void;
}

export function WalletView({ onClose }: WalletViewProps) {
  const { state, initiatePayment } = useApp();
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('1000');
  const [status, setStatus] = useState<string | null>(null);
  const [showDepositSheet, setShowDepositSheet] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);
  const wallet = state.wallet;

  const handleDeposit = async () => {
    setIsDepositing(true);
    setStatus('Processing M-Pesa request…');
    try {
      const result = await initiatePayment(state.currentUser?.phone || '', parseInt(depositAmount));
      setStatus(result.message);
      if (result.success) {
        setSuccessAnim(true);
        setTimeout(() => {
          setSuccessAnim(false);
          setShowDepositSheet(false);
          setStatus(null);
        }, 2200);
      }
    } catch {
      setStatus('Failed to initiate payment');
    } finally {
      setIsDepositing(false);
    }
  };

  const totalEarned = wallet?.transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0) ?? 0;
  const totalSpent = wallet?.transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0) ?? 0;

  return (
    <motion.div
      {...pageTransition}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--gigma-paper)', position: 'relative', overflow: 'hidden' }}
    >
      {/* Header */}
      <div style={{ background: 'var(--gigma-paper)', padding: '54px 20px 0', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <motion.button
          onClick={onClose}
          {...buttonPress}
          style={{ width: 38, height: 38, borderRadius: 12, background: '#fff', border: '1.5px solid var(--gigma-line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={18} color="var(--gigma-black)" />
        </motion.button>
        <span style={{ fontFamily: 'var(--gigma-display)', fontWeight: 700, fontSize: 20, letterSpacing: -0.5, color: 'var(--gigma-black)', flex: 1 }}>
          Wallet
        </span>
        <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--gigma-green)' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 100px' }}>
        {/* Balance Card */}
        <motion.div
          {...cardItem}
          style={{
            background: 'var(--gigma-black)',
            borderRadius: 24,
            padding: '28px 24px',
            marginBottom: 16,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* bg glow */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(15,184,106,0.12)', pointerEvents: 'none' }} />

          <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>
            Available Balance
          </p>
          <p style={{ fontFamily: 'var(--gigma-mono)', fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: -1, lineHeight: 1, marginBottom: 4 }}>
            {wallet?.currency ?? 'KES'} {(wallet?.balance ?? 0).toLocaleString()}
          </p>
          <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>
            {state.currentUser?.phone ?? ''}
          </p>

          <motion.button
            onClick={() => setShowDepositSheet(true)}
            {...buttonPress}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--gigma-green)', border: 'none', borderRadius: 14,
              padding: '12px 20px', cursor: 'pointer',
              fontFamily: 'var(--gigma-display)', fontSize: 14, fontWeight: 600, color: '#fff',
            }}
          >
            <Plus size={16} />
            Add Money
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}
        >
          <motion.div variants={cardItem} style={{ background: '#fff', borderRadius: 18, padding: '16px 16px', border: '1.5px solid var(--gigma-line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(15,184,106,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={14} color="var(--gigma-green)" />
              </div>
              <span style={{ fontFamily: 'var(--gigma-display)', fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--gigma-muted)' }}>Earned</span>
            </div>
            <p style={{ fontFamily: 'var(--gigma-mono)', fontSize: 18, fontWeight: 700, color: 'var(--gigma-green)', letterSpacing: -0.5 }}>
              +{totalEarned.toLocaleString()}
            </p>
          </motion.div>

          <motion.div variants={cardItem} style={{ background: '#fff', borderRadius: 18, padding: '16px 16px', border: '1.5px solid var(--gigma-line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingDown size={14} color="#ef4444" />
              </div>
              <span style={{ fontFamily: 'var(--gigma-display)', fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--gigma-muted)' }}>Spent</span>
            </div>
            <p style={{ fontFamily: 'var(--gigma-mono)', fontSize: 18, fontWeight: 700, color: '#ef4444', letterSpacing: -0.5 }}>
              -{totalSpent.toLocaleString()}
            </p>
          </motion.div>
        </motion.div>

        {/* Transactions */}
        <div>
          <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 13, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--gigma-muted)', marginBottom: 12 }}>
            Recent
          </p>

          {!wallet || wallet.transactions.length === 0 ? (
            <motion.div
              {...cardItem}
              style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: 18, border: '1.5px solid var(--gigma-line)' }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>💸</div>
              <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 14, fontWeight: 600, color: 'var(--gigma-black)', marginBottom: 4 }}>No transactions yet</p>
              <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 13, color: 'var(--gigma-muted)' }}>Your transaction history will appear here</p>
            </motion.div>
          ) : (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {wallet.transactions.map((tx) => (
                <motion.div
                  key={tx.id}
                  variants={cardItem}
                  style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, border: '1.5px solid var(--gigma-line)' }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: tx.type === 'credit' ? 'rgba(15,184,106,0.12)' : 'rgba(239,68,68,0.1)',
                  }}>
                    {tx.type === 'credit'
                      ? <ArrowDownRight size={18} color="var(--gigma-green)" />
                      : <ArrowUpRight size={18} color="#ef4444" />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 13, fontWeight: 600, color: 'var(--gigma-black)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tx.description}
                    </p>
                    <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 11, color: 'var(--gigma-muted)' }}>
                      {new Date(tx.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span style={{ fontFamily: 'var(--gigma-mono)', fontSize: 14, fontWeight: 700, color: tx.type === 'credit' ? 'var(--gigma-green)' : '#ef4444', flexShrink: 0 }}>
                    {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Deposit Bottom Sheet */}
      <AnimatePresence>
        {showDepositSheet && (
          <>
            <motion.div
              {...backdrop}
              onClick={() => setShowDepositSheet(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(11,15,14,0.5)', zIndex: 40 }}
            />
            <motion.div
              {...bottomSheet}
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
                background: '#fff', borderRadius: '24px 24px 0 0',
                padding: '8px 24px 40px',
              }}
            >
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--gigma-line)', margin: '0 auto 24px' }} />

              <p style={{ fontFamily: 'var(--gigma-display)', fontSize: 18, fontWeight: 700, color: 'var(--gigma-black)', marginBottom: 6 }}>
                Add Money
              </p>
              <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 13, color: 'var(--gigma-muted)', marginBottom: 24 }}>
                Enter amount to deposit via M-Pesa STK push
              </p>

              {/* Amount input */}
              <div style={{ background: 'var(--gigma-paper)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, border: '1.5px solid var(--gigma-line)' }}>
                <span style={{ fontFamily: 'var(--gigma-display)', fontSize: 13, fontWeight: 600, color: 'var(--gigma-muted)', letterSpacing: 0.5 }}>KES</span>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'var(--gigma-mono)', fontSize: 24, fontWeight: 700, color: 'var(--gigma-black)', outline: 'none', letterSpacing: -0.5 }}
                />
              </div>

              {/* Quick amounts */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {['500', '1000', '2500', '5000'].map((a) => (
                  <button
                    key={a}
                    onClick={() => setDepositAmount(a)}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 10, border: `1.5px solid ${depositAmount === a ? 'var(--gigma-green)' : 'var(--gigma-line)'}`,
                      background: depositAmount === a ? 'rgba(15,184,106,0.08)' : '#fff',
                      fontFamily: 'var(--gigma-mono)', fontSize: 12, fontWeight: 600,
                      color: depositAmount === a ? 'var(--gigma-green-strong)' : 'var(--gigma-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {Number(a) >= 1000 ? `${Number(a) / 1000}k` : a}
                  </button>
                ))}
              </div>

              {successAnim ? (
                <motion.div {...successBounce} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px', background: 'rgba(15,184,106,0.1)', borderRadius: 16 }}>
                  <span style={{ fontSize: 22 }}>✅</span>
                  <span style={{ fontFamily: 'var(--gigma-display)', fontSize: 15, fontWeight: 600, color: 'var(--gigma-green-strong)' }}>Check your phone for M-Pesa prompt</span>
                </motion.div>
              ) : (
                <motion.button
                  onClick={handleDeposit}
                  disabled={isDepositing}
                  {...buttonPress}
                  style={{
                    width: '100%', height: 56, borderRadius: 16, border: 'none',
                    background: 'var(--gigma-black)', color: '#fff',
                    fontFamily: 'var(--gigma-display)', fontSize: 16, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    cursor: isDepositing ? 'not-allowed' : 'pointer', opacity: isDepositing ? 0.6 : 1,
                  }}
                >
                  <Zap size={18} color="var(--gigma-green)" />
                  {isDepositing ? 'Sending request…' : `Deposit KES ${Number(depositAmount).toLocaleString()}`}
                </motion.button>
              )}

              {status && !successAnim && (
                <p style={{ fontFamily: 'var(--gigma-sans)', fontSize: 12, color: 'var(--gigma-muted)', textAlign: 'center', marginTop: 12 }}>
                  {status}
                </p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
