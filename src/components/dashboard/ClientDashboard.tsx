import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MapPin, Star, Briefcase, Bell, ChevronRight, RotateCcw, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { JobStatusBadge } from '@/components/jobs/JobStatusBadge';
import { BottomNav } from './BottomNav';
import type { WorkerProfile } from '@/types';
import { toast } from 'sonner';
import { staggerContainer, cardItem, tabContent, backdrop, bottomSheet, buttonPress, livePulse } from '@/lib/motion';

interface ClientDashboardProps {
  onPostJob: () => void;
}

const CATEGORIES = [
  { id: 'plumbing', name: 'Plumbing', emoji: '🔧' },
  { id: 'electrical', name: 'Electrical', emoji: '⚡' },
  { id: 'cleaning', name: 'Cleaning', emoji: '🧹' },
  { id: 'painting', name: 'Painting', emoji: '🎨' },
  { id: 'carpentry', name: 'Carpentry', emoji: '🔨' },
  { id: 'gardening', name: 'Gardening', emoji: '🌱' },
  { id: 'moving', name: 'Moving', emoji: '📦' },
  { id: 'salon', name: 'Beauty', emoji: '✂️' },
];

export function ClientDashboard({ onPostJob }: ClientDashboardProps) {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'workers' | 'jobs'>('workers');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const user = state.currentUser!;

  const myJobs = state.jobs.filter(j => j.clientId === 'c1' || j.clientId === user.id);
  const workers = state.workers;
  const recentWorkers = workers.filter(w => (user.recentWorkers || ['w1', 'w3']).includes(w.id));
  const filteredWorkers = selectedCategory
    ? workers.filter(w => w.skills.includes(selectedCategory) && w.availability !== 'offline')
    : workers.filter(w => w.availability !== 'offline');

  const handleHireAgain = (worker: WorkerProfile) => {
    toast.success(`Request sent to ${worker.nickname}`, { description: 'They'll be notified right away.' });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: 'n' + Date.now(),
        userId: worker.userId,
        type: 'job',
        title: 'Direct Invite',
        message: `${user.nickname || user.realName} wants to hire you again!`,
        data: { type: 'direct_invite', clientId: user.id },
        isRead: false,
        createdAt: new Date(),
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-[--gigma-paper] overflow-hidden">

      {/* ── Header ── */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-[--gigma-line] flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={user.photo || 'https://via.placeholder.com/40'} alt="Profile"
                className="w-10 h-10 rounded-full object-cover border border-[--gigma-line]" />
              <motion.span animate={livePulse.animate} transition={livePulse.transition}
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[--gigma-green] rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="text-[11px] text-[--gigma-muted] font-medium">Welcome back</p>
              <p className="font-bold text-[--gigma-black] leading-tight" style={{ fontFamily: 'var(--gigma-display)' }}>
                {user.nickname || user.realName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-full hover:bg-[--gigma-paper] transition-colors">
              <Bell className="w-5 h-5 text-[--gigma-black]" />
              <AnimatePresence>
                {state.unreadNotifications > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                    {state.unreadNotifications}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Post Job CTA */}
        <motion.button
          {...buttonPress}
          onClick={onPostJob}
          className="w-full h-12 bg-[--gigma-black] text-white rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm"
          style={{ fontFamily: 'var(--gigma-display)' }}
        >
          <Plus className="w-4 h-4 text-[--gigma-green]" />
          Post a Job
        </motion.button>
      </div>

      {/* ── Tab Nav ── */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <div className="bg-white rounded-2xl p-1 flex gap-1">
          {(['workers', 'jobs'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="relative flex-1 py-2 rounded-xl text-sm font-semibold transition-colors">
              {activeTab === tab && (
                <motion.div layoutId="client-tab-pill"
                  className="absolute inset-0 bg-[--gigma-black] rounded-xl"
                  transition={{ type: 'spring', damping: 28, stiffness: 350 }} />
              )}
              <span className={`relative z-10 ${activeTab === tab ? 'text-white' : 'text-[--gigma-muted]'}`}
                style={{ fontFamily: 'var(--gigma-display)' }}>
                {tab === 'workers' ? 'Find Workers' : 'My Jobs'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <AnimatePresence mode="wait">

          {activeTab === 'workers' && (
            <motion.div key="workers" {...tabContent} className="space-y-4 pt-1">

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[--gigma-muted]" />
                <input type="text" placeholder="Search by skill, name..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[--gigma-line] bg-white text-sm focus:outline-none focus:border-[--gigma-green] focus:ring-2 focus:ring-[--gigma-green]/10 transition-all"
                  style={{ fontFamily: 'var(--gigma-sans)' }} />
              </div>

              {/* Categories */}
              <div>
                <p className="text-[11px] font-semibold text-[--gigma-muted] uppercase tracking-wider mb-2"
                  style={{ fontFamily: 'var(--gigma-display)' }}>Browse by category</p>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
                  <button onClick={() => setSelectedCategory(null)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      selectedCategory === null
                        ? 'bg-[--gigma-black] text-white border-[--gigma-black]'
                        : 'bg-white text-[--gigma-muted] border-[--gigma-line]'
                    }`} style={{ fontFamily: 'var(--gigma-display)' }}>
                    All
                  </button>
                  {CATEGORIES.map(cat => (
                    <motion.button key={cat.id} {...buttonPress}
                      onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                      className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                        selectedCategory === cat.id
                          ? 'bg-[--gigma-green] text-white border-[--gigma-green]'
                          : 'bg-white text-[--gigma-muted] border-[--gigma-line]'
                      }`} style={{ fontFamily: 'var(--gigma-display)' }}>
                      <span>{cat.emoji}</span>{cat.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Recent workers */}
              {recentWorkers.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-[--gigma-muted] uppercase tracking-wider mb-2"
                    style={{ fontFamily: 'var(--gigma-display)' }}>Hired before</p>
                  <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
                    {recentWorkers.map(w => (
                      <RecentWorkerCard key={w.id} worker={w} onHireAgain={() => handleHireAgain(w)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Workers list */}
              <div>
                <p className="text-[11px] font-semibold text-[--gigma-muted] uppercase tracking-wider mb-2"
                  style={{ fontFamily: 'var(--gigma-display)' }}>
                  {selectedCategory ? `${CATEGORIES.find(c => c.id === selectedCategory)?.name} Workers` : 'Top Rated Near You'}
                  {filteredWorkers.length > 0 && ` · ${filteredWorkers.length}`}
                </p>
                {filteredWorkers.length === 0 ? (
                  <EmptyState icon="🔍" title="No workers found" subtitle="Try a different category or check back later" />
                ) : (
                  <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
                    {filteredWorkers.map(worker => (
                      <motion.div key={worker.id} variants={cardItem}>
                        <WorkerCard worker={worker} onSelect={() => setSelectedWorker(worker)} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'jobs' && (
            <motion.div key="jobs" {...tabContent} className="space-y-3 pt-1">
              <p className="text-[11px] font-semibold text-[--gigma-muted] uppercase tracking-wider"
                style={{ fontFamily: 'var(--gigma-display)' }}>
                My Jobs {myJobs.length > 0 && `· ${myJobs.length}`}
              </p>
              {myJobs.length === 0 ? (
                <EmptyState icon="📋" title="No jobs yet" subtitle="Post your first job and get matched to a worker in seconds">
                  <motion.button {...buttonPress} onClick={onPostJob}
                    className="mt-4 px-5 py-2.5 bg-[--gigma-black] text-white rounded-2xl text-sm font-semibold flex items-center gap-2 mx-auto"
                    style={{ fontFamily: 'var(--gigma-display)' }}>
                    <Plus className="w-4 h-4 text-[--gigma-green]" /> Post a Job
                  </motion.button>
                </EmptyState>
              ) : (
                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
                  {myJobs.map(job => (
                    <motion.div key={job.id} variants={cardItem}
                      className="bg-white rounded-2xl p-4 border border-[--gigma-line]">
                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="font-bold text-[--gigma-black] text-sm pr-2"
                          style={{ fontFamily: 'var(--gigma-display)' }}>{job.title}</h4>
                        <JobStatusBadge status={job.status} />
                      </div>
                      <p className="text-xs text-[--gigma-muted] mb-2">{job.category}</p>
                      <div className="flex items-center gap-3 text-xs text-[--gigma-muted] mb-3">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location.address.split(',')[0]}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[--gigma-line]">
                        <span className="font-bold text-[--gigma-green-strong] text-base"
                          style={{ fontFamily: 'var(--gigma-mono)' }}>
                          KES {job.budget.toLocaleString()}
                        </span>
                        {job.workerId && (() => {
                          const w = workers.find(x => x.id === job.workerId);
                          return w ? (
                            <div className="flex items-center gap-2">
                              <img src={w.photo} alt={w.nickname} className="w-6 h-6 rounded-full" />
                              <span className="text-xs font-medium text-[--gigma-black]">{w.nickname}</span>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Worker Detail Sheet ── */}
      <AnimatePresence>
        {selectedWorker && (
          <>
            <motion.div {...{ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }}
              className="absolute inset-0 bg-black/40 z-40"
              onClick={() => setSelectedWorker(null)} />
            <motion.div {...bottomSheet}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 px-4 pt-4 pb-8">
              <div className="w-10 h-1 bg-[--gigma-line] rounded-full mx-auto mb-5" />
              <div className="flex items-start gap-4 mb-5">
                <div className="relative">
                  <img src={selectedWorker.photo} alt={selectedWorker.nickname}
                    className="w-16 h-16 rounded-2xl object-cover" />
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    selectedWorker.availability === 'available' ? 'bg-[--gigma-green]' : 'bg-orange-400'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[--gigma-black] text-lg leading-tight"
                    style={{ fontFamily: 'var(--gigma-display)' }}>{selectedWorker.nickname}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    <span className="text-sm font-semibold text-[--gigma-black]">{selectedWorker.rating.toFixed(1)}</span>
                    <span className="text-xs text-[--gigma-muted]">· {selectedWorker.completedJobs} jobs</span>
                    <span className="ml-auto text-xs font-semibold text-[--gigma-green-strong] bg-emerald-50 px-2 py-0.5 rounded-full">
                      Rep {selectedWorker.reputationScore}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {selectedWorker.skills.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-[--gigma-paper] text-[--gigma-black] text-xs font-medium rounded-full border border-[--gigma-line]">
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <motion.button {...buttonPress}
                  disabled={selectedWorker.availability !== 'available'}
                  onClick={() => { handleHireAgain(selectedWorker); setSelectedWorker(null); }}
                  className={`flex-1 h-12 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 ${
                    selectedWorker.availability === 'available'
                      ? 'bg-[--gigma-black] text-white'
                      : 'bg-[--gigma-paper] text-[--gigma-muted]'
                  }`} style={{ fontFamily: 'var(--gigma-display)' }}>
                  <Zap className="w-4 h-4 text-[--gigma-green]" />
                  {selectedWorker.availability === 'available' ? 'Hire Now' : 'Currently Busy'}
                </motion.button>
                <motion.button {...buttonPress}
                  onClick={() => setSelectedWorker(null)}
                  className="px-4 h-12 rounded-2xl border border-[--gigma-line] text-[--gigma-black] font-semibold text-sm"
                  style={{ fontFamily: 'var(--gigma-display)' }}>
                  Close
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

function RecentWorkerCard({ worker, onHireAgain }: { worker: WorkerProfile; onHireAgain: () => void }) {
  return (
    <motion.div {...buttonPress}
      className="flex-shrink-0 w-36 bg-white rounded-2xl p-3 border border-[--gigma-line] cursor-pointer">
      <div className="relative mb-2">
        <img src={worker.photo} alt={worker.nickname} className="w-12 h-12 rounded-xl object-cover mx-auto" />
        <span className={`absolute -bottom-0.5 right-8 w-3 h-3 rounded-full border-2 border-white ${
          worker.availability === 'available' ? 'bg-[--gigma-green]' : 'bg-orange-400'}`} />
      </div>
      <p className="font-bold text-xs text-center text-[--gigma-black] truncate"
        style={{ fontFamily: 'var(--gigma-display)' }}>{worker.nickname}</p>
      <p className="text-[10px] text-[--gigma-muted] text-center mt-0.5 truncate">{worker.skills[0]}</p>
      <div className="flex items-center justify-center gap-1 mt-1">
        <Star className="w-3 h-3 text-amber-400 fill-current" />
        <span className="text-[10px] font-semibold text-[--gigma-black]">{worker.rating.toFixed(1)}</span>
      </div>
      <motion.button {...buttonPress}
        onClick={onHireAgain}
        disabled={worker.availability !== 'available'}
        className={`w-full mt-2 py-1.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 ${
          worker.availability === 'available'
            ? 'bg-[--gigma-black] text-white'
            : 'bg-[--gigma-paper] text-[--gigma-muted]'
        }`} style={{ fontFamily: 'var(--gigma-display)' }}>
        <RotateCcw className="w-2.5 h-2.5" />
        {worker.availability === 'available' ? 'Hire Again' : 'Busy'}
      </motion.button>
    </motion.div>
  );
}

function WorkerCard({ worker, onSelect }: { worker: WorkerProfile; onSelect: () => void }) {
  const dotColor = worker.availability === 'available' ? 'bg-[--gigma-green]'
    : worker.availability === 'busy' ? 'bg-orange-400' : 'bg-gray-300';
  const statusText = worker.availability === 'available' ? 'Available'
    : worker.availability === 'busy' ? 'On a job' : 'Offline';

  return (
    <motion.div {...buttonPress} onClick={onSelect}
      className="bg-white rounded-2xl p-4 border border-[--gigma-line] cursor-pointer active:scale-[0.98]">
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <img src={worker.photo} alt={worker.nickname} className="w-14 h-14 rounded-2xl object-cover" />
          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${dotColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h4 className="font-bold text-[--gigma-black] text-sm truncate"
              style={{ fontFamily: 'var(--gigma-display)' }}>{worker.nickname}</h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span className="text-sm font-bold text-[--gigma-black]">{worker.rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-[--gigma-green-strong] bg-emerald-50 px-2 py-0.5 rounded-full">
              Rep {worker.reputationScore}
            </span>
            <span className="text-xs text-[--gigma-muted]">{worker.completedJobs} jobs</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {worker.skills.slice(0, 3).map(s => (
              <span key={s} className="text-[10px] px-2 py-0.5 bg-[--gigma-paper] text-[--gigma-muted] rounded-full border border-[--gigma-line]">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[--gigma-line]">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className="text-xs text-[--gigma-muted]">{statusText}</span>
          <span className="text-[--gigma-line]">·</span>
          <span className="text-xs text-[--gigma-muted] flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />{worker.location?.address?.split(',')[0] || 'Nairobi'}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-[--gigma-muted]" />
      </div>
    </motion.div>
  );
}

function EmptyState({ icon, title, subtitle, children }: { icon: string; title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl py-10 px-6 flex flex-col items-center text-center border border-[--gigma-line]">
      <motion.span initial={{ scale: 0.7 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 14, delay: 0.1 }}
        className="text-4xl mb-3 block">{icon}</motion.span>
      <p className="font-bold text-[--gigma-black] text-sm mb-1"
        style={{ fontFamily: 'var(--gigma-display)' }}>{title}</p>
      <p className="text-xs text-[--gigma-muted] leading-relaxed">{subtitle}</p>
      {children}
    </motion.div>
  );
}
