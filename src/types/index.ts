// Gigma Types - Gig Marketplace for East Africa

export type UserRole = 'worker' | 'client' | 'both';

export type JobStatus = 'ready' | 'in-progress' | 'busy' | 'completed';

export type NotificationType = 'job' | 'message' | 'payment' | 'system';

export type WorkerAvailability = 'available' | 'busy' | 'offline';

export interface User {
  id: string;
  phone: string;
  realName: string;
  nickname?: string;
  photo: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  roles: UserRole[];
  skills: string[];
  rating: number;
  totalJobs: number;
  joinedAt: Date;
  bio?: string;
  isVerified: boolean;
  // For clients: track previously hired workers
  recentWorkers?: string[];
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  budget: number;
  preferredTime: string;
  photos?: string[];
  status: JobStatus;
  clientId: string;
  workerId?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  category: string;
  // For broadcast system
  broadcastRadius?: number; // in km, default 5
  notifiedWorkerIds?: string[]; // workers who received notification
}

export interface WorkerProfile {
  id: string;
  userId: string;
  photo: string;
  nickname: string;
  realName: string;
  skills: string[];
  rating: number;
  totalJobs: number;
  joinedAt: Date;
  bio?: string;
  // Enhanced availability system
  availability: WorkerAvailability;
  currentJobId?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  // Reputation score (0-100)
  reputationScore: number;
  // Additional metrics for reputation calculation
  completedJobs: number;
  cancelledJobs: number;
  disputedJobs: number;
  onTimeArrivalRate: number; // 0-100
  lastActiveAt: Date;
}

export interface Review {
  id: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  // For reputation calculation
  onTimeArrival?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  // For job notifications
  expiresAt?: Date; // When the job is no longer available
}

export interface ChatMessage {
  id: string;
  jobId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  jobId?: string;
  createdAt: Date;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

// Available skills in the platform
export const AVAILABLE_SKILLS = [
  // Trades
  { id: 'plumbing', name: 'Plumbing', category: 'Trades' },
  { id: 'electrical', name: 'Electrical', category: 'Trades' },
  { id: 'welding', name: 'Welding', category: 'Trades' },
  { id: 'mechanics', name: 'Mechanics', category: 'Trades' },
  { id: 'carpentry', name: 'Carpentry', category: 'Trades' },
  { id: 'masonry', name: 'Masonry', category: 'Trades' },
  { id: 'painting', name: 'Painting', category: 'Trades' },
  // Home Services
  { id: 'cleaning', name: 'Cleaning', category: 'Home Services' },
  { id: 'moving', name: 'Moving', category: 'Home Services' },
  { id: 'pest-control', name: 'Pest Control', category: 'Home Services' },
  { id: 'gardening', name: 'Gardening', category: 'Home Services' },
  // Personal Services
  { id: 'salon', name: 'Salon & Beauty', category: 'Personal Services' },
  { id: 'barber', name: 'Barber', category: 'Personal Services' },
  { id: 'tailoring', name: 'Tailoring', category: 'Personal Services' },
  // General
  { id: 'handyman', name: 'Handyman', category: 'General' },
  { id: 'delivery', name: 'Delivery', category: 'General' },
  { id: 'assembly', name: 'Furniture Assembly', category: 'General' },
  { id: 'driving', name: 'Driving', category: 'General' },
];

// Job categories
export const JOB_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Moving',
  'Painting',
  'Carpentry',
  'Mechanics',
  'Handyman',
  'Gardening',
  'Pest Control',
  'Delivery',
  'Assembly',
  'Other',
];

// Haversine formula to calculate distance between two coordinates in km
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate worker reputation score (0-100)
export function calculateReputationScore(worker: WorkerProfile, _reviews: Review[]): number {
  // Base score starts at 50
  let score = 50;

  // Job completion rate (max 25 points)
  const totalJobs = worker.completedJobs + worker.cancelledJobs + worker.disputedJobs;
  if (totalJobs > 0) {
    const completionRate = worker.completedJobs / totalJobs;
    score += completionRate * 25;
  }

  // Average rating (max 15 points)
  // Rating is 0-5, convert to 0-15 points
  score += (worker.rating / 5) * 15;

  // Number of completed jobs bonus (max 5 points)
  // More jobs = more trust, capped at 100 jobs
  const jobBonus = Math.min(worker.completedJobs / 100, 1) * 5;
  score += jobBonus;

  // On-time arrival rate (max 5 points)
  score += (worker.onTimeArrivalRate / 100) * 5;

  // Return rounded score
  return Math.round(Math.min(Math.max(score, 0), 100));
}
