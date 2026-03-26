import { useState } from 'react';
import { MapPin, Clock, Star, Briefcase, Wallet, Bell, Search, Filter, Check, X, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { JobStatusBadge } from '@/components/jobs/JobStatusBadge';
import { BottomNav } from './BottomNav';
import type { Job } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export function WorkerDashboard() {
  const { state, dispatch, acceptJob, completeJob, updateWorker } = useApp();
  const [activeTab, setActiveTab] = useState<'jobs' | 'active' | 'earnings'>('jobs');
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const user = state.currentUser!;
  
  // Get current worker profile
  const workerProfile = state.workers.find(w => w.userId === user.id) || state.workers[0];

  // Get job notifications for this worker
  const jobNotifications = state.notifications.filter(
    n => n.userId === user.id && 
    n.type === 'job' && 
    n.data?.type === 'job_broadcast' &&
    !n.isRead &&
    (!n.expiresAt || new Date(n.expiresAt) > new Date())
  );

  // Get available jobs (not assigned, within radius)
  const availableJobs = state.jobs.filter(j => 
    j.status === 'ready' && 
    !j.workerId &&
    (!j.notifiedWorkerIds || j.notifiedWorkerIds.includes(workerProfile?.id))
  );

  // Get my active jobs
  const myJobs = state.jobs.filter(j => 
    j.workerId === workerProfile?.id || 
    (j.status === 'in-progress' && j.workerId === workerProfile?.id)
  );

  const wallet = state.wallet;

  const handleAcceptJob = async (job: Job) => {
    // Check if worker is available
    if (workerProfile?.availability === 'busy' || workerProfile?.currentJobId) {
      return; // Cannot accept if busy
    }

    try {
      await acceptJob(job.id, workerProfile?.id || 'w1');
    } catch (err) {
      console.error('Failed to accept job:', err);
    }
  };

  const handleCompleteJob = async (job: Job) => {
    try {
      await completeJob(job.id);
      
      // Update worker profile
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

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-emerald-500';
      case 'busy': return 'bg-orange-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={user.photo || 'https://via.placeholder.com/40'} 
              alt="Profile" 
              className="profile-photo-sm"
            />
            <div>
              <p className="text-caption text-gray-500">Welcome back</p>
              <p className="font-semibold">{user.nickname || user.realName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Availability Toggle */}
            <button 
              onClick={() => setShowAvailabilityModal(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                workerProfile?.availability === 'available' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : workerProfile?.availability === 'busy'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${getAvailabilityColor(workerProfile?.availability)}`} />
              {getAvailabilityLabel(workerProfile?.availability)}
            </button>
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
              {state.unreadNotifications > 0 && (
                <span className="notification-badge">{state.unreadNotifications}</span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-emerald-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Wallet className="w-4 h-4" />
              <span className="text-caption font-medium">Balance</span>
            </div>
            <p className="text-mono font-semibold text-emerald-900">
              KES {wallet?.balance.toLocaleString() || '0'}
            </p>
          </div>
          <div className="flex-1 bg-blue-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Briefcase className="w-4 h-4" />
              <span className="text-caption font-medium">Jobs Done</span>
            </div>
            <p className="font-semibold text-blue-900">{workerProfile?.completedJobs || 0}</p>
          </div>
          <div className="flex-1 bg-amber-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-caption font-medium">Rep. Score</span>
            </div>
            <p className="font-semibold text-amber-900">{workerProfile?.reputationScore || 0}</p>
          </div>
        </div>
      </div>

      {/* Job Notification Banners */}
      {jobNotifications.length > 0 && (
        <div className="px-4 pt-4 space-y-2">
          {jobNotifications.map((notification) => {
            const job = state.jobs.find(j => j.id === notification.data?.jobId);
            if (!job) return null;
            
            return (
              <div key={notification.id} className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white animate-fade-in">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">New Job Near You!</p>
                      <p className="text-emerald-100 text-sm">{job.title}</p>
                      <p className="text-emerald-100 text-sm">Budget: KES {job.budget.toLocaleString()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notification.id })}
                    className="p-1 hover:bg-white/20 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={() => handleAcceptJob(job)}
                    disabled={workerProfile?.availability === 'busy'}
                    size="sm"
                    className="flex-1 bg-white text-emerald-600 hover:bg-emerald-50"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept Job
                  </Button>
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
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white px-4 py-2 border-b border-gray-100">
        <div className="flex gap-1">
          {(['jobs', 'active', 'earnings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {/* Search & Filter */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50">
                <Filter className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Availability Warning */}
            {workerProfile?.availability === 'busy' && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-orange-900">You're currently busy</p>
                  <p className="text-sm text-orange-700">Complete your active job to accept new ones</p>
                </div>
              </div>
            )}

            {/* Available Jobs */}
            <div>
              <h3 className="font-semibold mb-3">Available Near You</h3>
              {state.isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="w-full h-32 rounded-xl" />
                  ))}
                </div>
              ) : availableJobs.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No jobs available right now</p>
                  <p className="text-caption text-gray-400">Check back soon!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableJobs.map((job) => (
                    <div key={job.id} className="job-card">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{job.title}</h4>
                        <JobStatusBadge status={job.status} />
                      </div>
                      <p className="text-small text-gray-500 mb-3 line-clamp-2">
                        {job.description}
                      </p>
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
                        <Button
                          onClick={() => handleAcceptJob(job)}
                          disabled={workerProfile?.availability === 'busy'}
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:bg-gray-300"
                        >
                          {workerProfile?.availability === 'busy' ? 'Busy' : 'Accept'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'active' && (
          <div className="space-y-4">
            <h3 className="font-semibold">My Active Jobs</h3>
            {state.isLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="w-full h-32 rounded-xl" />
                ))}
              </div>
            ) : myJobs.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active jobs</p>
                <p className="text-caption text-gray-400">Accept a job to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myJobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{job.title}</h4>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <p className="text-small text-gray-500 mb-3">
                      {job.location.address}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-mono font-semibold">
                        KES {job.budget.toLocaleString()}
                      </span>
                      {job.status === 'in-progress' && (
                        <Button
                          onClick={() => handleCompleteJob(job)}
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="space-y-4">
            {/* Total Earnings Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
              <p className="text-emerald-100 text-sm mb-1">Total Earnings</p>
              <p className="text-3xl font-bold">
                KES {wallet?.balance.toLocaleString() || '0'}
              </p>
              <div className="flex gap-3 mt-4">
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white/20 text-white hover:bg-white/30 border-0"
                >
                  Withdraw
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white/20 text-white hover:bg-white/30 border-0"
                >
                  History
                </Button>
              </div>
            </div>

            {/* Reputation Stats */}
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-semibold mb-3">Your Reputation</h3>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-600">
                    {workerProfile?.reputationScore || 0}
                  </span>
                </div>
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
            </div>

            {/* Recent Transactions */}
            <div>
              <h3 className="font-semibold mb-3">Recent Transactions</h3>
              <div className="space-y-2">
                {wallet?.transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'credit' ? 'bg-emerald-100' : 'bg-red-100'
                      }`}>
                        {tx.type === 'credit' ? (
                          <span className="text-emerald-600 text-lg">+</span>
                        ) : (
                          <span className="text-red-600 text-lg">-</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tx.description}</p>
                        <p className="text-caption text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`font-semibold ${
                      tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'} KES {tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-slide-in">
            <h3 className="text-lg font-semibold mb-4">Set Your Availability</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleSetAvailability('available')}
                className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${
                  workerProfile?.availability === 'available'
                    ? 'bg-emerald-50 border-2 border-emerald-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="text-left">
                  <p className="font-medium">Available</p>
                  <p className="text-sm text-gray-500">Receive job notifications</p>
                </div>
                {workerProfile?.availability === 'available' && (
                  <Check className="w-5 h-5 text-emerald-500 ml-auto" />
                )}
              </button>
              
              <button
                onClick={() => handleSetAvailability('busy')}
                className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${
                  workerProfile?.availability === 'busy'
                    ? 'bg-orange-50 border-2 border-orange-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-orange-500" />
                <div className="text-left">
                  <p className="font-medium">Busy</p>
                  <p className="text-sm text-gray-500">Won't receive new job notifications</p>
                </div>
                {workerProfile?.availability === 'busy' && (
                  <Check className="w-5 h-5 text-orange-500 ml-auto" />
                )}
              </button>
              
              <button
                onClick={() => handleSetAvailability('offline')}
                className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${
                  workerProfile?.availability === 'offline'
                    ? 'bg-gray-100 border-2 border-gray-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                <div className="text-left">
                  <p className="font-medium">Offline</p>
                  <p className="text-sm text-gray-500">Invisible to clients</p>
                </div>
                {workerProfile?.availability === 'offline' && (
                  <Check className="w-5 h-5 text-gray-500 ml-auto" />
                )}
              </button>
            </div>
            <Button
              onClick={() => setShowAvailabilityModal(false)}
              variant="outline"
              className="w-full mt-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
