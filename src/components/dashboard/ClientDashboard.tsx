import { useState } from 'react';
import { Plus, Search, MapPin, Star, Clock, Briefcase, Bell, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { JobStatusBadge } from '@/components/jobs/JobStatusBadge';
import { BottomNav } from './BottomNav';
import type { WorkerProfile } from '@/types';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface ClientDashboardProps {
  onPostJob: () => void;
}

export function ClientDashboard({ onPostJob }: ClientDashboardProps) {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'workers' | 'jobs'>('workers');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const user = state.currentUser!;

  const myJobs = state.jobs.filter(j => j.clientId === 'c1' || j.clientId === user.id);
  const workers = state.workers;

  // Get recent workers (previously hired)
  const recentWorkerIds = user.recentWorkers || ['w1', 'w3']; // Default for demo
  const recentWorkers = workers.filter(w => recentWorkerIds.includes(w.id));

  const categories = [
    { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
    { id: 'electrical', name: 'Electrical', icon: '⚡' },
    { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
    { id: 'painting', name: 'Painting', icon: '🎨' },
    { id: 'carpentry', name: 'Carpentry', icon: '🔨' },
    { id: 'gardening', name: 'Gardening', icon: '🌱' },
  ];

  const filteredWorkers = selectedCategory
    ? workers.filter(w => w.skills.includes(selectedCategory) && w.availability !== 'offline')
    : workers.filter(w => w.availability !== 'offline');

  const handleHireAgain = (worker: WorkerProfile) => {
    // Create a quick job request for this worker
    toast.success(`Job request sent to ${worker.nickname}`, {
      description: 'They will be notified and can accept or decline.',
    });
    
    // In a real app, this would create a direct job invitation
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: 'n' + Date.now(),
        userId: worker.userId,
        type: 'job',
        title: 'Direct Job Invitation',
        message: `${user.nickname || user.realName} wants to hire you again!`,
        data: { type: 'direct_invite', clientId: user.id },
        isRead: false,
        createdAt: new Date(),
      },
    });
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
              <p className="text-caption text-gray-500">Welcome</p>
              <p className="font-semibold">{user.nickname || user.realName}</p>
            </div>
          </div>
          <button className="relative p-2 rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" />
            {state.unreadNotifications > 0 && (
              <span className="notification-badge">{state.unreadNotifications}</span>
            )}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mt-4">
          <button 
            onClick={onPostJob}
            className="flex-1 bg-gray-900 text-white rounded-xl p-3 flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Post a Job</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white px-4 py-2 border-b border-gray-100">
        <div className="flex gap-1">
          {(['workers', 'jobs'] as const).map((tab) => (
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
        {activeTab === 'workers' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search workers by skill..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Recent Workers Section */}
            {state.isLoading ? (
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="flex-shrink-0 w-40 h-48 rounded-xl" />
                ))}
              </div>
            ) : recentWorkers.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Recent Workers</h3>
                  <span className="text-caption text-gray-500">
                    {recentWorkers.length} hired before
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                  {recentWorkers.map((worker) => (
                    <RecentWorkerCard 
                      key={worker.id} 
                      worker={worker} 
                      onHireAgain={() => handleHireAgain(worker)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-3">Browse by Category</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === null
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Workers List */}
            <div>
              <h3 className="font-semibold mb-3">
                {selectedCategory ? 'Available Workers' : 'Top Rated Workers'}
              </h3>
              <div className="space-y-3">
                {state.isLoading ? (
                  [1, 2, 3].map(i => (
                    <Skeleton key={i} className="w-full h-32 rounded-xl" />
                  ))
                ) : filteredWorkers.map((worker) => (
                  <WorkerCard key={worker.id} worker={worker} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <h3 className="font-semibold">My Jobs</h3>
            {state.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="w-full h-32 rounded-xl" />
                ))}
              </div>
            ) : myJobs.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No jobs posted yet</p>
                <p className="text-caption text-gray-400 mb-4">Post your first job to get started</p>
                <Button onClick={onPostJob} className="btn-primary">
                  <Plus className="w-4 h-4 mr-1" />
                  Post a Job
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {myJobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{job.title}</h4>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <p className="text-small text-gray-500 mb-2">{job.category}</p>
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
                      {job.workerId && (
                        <div className="flex items-center gap-2">
                          <img 
                            src={workers.find(w => w.id === job.workerId)?.photo} 
                            alt="Worker" 
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-caption text-gray-600">
                            {workers.find(w => w.id === job.workerId)?.nickname}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function RecentWorkerCard({ worker, onHireAgain }: { worker: WorkerProfile; onHireAgain: () => void }) {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-emerald-500';
      case 'busy': return 'bg-orange-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="flex-shrink-0 w-40 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
      <div className="relative">
        <img 
          src={worker.photo} 
          alt={worker.nickname} 
          className="w-14 h-14 rounded-full object-cover mx-auto"
        />
        <span className={`absolute bottom-0 right-8 w-3.5 h-3.5 rounded-full border-2 border-white ${getAvailabilityColor(worker.availability)}`} />
      </div>
      <p className="font-semibold text-sm text-center mt-2 truncate">{worker.nickname}</p>
      <div className="flex items-center justify-center gap-1 text-amber-500 text-xs mt-1">
        <Star className="w-3 h-3 fill-current" />
        <span>{worker.rating.toFixed(1)}</span>
        <span className="text-gray-400">|</span>
        <span className="text-emerald-600 font-medium">Rep: {worker.reputationScore}</span>
      </div>
      <p className="text-caption text-gray-500 text-center mt-1 truncate">
        {worker.skills[0]}
      </p>
      <Button
        onClick={onHireAgain}
        disabled={worker.availability !== 'available'}
        size="sm"
        className="w-full mt-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-white disabled:bg-gray-300"
      >
        <RotateCcw className="w-3 h-3 mr-1" />
        {worker.availability === 'available' ? 'Hire Again' : 'Unavailable'}
      </Button>
    </div>
  );
}

function WorkerCard({ worker }: { worker: WorkerProfile }) {
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
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start gap-3">
        <div className="relative">
          <img 
            src={worker.photo} 
            alt={worker.nickname} 
            className="profile-photo"
          />
          <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${getAvailabilityColor(worker.availability)}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold truncate">{worker.nickname}</h4>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{worker.rating.toFixed(1)}</span>
            </div>
          </div>
          
          {/* Reputation Score Display */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Rep: {worker.reputationScore}
            </span>
            <span className="text-caption text-gray-500">
              {worker.completedJobs} jobs done
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {worker.skills.slice(0, 3).map((skill) => (
              <span key={skill} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-caption text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {worker.location.address.split(',')[0]}
            </span>
            <span className={`text-caption font-medium ${
              worker.availability === 'available' ? 'text-emerald-600' : 
              worker.availability === 'busy' ? 'text-orange-500' : 'text-gray-400'
            }`}>
              {getAvailabilityLabel(worker.availability)}
            </span>
          </div>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full mt-3"
        disabled={worker.availability !== 'available'}
      >
        {worker.availability === 'available' ? 'Hire Now' : 
         worker.availability === 'busy' ? 'Currently Busy' : 'Offline'}
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
