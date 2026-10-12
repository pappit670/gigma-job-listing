create extension if not exists postgis;

create table if not exists worker_locations (
  worker_id uuid primary key references profiles(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  heading double precision,
  geog geography(Point, 4326),
  updated_at timestamptz not null default now()
);

create or replace function update_worker_geog()
returns trigger as $$
begin
  new.geog = ST_SetSRID(ST_MakePoint(new.lng, new.lat), 4326)::geography;
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_worker_geog on worker_locations;

create trigger trg_worker_geog
before insert or update on worker_locations
for each row execute function update_worker_geog();

create index if not exists idx_worker_locations_geog on worker_locations using gist(geog);

create or replace function find_nearby_workers(lat double precision, lng double precision, radius_m integer default 5000)
returns table (
  id uuid,
  user_id uuid,
  real_name text,
  nickname text,
  photo text,
  rating double precision,
  total_jobs integer,
  availability text,
  reputation_score integer,
  completed_jobs integer,
  cancelled_jobs integer,
  disputed_jobs integer,
  on_time_arrival_rate double precision,
  last_active_at timestamptz,
  worker_lat double precision,
  worker_lng double precision,
  address text,
  distance_m double precision
)
language sql
stable
as $$
  select
    p.id,
    p.id as user_id,
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
    wl.lat as worker_lat,
    wl.lng as worker_lng,
    coalesce(p.location->>'address', 'Live worker location') as address,
    ST_Distance(wl.geog, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) as distance_m
  from worker_locations wl
  join profiles p on p.id = wl.worker_id
  left join worker_profiles wp on wp.user_id = p.id
  where wp.availability is distinct from 'offline'
    and wl.geog is not null
    and ST_DWithin(
      wl.geog,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_m
    )
  order by distance_m asc;
$$;

alter publication supabase_realtime add table worker_locations;
