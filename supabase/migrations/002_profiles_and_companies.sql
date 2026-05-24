-- Profiles table (extends auth.users)
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          user_role not null default 'worker',
  full_name     text,
  email         text not null,
  phone         text,
  avatar_url    text,
  locale        text not null default 'tr',
  is_active     boolean not null default true,
  email_verified boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Worker profiles
create table public.worker_profiles (
  id                  uuid primary key default uuid_generate_v4(),
  profile_id          uuid not null references public.profiles(id) on delete cascade,
  title               text,
  bio                 text,
  skills              text[] not null default '{}',
  languages           text[] not null default '{}',
  experience_years    int not null default 0,
  desired_job_type    job_type,
  desired_location    text,
  desired_salary_min  numeric(10,2),
  desired_salary_max  numeric(10,2),
  cv_url              text,
  portfolio_url       text,
  is_available        boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(profile_id)
);

-- Companies
create table public.companies (
  id           uuid primary key default uuid_generate_v4(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  name         text not null,
  description  text,
  website      text,
  logo_url     text,
  sector       text,
  size         text,
  country      text,
  city         text,
  is_verified  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique(profile_id)
);

-- Packages (employer subscription tiers)
create table public.packages (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  description    text,
  price_try      numeric(10,2) not null,
  price_eur      numeric(10,2) not null,
  job_limit      int not null default 5,
  featured_limit int not null default 1,
  duration_days  int not null default 30,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- Employer subscriptions
create table public.employer_subscriptions (
  id          uuid primary key default uuid_generate_v4(),
  employer_id uuid not null references public.profiles(id) on delete cascade,
  package_id  uuid not null references public.packages(id),
  started_at  timestamptz not null default now(),
  expires_at  timestamptz not null,
  jobs_used   int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.worker_profiles enable row level security;
alter table public.companies enable row level security;
alter table public.packages enable row level security;
alter table public.employer_subscriptions enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Worker profiles policies
create policy "Worker profiles are viewable by everyone"
  on public.worker_profiles for select using (true);

create policy "Workers can manage their own profile"
  on public.worker_profiles for all using (
    profile_id = auth.uid()
  );

-- Companies policies
create policy "Companies are viewable by everyone"
  on public.companies for select using (true);

create policy "Employers can manage their own company"
  on public.companies for all using (
    profile_id = auth.uid()
  );

-- Packages are public
create policy "Packages viewable by everyone"
  on public.packages for select using (true);

-- Subscriptions
create policy "Employers can view their own subscriptions"
  on public.employer_subscriptions for select using (employer_id = auth.uid());

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, full_name, locale)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'worker')::user_role,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'locale', 'tr')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger: updated_at
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();
create trigger set_worker_profiles_updated_at before update on public.worker_profiles
  for each row execute function public.update_updated_at();
create trigger set_companies_updated_at before update on public.companies
  for each row execute function public.update_updated_at();

-- Indexes
create index idx_profiles_role on public.profiles(role);
create index idx_profiles_email on public.profiles(email);
create index idx_worker_profiles_profile on public.worker_profiles(profile_id);
create index idx_companies_profile on public.companies(profile_id);
