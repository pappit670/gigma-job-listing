-- Gigma Database Schema

-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  phone TEXT UNIQUE,
  real_name TEXT,
  nickname TEXT,
  photo TEXT,
  location JSONB,
  roles TEXT[], -- ['worker', 'client']
  skills TEXT[],
  rating FLOAT DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Jobs Table
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location JSONB NOT NULL,
  budget INTEGER NOT NULL,
  preferred_time TEXT,
  status TEXT DEFAULT 'ready', -- 'ready', 'in-progress', 'completed'
  category TEXT,
  client_id UUID REFERENCES profiles(id),
  worker_id UUID REFERENCES profiles(id),
  photos TEXT[],
  broadcast_radius INTEGER DEFAULT 5,
  notified_worker_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Notifications Table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'job', 'message', 'payment', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- 4. Transactions Table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL, -- 'credit', 'debit'
  amount INTEGER NOT NULL,
  description TEXT,
  job_id UUID REFERENCES jobs(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Reviews Table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  reviewer_id UUID REFERENCES profiles(id),
  reviewee_id UUID REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  on_time_arrival BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Messages Table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Live Worker Locations Table
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS worker_locations (
  worker_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  heading DOUBLE PRECISION,
  geog GEOGRAPHY(Point, 4326),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_worker_geog()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geog = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_worker_geog ON worker_locations;
CREATE TRIGGER trg_worker_geog
BEFORE INSERT OR UPDATE ON worker_locations
FOR EACH ROW EXECUTE FUNCTION update_worker_geog();

CREATE INDEX IF NOT EXISTS idx_worker_locations_geog
ON worker_locations USING GIST(geog);

CREATE OR REPLACE FUNCTION find_nearby_workers(lat DOUBLE PRECISION, lng DOUBLE PRECISION, radius_m INTEGER DEFAULT 5000)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  real_name TEXT,
  nickname TEXT,
  photo TEXT,
  rating DOUBLE PRECISION,
  total_jobs INTEGER,
  availability TEXT,
  reputation_score INTEGER,
  completed_jobs INTEGER,
  cancelled_jobs INTEGER,
  disputed_jobs INTEGER,
  on_time_arrival_rate DOUBLE PRECISION,
  last_active_at TIMESTAMPTZ,
  worker_lat DOUBLE PRECISION,
  worker_lng DOUBLE PRECISION,
  address TEXT,
  distance_m DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.id AS user_id,
    p.real_name,
    p.nickname,
    p.photo,
    p.rating,
    p.total_jobs,
    wp.availability,
    wp.reputation_score,
    wp.completed_jobs,
    wp.cancelled_jobs,
    wp.disputed_jobs,
    wp.on_time_arrival_rate,
    wp.last_active_at,
    wl.lat AS worker_lat,
    wl.lng AS worker_lng,
    COALESCE(p.location->>'address', 'Live worker location') AS address,
    ST_Distance(wl.geog, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) AS distance_m
  FROM worker_locations wl
  JOIN profiles p ON p.id = wl.worker_id
  LEFT JOIN worker_profiles wp ON wp.user_id = p.id
  WHERE wp.availability IS DISTINCT FROM 'offline'
    AND wl.geog IS NOT NULL
    AND ST_DWithin(
      wl.geog,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_m
    )
  ORDER BY distance_m ASC;
$$;

ALTER PUBLICATION supabase_realtime ADD TABLE worker_locations;

-- Row Level Security (RLS)

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jobs are viewable by everyone" ON jobs FOR SELECT USING (true);
CREATE POLICY "Clients can insert jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can update their own jobs" ON jobs FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Workers can update jobs they are assigned to" ON jobs FOR UPDATE USING (auth.uid() = worker_id);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages for jobs they are part of" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = messages.job_id 
    AND (jobs.client_id = auth.uid() OR jobs.worker_id = auth.uid())
  )
);
CREATE POLICY "Users can insert messages for jobs they are part of" ON messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = job_id 
    AND (jobs.client_id = auth.uid() OR jobs.worker_id = auth.uid())
  )
);
