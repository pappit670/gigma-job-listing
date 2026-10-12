import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Star, Briefcase, Wallet, Bell, Search, Filter, Check, X, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { JobStatusBadge } from '@/components/jobs/JobStatusBadge';
import { BottomNav } from './BottomNav';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { JobCardSkeleton, StatCardSkeleton, TransactionSkeleton } from '@/components/ui/SkeletonCard';
import {
  pageTransition,
  staggerContainer,
  cardItem,
  notificationBanner,
  tabContent,
  buttonPress,
  livePulse,
} from '@/lib/motion';
import type { Job } from '@/types';

export function WorkerDashboard() {
  const { state, dispatch, acceptJob, completeJob, updateWorker } = useApp();
  const [activeTab, setActiveTab] = useState<'jobs' | 'active' | 'earnings'>('jobs');
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [acceptingJobId, setAcceptingJobId] = useState<string | null>(null);
  const user = state.currentUser!;

  const workerProfile = state.workers.find(w => w.userId === user.id) || state.workers[0];

  const jobNotifications = state.notifications.filter(
    n => n.userId === user.id &&
    n.type === 'job' &&
    n.data?.type === 'job_broadcast' &&
    !n.isRead &&
    (!n.expiresAt || new Date(n.expiresAt) > new Date())
  );

  const availableJobs = state.jobs.filter(j =>
    j.status === 'ready' &&
    !j.workerId &&
    (!j.notifiedWorkerIds || j.notifiedWorkerIds.includes(workerProfile?.id))
  );

  const myJobs = state.jobs.filter(j =>
    j.workerId === workerProfile?.id ||
    (j.status === 'in-progress' && j.workerId === workerProfile?.id)
  );

  const wallet = state.wallet;

  const handleAcceptJob = async (job: Job) => {
    if (workerProfile?.availability === 'busy' || workerProfile?.currentJobId) return;
    setAcceptingJobId(job.id);
    try {
      await acceptJob(job.id, workerProfile?.id || 'w1');
    } catch (err) {
      console.error('Failed to accept job:', err);
    } finally {
      setAcceptingJobId(null);
    }
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
    } catch (err) {
      console.error('Failed to complete job:', err);
    }
  };

  const handleSetAvailability = async (availability: 'available' | 'busy' | 'offline') => {
    if (workerProfile) {
      try {
        await updateWorker(user.id, { availability });
      } catch (err) {
        console.error('Failed to set availability:', err);
      }
    }
    setShowAvailabilityModal(false);
  };

  const availabilityConfig = {
    available: { dot: 'bg-emerald-500', pill: 'bg-emerald-100 text-emerald-700', label: 'Available' },
    busy: { dot: 'bg-orange-500', pill: 'bg-orange-100 text-orange-700', label: 'Busy' },
    offline: { dot: 'bg-gray-400', pill: 'bg-gray-100 text-gray-600', label: 'Offline' },
  };
  const avail = availabilityConfig[workerProfile?.availability as keyof typeof availabilityConfig] || availabilityConfig.offline;

  const tabs = ['jobs', 'active', 'earnings'] as const;

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-gray-50 pb-20">

      {/* ── Header ── */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.img
              whileTap={{ scale: 0.93 }}
              src={user.photo || 'https://via.placeholder.com/40'}
              alt="Profile"
              className="profile-photo-sm cursor-pointer"
            />
            <div>
              <p className="text-caption text-gray-500">Welcome back</p>
              <p className="font-semibold">{user.nickname || user.realName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Availability pill */}
            <motion.button
              {...buttonPress}
              onClick={() => setShowAvailabilityModal(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${avail.pill}`}
            >
              <motion.span
                className={`w-2 h-2 rounded-full ${avail.dot}`}
                {...(workerProfile?.availability === 'available' ? livePulse : {})}
              />
              {avail.label}
            </motion.button>

            <motion.button
              {...buttonPress}
              className="relative p-2 rounded-full hover:bg-gray-100"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <AnimatePresence>
                {state.unreadNotifications > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="notification-badge"
                  >
                    {state.unreadNotifications}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-3 mt-4">
          {state.isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex gap-3 w-full"
            >
              <motion.div variants={cardItem} className="flex-1 bg-emerald-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Wallet className="w-4 h-4" />
                  <span className="text-caption font-medium">Balance</span>
                </div>
                <p className="text-mono font-semibold text-emerald-900">
                  KES {wallet?.balance.toLocaleString() || '0'}
                </p>
              </motion.div>

              <motion.div variants={cardItem} className="flex-1 bg-blue-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-caption font-medium">Jobs Done</span>
                </div>
                <p className="font-semibold text-blue-900">{workerProfile?.completedJobs || 0}</p>
              </motion.div>

              <motion.div variants={cardItem} className="flex-1 bg-amber-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-amber-600 mb-1">
                  <Star className="w-4 h-4" />
                  <span className="text-caption font-medium">Rep.</span>
                </div>
                <p className="font-semibold text-amber-900">{workerProfile?.reputationScore || 0}</p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Notification Banners ── */}
      <AnimatePresence>
        {jobNotifications.length > 0 && (
          <div className="px-4 pt-4 space-y-2">
            {jobNotifications.map((notification) => {
              const job = state.jobs.find(j => j.id === notification.data?.jobId);
              if (!job) return null;
              return (
                <motion.div
                  key={notification.id}
                  {...notificationBanner}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -5, 0] }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                      >
                        <Zap className="w-5 h-5" />
                      </motion.div>
                      <div>
                        <p className="font-semibold">New Job Near You!</p>
                        <p className="text-emerald-100 text-sm">{job.title}</p>
                        <p className="text-emerald-100 text-sm">KES {job.budget.toLocaleString()}</p>
                      </div>
                    </div>
                    <motion.button
                      {...buttonPress}
                      onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notification.id })}
                      className="p-1 hover:bg-white/20 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <motion.div {...buttonPress} className="flex-1">
                      <Button
                        onClick={() => handleAcceptJob(job)}
                        disabled={workerProfile?.availability === 'busy' || acceptingJobId === job.id}
                        size="sm"
                        className="w-full bg-white text-emerald-600 hover:bg-emerald-50"
                      >
                        {acceptingJobId === job.id ? (
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full inline-block"
                          />
                        ) : (
                          <><Check className="w-4 h-4 mr-1" />Accept Job</>
                        )}
                      </Button>
                    </motion.div>
                    <Button
                      onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notification.id })}
                      size="sm"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Ignore
                    </Button>
                  </div>

                  {workerProfile?.availability === 'busy' && (
                    <p className="text-emerald-100 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Complete your current job first
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* ── Tab Bar ── */}
      <div className="bg-white px-4 py-2 border-b border-gray-100">
        <div className="flex gap-1 relative">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors z-10 ${
                activeTab === tab ? 'text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {activeTab === tab && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 bg-gray-900 rounded-lg"
                  transition={{ type: 'spring', damping: 26, stiffness: 380 }}
                />
              )}
              <span className="relative z-10 capitalize">{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} {...tabContent} className="p-4">

          {/* ── Jobs Tab ── */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <motion.button
                  {...buttonPress}
                  className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4 text-gray-600" />
                </motion.button>
              </div>

              {workerProfile?.availability === 'busy' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-orange-900">You're currently busy</p>
                    <p className="text-sm text-orange-700">Complete your active job to accept new ones</p>
                  </div>
                </motion.div>
              )}

              <div>
                <h3 className="font-semibold mb-3">Available Near You</h3>
                {state.isLoading ? (
                  <div className="space-y-3">
                    <JobCardSkeleton />
                    <JobCardSkeleton />
                    <JobCardSkeleton />
                  </div>
                ) : availableJobs.length === 0 ? (
                  <div className="bg-white rounded-2xl">
                    <EmptyState
                      icon={<Briefcase className="w-8 h-8" />}
                      title="No jobs right now"
                      subtitle="New gigs show up here. Stay available and you'll be first to know."
                    />
                  </div>
                ) : (
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-3"
                  >
                    {availableJobs.map((job) => (
                      <motion.div
                        key={job.id}
                        variants={cardItem}
                        whileTap={{ scale: 0.98 }}
                        className="job-card"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{job.title}</h4>
                          <JobStatusBadge status={job.status} />
                        </div>
                        <p className="text-small text-gray-500 mb-3 line-clamp-2">{job.description}</p>
                        <div className="flex items-center gap-4 text-caption text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location.address.split(',')[0]}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {job.preferredTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-mono font-semibold text-emerald-600">
                            KES {job.budget.toLocaleString()}
                          </span>
                          <motion.div {...buttonPress}>
                            <Button
                              onClick={() => handleAcceptJob(job)}
                              disabled={workerProfile?.availability === 'busy' || acceptingJobId === job.id}
                              size="sm"
                              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:bg-gray-300"
                            >
                              {acceptingJobId === job.id ? (
                                <motion.span
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                  className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full inline-block"
                                />
                              ) : workerProfile?.availability === 'busy' ? 'Busy' : 'Accept'}
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* ── Active Tab ── */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              <h3 className="font-semibold">My Active Jobs</h3>
              {state.isLoading ? (
                <div className="space-y-3">
                  <JobCardSkeleton />
                  <JobCardSkeleton />
                </div>
              ) : myJobs.length === 0 ? (
                <div className="bg-white rounded-2xl">
                  <EmptyState
                    icon={<Briefcase className="w-8 h-8" />}
                    title="No active jobs"
                    subtitle="Accept a job from the Jobs tab to get started."
                  />
                </div>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="space-y-3"
                >
                  {myJobs.map((job) => (
                    <motion.div key={job.id} variants={cardItem} className="job-card">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{job.title}</h4>
                        <JobStatusBadge status={job.status} />
                      </div>
                      <p className="text-small text-gray-500 mb-3">{job.location.address}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-mono font-semibold">KES {job.budget.toLocaleString()}</span>
                        {job.status === 'in-progress' && (
                          <motion.div {...buttonPress}>
                            <Button
                              onClick={() => handleCompleteJob(job)}
                              size="sm"
                              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                            >
                              Mark Complete
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {/* ── Earnings Tab ── */}
          {activeTab === 'earnings' && (
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white"
              >
                <p className="text-emerald-100 text-sm mb-1">Total Earnings</p>
                <motion.p
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 260 }}
                  className="text-3xl font-bold"
                >
                  KES {wallet?.balance.toLocaleString() || '0'}
                </motion.p>
                <div className="flex gap-3 mt-4">
                  <motion.div {...buttonPress}>
                    <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30 border-0">
                      Withdraw
                    </Button>
                  </motion.div>
                  <motion.div {...buttonPress}>
                    <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30 border-0">
                      History
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              {/* Reputation */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="bg-white rounded-xl p-4"
              >
                <h3 className="font-semibold mb-3">Your Reputation</h3>
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 16, stiffness: 240, delay: 0.12 }}
                    className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center"
                  >
                    <span className="text-2xl font-bold text-emerald-600">
                      {workerProfile?.reputationScore || 0}
                    </span>
                  </motion.div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Rating</span>
                      <span className="font-medium flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                        {workerProfile?.rating.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Completed Jobs</span>
                      <span className="font-medium">{workerProfile?.completedJobs || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">On-time Rate</span>
                      <span className="font-medium">{workerProfile?.onTimeArrivalRate || 0}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Transactions */}
              <div>
                <h3 className="font-semibold mb-3">Recent Transactions</h3>
                {state.isLoading ? (
                  <div className="space-y-2">
                    <TransactionSkeleton />
                    <TransactionSkeleton />
                    <TransactionSkeleton />
                  </div>
                ) : !wallet?.transactions?.length ? (
                  <div className="bg-white rounded-2xl">
                    <EmptyState
                      icon={<Wallet className="w-8 h-8" />}
                      title="No transactions yet"
                      subtitle="Your earnings will appear here after your first completed job."
                    />
                  </div>
                ) : (
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-2"
                  >
                    {wallet.transactions.slice(0, 5).map((tx) => (
                      <motion.div
                        key={tx.id}
                        variants={cardItem}
                        className="bg-white rounded-xl p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === 'credit' ? 'bg-emerald-100' : 'bg-red-100'
                          }`}>
                            <span className={`text-lg font-medium ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                              {tx.type === 'credit' ? '+' : '-'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{tx.description}</p>
                            <p className="text-caption text-gray-500">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`font-semibold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {tx.type === 'credit' ? '+' : '-'} KES {tx.amount.toLocaleString()}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* ── Availability Bottom Sheet ── */}
      <BottomSheet
        open={showAvailabilityModal}
        onClose={() => setShowAvailabilityModal(false)}
        title="Set Your Availability"
      >
        <div className="space-y-2">
          {(['available', 'busy', 'offline'] as const).map((status) => {
            const config = availabilityConfig[status];
            const isActive = workerProfile?.availability === status;
            return (
              <motion.button
                key={status}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSetAvailability(status)}
                className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${
                  isActive ? 'border-2' : 'border-2 border-transparent'
                } ${
                  isActive && status === 'available' ? 'bg-emerald-50 border-emerald-500' :
                  isActive && status === 'busy' ? 'bg-orange-50 border-orange-500' :
                  isActive && status === 'offline' ? 'bg-gray-100 border-gray-400' :
                  'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${config.dot}`} />
                <div className="text-left flex-1">
                  <p className="font-medium capitalize">{status}</p>
                  <p className="text-sm text-gray-500">
                    {status === 'available' ? 'Receive job notifications' :
                     status === 'busy' ? "Won't receive new job notifications" :
                     'Invisible to clients'}
                  </p>
                </div>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className={`w-5 h-5 ${
                        status === 'available' ? 'text-emerald-500' :
                        status === 'busy' ? 'text-orange-500' : 'text-gray-500'
                      }`} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
        <Button
          onClick={() => setShowAvailabilityModal(false)}
          variant="outline"
          className="w-full mt-4"
        >
          Cancel
        </Button>
      </BottomSheet>

      <BottomNav />
    </motion.div>
  );
}
