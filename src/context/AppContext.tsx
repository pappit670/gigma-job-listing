import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { User, Job, Notification, ChatMessage, Wallet, Review, WorkerProfile } from '@/types';
import { calculateDistance, calculateReputationScore } from '@/types';
import { supabase } from '@/lib/supabase';

interface AppState {
  // Auth
  isAuthenticated: boolean;
  currentUser: User | null;
  onboardingStep: number;
  
  // Data
  jobs: Job[];
  workers: WorkerProfile[];
  notifications: Notification[];
  messages: ChatMessage[];
  wallet: Wallet | null;
  reviews: Review[];
  
  // UI State
  activeTab: string;
  unreadNotifications: number;
  isLoading: boolean;
  
  // Job Broadcast System
  pendingJobNotifications: Job[]; // Jobs waiting for worker acceptance
}

type AppAction =
  | { type: 'SET_AUTH'; payload: { user: User } }
  | { type: 'LOGOUT' }
  | { type: 'SET_ONBOARDING_STEP'; payload: number }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_JOBS'; payload: Job[] }
  | { type: 'ADD_JOB'; payload: Job }
  | { type: 'UPDATE_JOB'; payload: Job }
  | { type: 'SET_WORKERS'; payload: WorkerProfile[] }
  | { type: 'UPDATE_WORKER'; payload: WorkerProfile }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'SET_WALLET'; payload: Wallet }
  | { type: 'UPDATE_WALLET_BALANCE'; payload: number }
  | { type: 'ADD_TRANSACTION'; payload: any }
  | { type: 'ADD_REVIEW'; payload: Review }
  | { type: 'SET_REVIEWS'; payload: Review[] }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'BROADCAST_JOB'; payload: { job: Job; radiusKm: number } }
  | { type: 'ACCEPT_JOB'; payload: { jobId: string; workerId: string } }
  | { type: 'ADD_RECENT_WORKER'; payload: { clientId: string; workerId: string } }
  | { type: 'SET_PENDING_NOTIFICATIONS'; payload: Job[] }
  | { type: 'SET_SESSION'; payload: { user: User | null } }
  | { type: 'SET_LOADING'; payload: boolean };

const MOCK_CURRENT_USER: User = {
  id: 'u1',
  phone: '+254712345678',
  realName: 'John Kamau',
  nickname: 'John',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  location: { lat: -1.2921, lng: 36.8219, address: 'Nairobi CBD' },
  roles: ['worker', 'client'],
  skills: ['plumbing', 'handyman'],
  rating: 4.8,
  totalJobs: 47,
  joinedAt: new Date('2025-06-15'),
  isVerified: true,
};

const initialState: AppState = {
  isAuthenticated: true,
  currentUser: MOCK_CURRENT_USER,
  onboardingStep: 0,
  jobs: [],
  workers: [],
  notifications: [],
  messages: [],
  wallet: {
    userId: 'u1',
    balance: 2500,
    currency: 'KES',
    transactions: [],
  },
  reviews: [],
  activeTab: 'home',
  unreadNotifications: 0,
  isLoading: false,
  pendingJobNotifications: [],
};

// Mock data for MVP - Updated with reputation scores and availability
const mockWorkers: WorkerProfile[] = [
  {
    id: 'w1',
    userId: 'u1',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    nickname: 'John the Plumber',
    realName: 'John Kamau',
    skills: ['plumbing', 'handyman'],
    rating: 4.8,
    totalJobs: 47,
    joinedAt: new Date('2025-06-15'),
    bio: 'Professional plumber with 10 years experience. Available for all plumbing jobs.',
    availability: 'available',
    location: { lat: -1.2921, lng: 36.8219, address: 'Nairobi CBD' },
    reputationScore: 92,
    completedJobs: 45,
    cancelledJobs: 1,
    disputedJobs: 1,
    onTimeArrivalRate: 94,
    lastActiveAt: new Date(),
  },
  {
    id: 'w2',
    userId: 'u2',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    nickname: 'Mike Electric',
    realName: 'Michael Ochieng',
    skills: ['electrical', 'handyman'],
    rating: 4.6,
    totalJobs: 32,
    joinedAt: new Date('2025-08-20'),
    bio: 'Licensed electrician. Residential and commercial work.',
    availability: 'available',
    location: { lat: -1.3021, lng: 36.8319, address: 'Westlands, Nairobi' },
    reputationScore: 85,
    completedJobs: 30,
    cancelledJobs: 2,
    disputedJobs: 0,
    onTimeArrivalRate: 88,
    lastActiveAt: new Date(),
  },
  {
    id: 'w3',
    userId: 'u3',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    nickname: 'Sarah Cleaners',
    realName: 'Sarah Wanjiku',
    skills: ['cleaning', 'gardening'],
    rating: 4.9,
    totalJobs: 89,
    joinedAt: new Date('2025-03-10'),
    bio: 'Professional cleaning services for homes and offices.',
    availability: 'busy',
    currentJobId: 'j1',
    location: { lat: -1.2821, lng: 36.8119, address: 'Kilimani, Nairobi' },
    reputationScore: 96,
    completedJobs: 87,
    cancelledJobs: 1,
    disputedJobs: 1,
    onTimeArrivalRate: 98,
    lastActiveAt: new Date(),
  },
  {
    id: 'w4',
    userId: 'u4',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    nickname: 'Peter Paint Pro',
    realName: 'Peter Mwangi',
    skills: ['painting', 'carpentry'],
    rating: 4.5,
    totalJobs: 23,
    joinedAt: new Date('2025-09-05'),
    bio: 'Interior and exterior painting. Quality guaranteed.',
    availability: 'available',
    location: { lat: -1.3121, lng: 36.8419, address: 'Karen, Nairobi' },
    reputationScore: 78,
    completedJobs: 21,
    cancelledJobs: 1,
    disputedJobs: 1,
    onTimeArrivalRate: 85,
    lastActiveAt: new Date(),
  },
  {
    id: 'w5',
    userId: 'u5',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    nickname: 'Grace Beauty',
    realName: 'Grace Achieng',
    skills: ['salon', 'barber'],
    rating: 4.7,
    totalJobs: 56,
    joinedAt: new Date('2025-05-22'),
    bio: 'Mobile salon services. Hair, nails, and beauty treatments.',
    availability: 'available',
    location: { lat: -1.2721, lng: 36.8019, address: 'Lavington, Nairobi' },
    reputationScore: 88,
    completedJobs: 54,
    cancelledJobs: 1,
    disputedJobs: 1,
    onTimeArrivalRate: 91,
    lastActiveAt: new Date(),
  },
];

const mockJobs: Job[] = [
  {
    id: 'j1',
    title: 'Kitchen Sink Repair',
    description: 'My kitchen sink is leaking. Need a plumber to fix it ASAP.',
    location: { lat: -1.2921, lng: 36.8219, address: 'Kilimani, Nairobi' },
    budget: 2500,
    preferredTime: 'Today, 2 PM',
    status: 'in-progress',
    clientId: 'c1',
    workerId: 'w3',
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(),
    category: 'Plumbing',
    broadcastRadius: 5,
    notifiedWorkerIds: ['w1', 'w3'],
  },
  {
    id: 'j2',
    title: 'House Cleaning - 3 Bedroom',
    description: 'Need thorough cleaning of 3 bedroom apartment. Bring own supplies.',
    location: { lat: -1.3021, lng: 36.8319, address: 'Westlands, Nairobi' },
    budget: 3500,
    preferredTime: 'Tomorrow, 9 AM',
    status: 'ready',
    clientId: 'c2',
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 7200000),
    category: 'Cleaning',
    broadcastRadius: 5,
    notifiedWorkerIds: ['w3', 'w5'],
  },
  {
    id: 'j3',
    title: 'Electrical Wiring Fix',
    description: 'Power outage in two rooms. Need electrician to diagnose and fix.',
    location: { lat: -1.2821, lng: 36.8119, address: 'Ngong Road, Nairobi' },
    budget: 4000,
    preferredTime: 'Today, 5 PM',
    status: 'ready',
    clientId: 'c3',
    createdAt: new Date(Date.now() - 10800000),
    updatedAt: new Date(Date.now() - 10800000),
    category: 'Electrical',
    broadcastRadius: 5,
    notifiedWorkerIds: ['w2'],
  },
  {
    id: 'j4',
    title: 'Furniture Assembly',
    description: 'Need help assembling IKEA bookshelf and desk.',
    location: { lat: -1.3121, lng: 36.8419, address: 'Karen, Nairobi' },
    budget: 1500,
    preferredTime: 'Saturday, 10 AM',
    status: 'completed',
    clientId: 'c1',
    workerId: 'w1',
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 43200000),
    completedAt: new Date(Date.now() - 43200000),
    category: 'Assembly',
    broadcastRadius: 5,
    notifiedWorkerIds: ['w1'],
  },
];

const mockReviews: Review[] = [
  {
    id: 'r1',
    jobId: 'j4',
    reviewerId: 'c1',
    revieweeId: 'w1',
    rating: 5,
    comment: 'Excellent work, very professional!',
    createdAt: new Date(Date.now() - 40000000),
    onTimeArrival: true,
  },
  {
    id: 'r2',
    jobId: 'j1',
    reviewerId: 'c1',
    revieweeId: 'w3',
    rating: 5,
    comment: 'Sarah did an amazing job cleaning my house.',
    createdAt: new Date(Date.now() - 3000000),
    onTimeArrival: true,
  },
];

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    userId: 'worker',
    type: 'job',
    title: 'New Job Near You',
    message: 'A new cleaning job is available near you in Westlands. Budget: KES 3,500',
    data: { jobId: 'j2', type: 'job_broadcast' },
    isRead: false,
    createdAt: new Date(Date.now() - 1800000),
    expiresAt: new Date(Date.now() + 3600000), // Expires in 1 hour
  },
  {
    id: 'n2',
    userId: 'worker',
    type: 'payment',
    title: 'Payment Received',
    message: 'KES 2,500 has been added to your wallet for Kitchen Sink Repair.',
    data: { amount: 2500 },
    isRead: true,
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'n3',
    userId: 'client',
    type: 'job',
    title: 'Worker Assigned',
    message: 'Sarah W. has accepted your job request.',
    data: { jobId: 'j1' },
    isRead: false,
    createdAt: new Date(Date.now() - 3600000),
  },
];

// Find workers within radius of a job location
function findWorkersInRadius(
  workers: WorkerProfile[],
  jobLat: number,
  jobLng: number,
  radiusKm: number
): WorkerProfile[] {
  return workers.filter(worker => {
    // Skip offline workers
    if (worker.availability === 'offline') return false;
    
    const distance = calculateDistance(
      jobLat,
      jobLng,
      worker.location.lat,
      worker.location.lng
    );
    return distance <= radiusKm;
  });
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_AUTH':
      return {
        ...state,
        isAuthenticated: true,
        currentUser: action.payload.user,
        workers: mockWorkers,
        jobs: mockJobs,
        notifications: mockNotifications,
        reviews: mockReviews,
        wallet: {
          userId: action.payload.user.id,
          balance: 12500,
          currency: 'KES',
          transactions: [
            { id: 't1', walletId: 'w1', type: 'credit', amount: 2500, description: 'Kitchen Sink Repair', jobId: 'j4', createdAt: new Date(Date.now() - 86400000) },
            { id: 't2', walletId: 'w1', type: 'credit', amount: 3500, description: 'House Cleaning', jobId: 'j5', createdAt: new Date(Date.now() - 172800000) },
            { id: 't3', walletId: 'w1', type: 'debit', amount: 1000, description: 'Withdrawal to M-Pesa', createdAt: new Date(Date.now() - 259200000) },
          ],
        },
      };
    case 'LOGOUT':
      return { ...initialState };
    case 'SET_ONBOARDING_STEP':
      return { ...state, onboardingStep: action.payload };
    case 'UPDATE_USER':
      return {
        ...state,
        currentUser: state.currentUser ? { ...state.currentUser, ...action.payload } : null,
      };
    case 'SET_JOBS':
      return { ...state, jobs: action.payload };
    case 'ADD_JOB': {
      const newJob = {
        ...action.payload,
        broadcastRadius: action.payload.broadcastRadius || 5,
        notifiedWorkerIds: [],
      };
      
      // Auto-broadcast to nearby workers
      const nearbyWorkers = findWorkersInRadius(
        state.workers,
        newJob.location.lat,
        newJob.location.lng,
        newJob.broadcastRadius || 5
      );
      
      // Create notifications for nearby available workers
      const newNotifications: Notification[] = nearbyWorkers
        .filter(w => w.availability === 'available')
        .map(worker => ({
          id: 'n' + Date.now() + worker.id,
          userId: worker.userId,
          type: 'job',
          title: 'New Job Near You',
          message: `A new ${newJob.category} job is available near you in ${newJob.location.address.split(',')[0]}. Budget: KES ${newJob.budget.toLocaleString()}`,
          data: { jobId: newJob.id, type: 'job_broadcast' },
          isRead: false,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 3600000), // 1 hour expiry
        }));
      
      return {
        ...state,
        jobs: [newJob, ...state.jobs],
        notifications: [...newNotifications, ...state.notifications],
        unreadNotifications: state.unreadNotifications + newNotifications.length,
        pendingJobNotifications: [...state.pendingJobNotifications, newJob],
      };
    }
    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(job => job.id === action.payload.id ? action.payload : job),
      };
    case 'SET_WORKERS':
      return { ...state, workers: action.payload };
    case 'UPDATE_WORKER':
      return {
        ...state,
        workers: state.workers.map(w => w.id === action.payload.id ? action.payload : w),
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1,
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, isRead: true } : n
        ),
        unreadNotifications: Math.max(0, state.unreadNotifications - 1),
      };
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadNotifications: action.payload.filter(n => !n.isRead).length,
      };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'SET_WALLET':
      return { ...state, wallet: action.payload };
    case 'UPDATE_WALLET_BALANCE':
      return {
        ...state,
        wallet: state.wallet ? { ...state.wallet, balance: action.payload } : null,
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        wallet: state.wallet
          ? { ...state.wallet, transactions: [action.payload, ...state.wallet.transactions] }
          : null,
      };
    case 'ADD_REVIEW': {
      const newReviews = [...state.reviews, action.payload];
      // Recalculate reputation for the reviewed worker
      const revieweeId = action.payload.revieweeId;
      const worker = state.workers.find(w => w.userId === revieweeId);
      if (worker) {
        const workerReviews = newReviews.filter(r => r.revieweeId === revieweeId);
        const newRating = workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length;
        const updatedWorker = {
          ...worker,
          rating: newRating,
          completedJobs: worker.completedJobs + 1,
          onTimeArrivalRate: action.payload.onTimeArrival 
            ? ((worker.onTimeArrivalRate * worker.completedJobs + 100) / (worker.completedJobs + 1))
            : ((worker.onTimeArrivalRate * worker.completedJobs) / (worker.completedJobs + 1)),
        };
        updatedWorker.reputationScore = calculateReputationScore(updatedWorker, workerReviews);
        
        return {
          ...state,
          reviews: newReviews,
          workers: state.workers.map(w => w.id === updatedWorker.id ? updatedWorker : w),
        };
      }
      return { ...state, reviews: newReviews };
    }
    case 'SET_REVIEWS':
      return { ...state, reviews: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    
    // Job Broadcast System
    case 'BROADCAST_JOB': {
      const { job, radiusKm } = action.payload;
      const nearbyWorkers = findWorkersInRadius(
        state.workers,
        job.location.lat,
        job.location.lng,
        radiusKm
      );
      
      const newNotifications: Notification[] = nearbyWorkers
        .filter(w => w.availability === 'available')
        .map(worker => ({
          id: 'n' + Date.now() + worker.id,
          userId: worker.userId,
          type: 'job',
          title: 'New Job Near You',
          message: `A new ${job.category} job is available near you. Budget: KES ${job.budget.toLocaleString()}`,
          data: { jobId: job.id, type: 'job_broadcast' },
          isRead: false,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 3600000),
        }));
      
      return {
        ...state,
        notifications: [...newNotifications, ...state.notifications],
        unreadNotifications: state.unreadNotifications + newNotifications.length,
        jobs: state.jobs.map(j => j.id === job.id 
          ? { ...j, notifiedWorkerIds: nearbyWorkers.map(w => w.id) } 
          : j
        ),
      };
    }
    
    case 'ACCEPT_JOB': {
      const { jobId, workerId } = action.payload;
      const worker = state.workers.find(w => w.id === workerId);
      const job = state.jobs.find(j => j.id === jobId);
      
      if (!worker || !job) return state;
      
      // Check if worker is available
      if (worker.availability === 'busy' || worker.currentJobId) {
        return state; // Cannot accept if already has a job
      }
      
      // Update job status
      const updatedJob = {
        ...job,
        workerId,
        status: 'in-progress' as const,
        updatedAt: new Date(),
      };
      
      // Update worker availability
      const updatedWorker = {
        ...worker,
        availability: 'busy' as const,
        currentJobId: jobId,
        lastActiveAt: new Date(),
      };
      
      // Notify client
      const clientNotification: Notification = {
        id: 'n' + Date.now(),
        userId: job.clientId,
        type: 'job',
        title: 'Worker Assigned',
        message: `${worker.nickname} has accepted your job request for "${job.title}".`,
        data: { jobId, workerId },
        isRead: false,
        createdAt: new Date(),
      };
      
      // Remove job from pending notifications
      const updatedPending = state.pendingJobNotifications.filter(j => j.id !== jobId);
      
      return {
        ...state,
        jobs: state.jobs.map(j => j.id === jobId ? updatedJob : j),
        workers: state.workers.map(w => w.id === workerId ? updatedWorker : w),
        notifications: [clientNotification, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1,
        pendingJobNotifications: updatedPending,
      };
    }
    
    case 'ADD_RECENT_WORKER': {
      const { clientId, workerId } = action.payload;
      
      // Update the current user if they're the client
      if (state.currentUser?.id === clientId) {
        const currentRecentWorkers = state.currentUser.recentWorkers || [];
        // Add to front, remove duplicates, keep max 10
        const updatedRecentWorkers = [workerId, ...currentRecentWorkers.filter(id => id !== workerId)].slice(0, 10);
        
        return {
          ...state,
          currentUser: {
            ...state.currentUser,
            recentWorkers: updatedRecentWorkers,
          },
        };
      }
      return state;
    }
    
    case 'SET_PENDING_NOTIFICATIONS':
      return { ...state, pendingJobNotifications: action.payload };
    
    case 'SET_SESSION':
      return {
        ...state,
        isAuthenticated: !!action.payload.user,
        currentUser: action.payload.user,
        isLoading: false,
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  saveProfile: (updates: Partial<User>) => Promise<void>;
  postJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'clientId'>) => Promise<string | null>;
  uploadImage: (file: File, bucket: 'job-photos' | 'profile-photos') => Promise<string | null>;
  initiatePayment: (phone: string, amount: number) => Promise<{ success: boolean; message: string }>;
  completeJob: (jobId: string) => Promise<void>;
  acceptJob: (jobId: string, workerId: string) => Promise<void>;
  updateWorker: (workerId: string, updates: any) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  sendMessage: (jobId: string, content: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // 1. Auth Listener (Bypassed)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, _session) => {
      // Logic disabled for auth bypass
    });

    // 2. Real-time Jobs Listener
    const jobsChannel = supabase
      .channel('public:jobs')
      .on(
        'postgres_changes' as any,
        { event: '*', table: 'jobs', schema: 'public' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const newJob = {
              ...payload.new,
              createdAt: new Date(payload.new.created_at),
              updatedAt: new Date(payload.new.updated_at),
            } as Job;
            dispatch({ type: 'ADD_JOB', payload: newJob });
          } else if (payload.eventType === 'UPDATE') {
            const updatedJob = {
              ...payload.new,
              createdAt: new Date(payload.new.created_at),
              updatedAt: new Date(payload.new.updated_at),
            } as Job;
            dispatch({ type: 'UPDATE_JOB', payload: updatedJob });
          }
        }
      )
      .subscribe();

    // 3. Real-time Transactions Listener
    const transactionsChannel = supabase
      .channel('public:transactions')
      .on(
        'postgres_changes' as any,
        { event: 'INSERT', table: 'transactions', schema: 'public' },
        (payload: any) => {
          if (payload.new.user_id === state.currentUser?.id) {
            // Update wallet state locally
            const newTx = {
              ...payload.new,
              createdAt: new Date(payload.new.created_at),
            };
            dispatch({ type: 'ADD_TRANSACTION', payload: newTx });
          }
        }
      )
      .subscribe();

    // 4. Real-time Messages Listener
    const messagesChannel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes' as any,
        { event: 'INSERT', table: 'messages', schema: 'public' },
        (payload: any) => {
          // Add message to state locally
          const newMessage = {
            id: payload.new.id,
            jobId: payload.new.job_id,
            senderId: payload.new.sender_id,
            content: payload.new.content,
            createdAt: new Date(payload.new.created_at),
          };
          dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, []);

  const saveProfile = async (updates: Partial<User>) => {
    if (!state.currentUser) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: state.currentUser.id,
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      dispatch({ type: 'UPDATE_USER', payload: updates });
    } catch (err) {
      console.error('Error saving profile:', err);
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const postJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'clientId'>) => {
    if (!state.currentUser) return null;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          ...jobData,
          status: 'ready',
          client_id: state.currentUser.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // We don't need to dispatch ADD_JOB here because the real-time listener will catch it
      return data.id;
    } catch (err) {
      console.error('Error posting job:', err);
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const uploadImage = async (file: File, bucket: 'job-photos' | 'profile-photos') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${state.currentUser?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const initiatePayment = async (phone: string, amount: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: { phone, amount, accountReference: 'GigmaWallet' },
      });

      if (error) throw error;

      // In a real app, we'd wait for the callback or poll the transaction status
      // For now, we'll return the initial response
      return { success: true, message: data.CustomerMessage || 'Check your phone for the STK Push' };
    } catch (err) {
      console.error('Payment initiation failed:', err);
      return { success: false, message: 'Failed to initiate payment' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const acceptJob = async (jobId: string, workerId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ worker_id: workerId, status: 'in-progress', updated_at: new Date().toISOString() })
        .eq('id', jobId);

      if (error) throw error;
    } catch (err) {
      console.error('Error accepting job:', err);
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateWorker = async (workerId: string, updates: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // In a real app, 'workers' would be a separate table or profiles table columns
      // For now, we'll update the profiles table assuming it has these fields
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', workerId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating worker:', err);
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const completeJob = async (jobId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', jobId);

      if (error) throw error;
      
      // The real-time listener will update the state
    } catch (err) {
      console.error('Error completing job:', err);
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { error } = await supabase
        .from('reviews')
        .insert(reviewData);

      if (error) throw error;
    } catch (err) {
      console.error('Error adding review:', err);
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const sendMessage = async (jobId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          job_id: jobId,
          sender_id: state.currentUser?.id,
          content,
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch, 
      saveProfile, 
      postJob, 
      uploadImage, 
      initiatePayment,
      acceptJob,
      updateWorker,
      completeJob,
      addReview,
      sendMessage
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
