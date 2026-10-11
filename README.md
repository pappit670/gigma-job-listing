# Gigma — MVP Build Brief
**A real-time labor dispatch platform under TerraWork Ltd**
> Like Uber, but for every skilled and casual gig job in Kenya.

---

## ⚡ Run Locally

Requirements: Node.js 20+

```sh
npm ci
cp .env.example .env
# Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GOOGLE_MAPS_KEY in .env
npm run dev
```

Checks: `npm run build` and `npm run lint`

Database: run `supabase_schema.sql` in your Supabase SQL editor to create all tables.

---

## 🧠 What Is Gigma?

Gigma connects workers (plumbers, cleaners, electricians, movers, salon techs, mechanics) with clients (individuals, households, small businesses) in real time.

- Workers build living profiles / CVs with verified skills
- Clients post jobs and get matched to available workers nearby
- Payments are held in escrow and released on job completion
- A Voice Action Assistant is the primary differentiator — it makes the app feel ahead of anything in the market

**Parent company:** TerraWork Ltd  
**Stack:** React + TypeScript + Tailwind CSS + Vite + shadcn/ui + Supabase  
**Market:** Kenya / East Africa (Nairobi first)

---

## ✅ WHAT IS ALREADY BUILT (in `/src`)

The Kimi prototype includes working versions of:

- Phone OTP auth flow (UI complete, needs Supabase wiring)
- Multi-step onboarding (worker vs client, skill selection)
- Worker home dashboard — nearby job cards with status colors (🟢🟠🔴✅)
- Client home dashboard — post job, active jobs, nearby workers
- Job dispatch engine — `rankWorkersForJob()` scoring formula (distance + rating + idleTime + responseRate)
- Job acceptance race — `ACCEPT_JOB` reducer with race condition handling
- Wallet page — three-bucket (available / escrow / pending), KES formatting, transaction history
- Voice Assistant — Web Speech API, waveform animation, intent parser
- Chat — message thread UI (placeholder, not wired to Supabase)
- Rating prompt — triggered after job completion
- Profile page — reputation score, badges, stats
- App state — full Zustand/context store with all reducers
- Type definitions — User, Job, WorkerProfile, Wallet, Transaction, EscrowRecord, Review, VoiceCommand

---

## 🚨 WHAT NEEDS TO BE BUILT FOR MVP LAUNCH

Work through these in order. Each section is a discrete build unit.

---

### 1. 🔐 SUPABASE AUTH + DATABASE WIRING
**Priority: CRITICAL — nothing works without this**

Run this schema in Supabase SQL editor first:

```sql
create table users (id uuid primary key default gen_random_uuid(), phone text unique not null, real_name text not null, nickname text, photo_url text, roles text[] default '{}', skills text[] default '{}', is_verified boolean default false, bio text, location_lat float, location_lng float, location_address text, created_at timestamptz default now(), last_active_at timestamptz default now());

create table worker_profiles (id uuid primary key default gen_random_uuid(), user_id uuid references users(id) on delete cascade, rating float default 0, total_jobs int default 0, completed_jobs int default 0, cancelled_jobs int default 0, disputed_jobs int default 0, on_time_arrival_rate float default 100, reputation_score int default 50, availability text default 'available', current_job_id uuid, last_job_accepted_at timestamptz, repeat_clients text[] default '{}', created_at timestamptz default now());

create table jobs (id uuid primary key default gen_random_uuid(), title text not null, description text not null, category text not null, budget int not null, preferred_time text, status text default 'open', client_id uuid references users(id), worker_id uuid references users(id), location_lat float, location_lng float, location_address text, broadcast_radius int default 5, notified_worker_ids uuid[] default '{}', escrow_amount int, escrow_released_at timestamptz, accepted_at timestamptz, completed_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now());

create table wallets (id uuid primary key default gen_random_uuid(), user_id uuid references users(id) on delete cascade unique, balance int default 0, escrow_balance int default 0, pending_balance int default 0, currency text default 'KES', created_at timestamptz default now());

create table transactions (id uuid primary key default gen_random_uuid(), wallet_id uuid references wallets(id), type text not null, amount int not null, description text, job_id uuid references jobs(id), payout_method text, status text default 'pending', created_at timestamptz default now(), completed_at timestamptz);

create table escrow_records (id uuid primary key default gen_random_uuid(), job_id uuid references jobs(id), client_id uuid references users(id), worker_id uuid references users(id), amount int not null, status text default 'held', created_at timestamptz default now(), released_at timestamptz);

create table messages (id uuid primary key default gen_random_uuid(), job_id uuid references jobs(id), sender_id uuid references users(id), receiver_id uuid references users(id), content text not null, is_read boolean default false, created_at timestamptz default now());

create table notifications (id uuid primary key default gen_random_uuid(), user_id uuid references users(id), type text not null, title text not null, message text not null, data jsonb, is_read boolean default false, created_at timestamptz default now(), expires_at timestamptz);

create table ratings (id uuid primary key default gen_random_uuid(), job_id uuid references jobs(id), reviewer_id uuid references users(id), reviewee_id uuid references users(id), rating int not null, comment text, on_time_arrival boolean, created_at timestamptz default now());

create table worker_locations (worker_id uuid references users(id) primary key, lat float not null, lng float not null, heading float, updated_at timestamptz default now());

-- Enable Realtime
alter publication supabase_realtime add table jobs;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table worker_locations;
```

**Then wire these in code:**

- Replace all mock auth with `supabase.auth.signInWithOtp({ phone })` and `verifyOtp()`
- On login/signup, upsert user row, create wallet row, create worker_profile if worker role
- Store session in context, protect routes
- On app load, fetch real user from `users` table by `auth.user().id`

---

### 2. 📍 JOB DISPATCH ENGINE — REAL DATA
**Priority: CRITICAL**

The ranking formula is already coded in `AppContext.tsx` as `rankWorkersForJob()`. Make it real:

- `POST /jobs` → insert job row in Supabase
- Query `worker_profiles` + `worker_locations` for workers within 5km (Haversine) matching skill category
- Insert `job_id` into `notified_worker_ids` for top 5 ranked workers
- Push Supabase Realtime notification to those workers
- On worker accept: set `jobs.status = 'assigned'`, `worker_profiles.availability = 'busy'`, lock out other workers
- Status flow: `open → assigned → worker_en_route → arrived → in_progress → completed`

**Realtime subscription needed:**
```typescript
supabase.channel('jobs').on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, handler).subscribe()
```

---

### 3. 🗺️ LIVE MAP (Google Maps)
**Priority: HIGH — core UX**

Replace the current CSS simulation map with Google Maps JavaScript API:

- Show worker pins on map with status colors matching job state
- Client view: show assigned worker moving in real-time toward client location
- Worker view: show demand heat pins (where jobs are clustering)
- Worker location updates: worker app pushes `lat/lng` to `worker_locations` table every 10 seconds while on a job
- Client subscribes to `worker_locations` via Supabase Realtime for live tracking

**Google Maps setup:**
```bash
npm install @googlemaps/js-api-loader
```
Add `VITE_GOOGLE_MAPS_KEY` to `.env`. Key needs Maps JavaScript API + Places API enabled.

---

### 4. 💬 CHAT (Supabase Realtime)
**Priority: HIGH — workers and clients must communicate**

Text-only (no calls). Wire the existing chat UI to Supabase:

- `messages` table already in schema
- Send: `supabase.from('messages').insert({ job_id, sender_id, receiver_id, content })`
- Receive: subscribe to `messages` channel filtered by `job_id`
- Show read receipts (update `is_read` on message open)
- Keep UI minimal — speech bubbles, timestamp, no media for MVP

---

### 5. ✅ JOB COMPLETION + ESCROW RELEASE
**Priority: HIGH — this is how workers get paid**

Dual confirmation flow:

1. Worker taps "Mark Complete" → `jobs.status = 'pending_confirmation'`
2. Client gets notification: "Your job is done — confirm to release payment"
3. Client taps "Confirm & Pay" → escrow released to worker wallet
4. If client does NOT confirm within 24 hours → auto-release via Supabase Edge Function (cron)
5. If client taps "Dispute" → job enters `disputed` state, funds frozen, admin notified

**Edge Function for auto-release (deploy to Supabase):**
```typescript
// supabase/functions/auto-release-escrow/index.ts
// Runs every hour via pg_cron
// SELECT jobs WHERE status = 'pending_confirmation' AND updated_at < now() - interval '24 hours'
// → update status to 'completed', release escrow_records, credit worker wallet
```

---

### 6. 🎙️ VOICE ACTION ASSISTANT — SHIP THIS
**Priority: HIGH — this is the differentiator, ship it at launch**

Already built in `src/components/voice/VoiceAssistant.tsx`. Complete these:

- Floating mic button (bottom-right) — always visible on main screens
- States: idle → listening (animated waveform rings) → processing (pulse glow) → executed (success flash)
- Waveform reacts to speech volume using `AudioContext.getByteFrequencyData()`
- Intent → action mapping (all these must work):

| Voice command | Maps to |
|---|---|
| "find plumber" / "I need fundi" | Open Jobs tab filtered to Plumbing |
| "post a job" / "I need help" | Open Post Job sheet |
| "check balance" / "my wallet" | Open Wallet tab |
| "open messages" | Open Messages tab |
| "withdraw money" | Open Withdraw flow |
| "show my jobs" | Open Jobs → Active tab |

- Fallback: "I didn't catch that, try again"
- NO ChatGPT-style conversation for MVP — command execution only

---

### 7. 🧾 ONBOARDING FLOW COMPLETION
**Priority: MEDIUM — needed before real users**

Current onboarding is partially built. Complete these steps:

**Worker onboarding:**
1. Role selection (Worker / Client / Both)
2. Worker type selection: Freelancer / Team / Business
3. Skill category selection (grouped):
   - Home Services: Plumbing, Electrical, Cleaning, Handyman, Painting, Moving
   - Personal Services: Salon/Beauty, Massage, Tailoring, Photography
   - Professional: Accounting, Legal, Tutoring, IT Support
   - Transport: Delivery, Driver, Courier
4. Sub-skills add-on: free text field for qualifications (e.g. "Certified electrician, 5 years exp")
5. Pricing preference per category:
   - Fixed rate (worker sets a base price)
   - Negotiable (open to client offers)
6. Availability type: On-demand (instant dispatch) / Scheduled (calendar booking) — MVP only needs On-demand working
7. Profile photo upload (required — reject without photo)
8. Location permission request

**Client onboarding:**
1. Role selection
2. Name + photo
3. Location permission

---

### 8. 🏢 BUSINESS PROVIDER TIER
**Priority: MEDIUM — adds a key category of supply**

Businesses (movers, cleaning companies, delivery firms) need a different flow:

- Business profile: company name, logo, service description, team size, service area radius, pricing model
- When client searches for movers/delivery/etc → show Business cards alongside individual workers
- Business card shows: verified badge, team size, response time, rating, price range
- Client selects business → sends quote request (not instant dispatch)
- Business receives quote request → responds with custom price + message
- Client accepts/declines quote → if accepted, escrow holds budget, job goes live

**Tables needed (already in schema below):**
```sql
create table business_profiles (...);
create table quotes (...);
```

---

### 9. 💳 WALLET — MOCK NOW, REAL LATER
**Priority: MEDIUM — UI is done, just needs Supabase read/write**

- Read real balances from `wallets` table
- Deposit: UI flow complete, backend is mocked — wire to Supabase wallet update (M-Pesa Daraja post-launch)
- Withdraw: same — show flow, store withdrawal request, mark as pending
- Transaction history: read from `transactions` table ordered by `created_at DESC`
- Label: "Your Wallet" only — do NOT show Zenti branding in UI (only "Secured by Zenti" in Settings)

---

### 10. 📸 AI JOB PHOTO ANALYSIS
**Priority: LOW — post-launch add-on**

Do NOT build this for MVP. Plan only:

- When client uploads photo with job post, send to Claude vision API (`claude-sonnet-4-6`)
- Auto-detect job category from photo
- Suggest title and description
- Cost: ~$0.005 per job post (negligible at MVP scale)
- Ship after first 100 users so the core loop is proven first

---

## 🔧 ENV VARIABLES NEEDED

Create a `.env.local` file:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key
```

---

## 🚀 LAUNCH ORDER

Ship in this order — do not add features, ship the core loop first:

1. Auth (phone OTP) + onboarding persisted to Supabase
2. Job post → dispatch → accept → chat → complete → pay (escrow mock)
3. Voice assistant working for 6 core commands
4. Live map with worker tracking
5. Wallet reads real balances
6. **LAUNCH** — with just these 5 working, Gigma is a real product

---

## 📁 PROJECT STRUCTURE

```
src/
  components/
    voice/          ← VoiceAssistant.tsx (KEEP — primary differentiator)
    wallet/         ← WalletPage.tsx (KEEP — full wallet UI)
    jobs/           ← Job cards, dispatch UI
    chat/           ← Message thread
    map/            ← Google Maps integration (BUILD)
    profile/        ← Worker/client profiles
    onboarding/     ← Multi-step onboarding flow
  context/
    AppContext.tsx   ← Full app state + reducers (KEEP)
  hooks/
    useVoiceAssistant.ts
    useNearbyJobs.ts
    useWallet.ts
  services/
    supabase.ts     ← Supabase client (BUILD)
    jobs.ts         ← Job CRUD (BUILD)
    dispatch.ts     ← Worker matching (BUILD)
    wallet.ts       ← Wallet operations (BUILD)
  types/
    index.ts        ← All TypeScript types (KEEP)
```

---

## 🎯 SUCCESS METRICS

Gigma MVP is working when:

| Metric | Target |
|---|---|
| Time from job post to worker assignment | < 30 seconds |
| Payment trust rate | Workers feel confident they'll get paid |
| Voice command success rate | > 80% of commands execute correctly |
| Job completion rate | > 70% of accepted jobs reach completion |

---

*Built by TerraWork Ltd — Nairobi, Kenya*
