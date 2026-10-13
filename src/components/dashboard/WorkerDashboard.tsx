import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Star, Briefcase, Wallet, Bell, Search, Filter, Check, X, Zap, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { JobStatusBadge } from '@/components/jobs/JobStatusBadge';
import { BottomNav } from './BottomNav';
import type { Job } from '@/types';
import {
  staggerContainer,
  cardItem,
  notificationBanner,
  tabContent,
  backdrop,
  bottomSheet,
  livePulse,
  buttonPress,
} from '@/lib/motion';

export function WorkerDashboard() {
  const { state, dispatch, acceptJob, completeJob, updateWorker } = useApp();
  const [activeTab, setActiveTab] = useState<'jobs' | 'active' | 'earnings'>('jobs');
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const user = state.currentUser!;

  const workerProfile = state.workers.find(w => w.userId === user.id) || state.workers[0];

  const jobNotifications = state.notifications.filter(
    n =>
      n.userId === user.id &&
      n.type === 'job' &&
      n.data?.type === 'job_broadcast' &&
      !n.isRead &&
      (!n.expiresAt || new Date(n.expiresAt) > new Date()),
  );

  const availableJobs = state.jobs.filter(
    j => j.status === 'ready' && !j.workerId &&
      (!j.notifiedWorkerIds || j.notifiedWorkerIds.includes(workerProfile?.id)),
  );

  const myJobs = state.jobs.filter(
    j => j.workerId === workerProfile?.id ||
      (j.status === 'in-progress' && j.workerId === workerProfile?.id),
  );

  const wallet = state.wallet;

  const handleAcceptJob = async (job: Job) => {
    if (workerProfile?.availability === 'busy' || workerProfile?.currentJobId) return;
    try { await acceptJob(job.id, workerProfile?.id || 'w1'); } catch {}
  };

  const handleCompleteJob = async (job: Job) => {
    try {
      await completeJob(job.id);
      if (workerProfile) {
        await updateWorker(user.id, {
          availability: 'available',
          currentJobId: null,
          completedJobs: (workerProfile.completedJobs || 0) + 1,
        });
      }
    } catch {}
  };

  const handleSetAvailability = async (availability: 'available' | 'busy' | 'offline') => {
    if (workerProfile) {
      try { await updateWorker(user.id, { availability }); } catch {}
    }
    setShowAvailabilityModal(false);
  };

  const availColor = workerProfile?.availability === 'available'
    ? 'bg-emerald-500' : workerProfile?.availability === 'busy'
      ? 'bg-orange-500' : 'bg-gray-400';

  const availLabel = workerProfile?.availability === 'available' ? 'Available'
    : workerProfile?.availability === 'busy' ? 'Busy' : 'Offline';

  const availBg = workerProfile?.availability === 'available'
    ? 'bg-emerald-50 text-emerald-700' : workerProfile?.availability === 'busy'
      ? 'bg-orange-50 text-orange-700' : 'bg-gray-100 text-gray-600';

  return (
    <div className="min-h-screen bg-[#F5F6F4] pb-24">

      {/* ── Header ── */}
      <div className="bg-white px-4 pt-4 pb-3 sticky top-0 z-20 border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user.photo || 'https://via.placeholder.com/40'}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              {workerProfile?.availability === 'available' && (
                <motion.span
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"
                  animate={livePulse.animate}
                  transition={livePulse.transition}
                />
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400">Welcome back</p>
              <p className="font-semibold text-[#0B0F0E]">{user.nickname || user.realName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              {...buttonPress}
              onClick={() => setShowAvailabilityModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${availBg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${availColor}`} />
              {availLabel}
            </motion.button>

            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <AnimatePresence>
                {state.unreadNotifications > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white"
                  >
                    {state.unreadNotifications}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { icon: Wallet, label: 'Balance', value: `KES ${wallet?.balance.toLocaleString() || '0'}`, bg: 'bg-emerald-50', text: 'text-emerald-700', iconColor: 'text-emerald-500' },
            { icon: Briefcase, label: 'Jobs Done', value: String(workerProfile?.completedJobs || 0), bg: 'bg-blue-50', text: 'text-blue-700', iconColor: 'text-blue-500' },
            { icon: Star, label: 'Rep Score', value: String(workerProfile?.reputationScore || 0), bg: 'bg-amber-50', text: 'text-amber-700', iconColor: 'text-amber-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
              className={`${stat.bg} rounded-xl p-2.5`}
            >
              <stat.icon className={`w-4 h-4 ${stat.iconColor} mb-1`} />
              <p className="text-[10px] text-gray-500 font-medium">{stat.label}</p>
              <p className={`font-bold text-sm ${stat.text} font-mono`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Job Notification Banners ── */}
      <div className="px-4 pt-3 space-y-2">
        <AnimatePresence>
          {jobNotifications.map((notification) => {
            const job = state.jobs.find(j => j.id === notification.data?.jobId);
            if (!job) return null;
            return (
              <motion.div
                key={notification.id}
                {...notificationBanner}
                className="bg-gradient-to-r from-[#0A7A46] to-[#0FB86A] rounded-2xl p-4 text-white shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1 }}
                      className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
                    >
                      <Zap className="w-5 h-5" />
                    </motion.div>
                    <div>
                      <p className="font-bold text-sm">New Job Near You!</p>
                      <p className="text-white/80 text-xs mt-0.5">{job.title}</p>
                      <p className="text-white font-mono font-semibold text-sm mt-1">KES {job.budget.toLocaleString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notification.id })}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 mt-3">
                  <motion.div {...buttonPress} className="flex-1">
                    <Button
                      onClick={() => handleAcceptJob(job)}
                      disabled={workerProfile?.availability === 'busy'}
                      size="sm"
                      className="w-full bg-white text-[#0A7A46] hover:bg-white/90 font-semibold rounded-xl"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Accept
                    </Button>
                  </motion.div>
                  <Button
                    onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notification.id })}
                    size="sm"
                    className="bg-white/20 text-white hover:bg-white/30 border-0 rounded-xl"
                  >
                    Ignore
                  </Button>
                </div>
                {workerProfile?.availability === 'busy' && (
                  <p className="text-white/70 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Finish your current job first
                  </p>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Tab Nav ── */}
      <div className="px-4 pt-3">
        <div className="bg-white rounded-2xl p-1 flex gap-1 shadow-sm">
          {(['jobs', 'active', 'earnings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors"
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="worker-tab-pill"
                  className="absolute inset-0 bg-[#0B0F0E] rounded-xl"
                  transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                />
              )}
              <span className={`relative z-10 ${activeTab === tab ? 'text-white' : 'text-gray-500'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 pt-3">
        <AnimatePresence mode="wait">
          {activeTab === 'jobs' && (
            <motion.div key="jobs" {...tabContent} className="space-y-4">
              {/* Search row */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#0A7A46] focus:ring-2 focus:ring-[#0A7A46]/10 transition-all"
                  />
                </div>
                <button className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {workerProfile?.availability === 'busy' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-orange-900">You're currently on a job</p>
                    <p className="text-xs text-orange-600">Complete it first to accept new ones</p>
                  </div>
                </motion.div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Available Near You {availableJobs.length > 0 && `· ${availableJobs.length}`}
                </p>
                {state.isLoading ? (
                  <SkeletonList count={3} />
                ) : availableJobs.length === 0 ? (
                  <EmptyState
                    icon={<Briefcase className="w-10 h-10 text-gray-300" />}
                    title="No jobs right now"
                    subtitle="You'll get notified the moment one pops up nearby"
                  />
                ) : (
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-3"
                  >
                    {availableJobs.map((job) => (
                      <motion.div key={job.id} variants={cardItem}>
                        <JobCard
                          job={job}
                          onAccept={() => handleAcceptJob(job)}
                          disabled={workerProfile?.availability === 'busy'}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'active' && (
            <motion.div key="active" {...tabContent} className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                My Active Jobs {myJobs.length > 0 && `· ${myJobs.length}`}
              </p>
              {state.isLoading ? (
                <SkeletonList count={2} />
              ) : myJobs.length === 0 ? (
                <EmptyState
                  icon={<Briefcase className="w-10 h-10 text-gray-300" />}
                  title="No active jobs"
                  subtitle="Accept a job from the Jobs tab to get started"
                />
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="space-y-3"
                >
                  {myJobs.map((job) => (
                    <motion.div key={job.id} variants={cardItem}>
                      <ActiveJobCard job={job} onComplete={() => handleCompleteJob(job)} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'earnings' && (
            <motion.div key="earnings" {...tabContent} className="space-y-4">
              {/* Balance hero */}
              <div className="bg-gradient-to-br from-[#0A7A46] to-[#0FB86A] rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white/70 text-xs font-medium">Total Earnings</p>
                  <TrendingUp className="w-4 h-4 text-white/60" />
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold font-mono"
                >
                  KES {wallet?.balance.toLocaleString() || '0'}
                </motion.p>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-colors">Withdraw</button>
                  <button className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-colors">History</button>
                </div>
              </div>

              {/* Rep ring */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-sm font-semibold text-[#0B0F0E] mb-3">Your Reputation</p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-4 border-[#0A7A46] flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-[#0A7A46]">{workerProfile?.reputationScore || 0}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[
                      { label: 'Rating', value: `⭐ ${workerProfile?.rating?.toFixed(1) || '0.0'}` },
                      { label: 'Completed', value: `${workerProfile?.completedJobs || 0} jobs` },
                      { label: 'On-time Rate', value: `${workerProfile?.onTimeArrivalRate || 0}%` },
                    ].map(s => (
                      <div key={s.label} className="flex justify-between text-sm">
                        <span className="text-gray-400">{s.label}</span>
                        <span className="font-semibold text-[#0B0F0E]">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transactions */}
              {(wallet?.transactions?.length || 0) > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Transactions</p>
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-2"
                  >
                    {wallet?.transactions.slice(0, 5).map((tx) => (
                      <motion.div
                        key={tx.id}
                        variants={cardItem}
                        className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-100' : 'bg-red-50'}`}>
                            <span className={`text-lg font-bold leading-none ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                              {tx.type === 'credit' ? '+' : '−'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#0B0F0E]">{tx.description}</p>
                            <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</p>
                          </div>
                        </div>
                        <span className={`font-bold font-mono text-sm ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {tx.type === 'credit' ? '+' : '−'} {tx.amount.toLocaleString()}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Availability Bottom Sheet ── */}
      <AnimatePresence>
        {showAvailabilityModal && (
          <>
            <motion.div
              {...backdrop}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowAvailabilityModal(false)}
            />
            <motion.div
              {...bottomSheet}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 px-4 pt-4 pb-8"
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
              <p className="text-base font-bold text-[#0B0F0E] mb-4">Set Your Availability</p>
              <div className="space-y-2">
                {([
                  { val: 'available', dot: 'bg-emerald-500', label: 'Available', sub: 'Receive job notifications', activeBg: 'border-emerald-500 bg-emerald-50' },
                  { val: 'busy', dot: 'bg-orange-500', label: 'Busy', sub: "Won't receive new notifications", activeBg: 'border-orange-500 bg-orange-50' },
                  { val: 'offline', dot: 'bg-gray-400', label: 'Offline', sub: 'Invisible to clients', activeBg: 'border-gray-400 bg-gray-50' },
                ] as const).map((opt) => (
                  <motion.button
                    key={opt.val}
                    {...buttonPress}
                    onClick={() => handleSetAvailability(opt.val)}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                      workerProfile?.availability === opt.val ? opt.activeBg : 'border-transparent bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${opt.dot}`} />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm text-[#0B0F0E]">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.sub}</p>
                    </div>
                    <AnimatePresence>
                      {workerProfile?.availability === opt.val && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Check className="w-5 h-5 text-[#0A7A46]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

// ── Sub-components ──

function JobCard({ job, onAccept, disabled }: { job: Job; onAccept: () => void; disabled: boolean }) {
  return (
    <motion.div
      {...buttonPress}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-[#0B0F0E] text-sm pr-2">{job.title}</h4>
        <JobStatusBadge status={job.status} />
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{job.description}</p>
      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location.address.split(',')[0]}</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.preferredTime}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-bold font-mono text-[#0A7A46] text-base">KES {job.budget.toLocaleString()}</span>
        <motion.button
          {...buttonPress}
          onClick={onAccept}
          disabled={disabled}
          className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
            disabled ? 'bg-gray-100 text-gray-400' : 'bg-[#0B0F0E] text-white hover:bg-gray-800'
          }`}
        >
          {disabled ? 'Busy' : 'Accept'}
        </motion.button>
      </div>
    </motion.div>
  );
}

function ActiveJobCard({ job, onComplete }: { job: Job; onComplete: () => void }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-[#0B0F0E] text-sm">{job.title}</h4>
        <JobStatusBadge status={job.status} />
      </div>
      <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
        <MapPin className="w-3 h-3" />{job.location.address}
      </p>
      <div className="flex items-center justify-between">
        <span className="font-bold font-mono text-[#0A7A46]">KES {job.budget.toLocaleString()}</span>
        {job.status === 'in-progress' && (
          <motion.button
            {...buttonPress}
            onClick={onComplete}
            className="px-4 py-1.5 bg-[#0A7A46] text-white rounded-xl text-sm font-semibold hover:bg-[#0A7A46]/90 transition-colors"
          >
            Mark Complete
          </motion.button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl py-10 px-6 flex flex-col items-center text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 16 }}
        className="mb-4"
      >
        {icon}
      </motion.div>
      <p className="font-semibold text-[#0B0F0E] text-sm">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </motion.div>
  );
}

function SkeletonList({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between mb-3">
            <div className="h-4 bg-gray-100 rounded-lg w-2/5 skeleton" />
            <div className="h-4 bg-gray-100 rounded-lg w-1/5 skeleton" />
          </div>
          <div className="h-3 bg-gray-100 rounded-lg w-full mb-2 skeleton" />
          <div className="h-3 bg-gray-100 rounded-lg w-3/4 mb-3 skeleton" />
          <div className="flex justify-between">
            <div className="h-5 bg-gray-100 rounded-lg w-1/4 skeleton" />
            <div className="h-7 bg-gray-100 rounded-xl w-1/5 skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}
