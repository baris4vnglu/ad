-- ============================================================
-- FULL MIGRATION (idempotent — safe to run on existing DB)
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

-- Enum types (wrapped to skip if already exists)
do $$ begin
  create type user_role as enum ('worker', 'employer', 'investor', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_type as enum ('full_time', 'part_time', 'seasonal', 'contract', 'remote');
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_status as enum ('draft', 'pending', 'active', 'rejected', 'expired', 'filled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum ('pending', 'reviewing', 'shortlisted', 'rejected', 'hired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'completed', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists public.profiles (
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

create table if not exists public.worker_profiles (
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

create table if not exists public.companies (
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

create table if not exists public.packages (
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

create table if not exists public.employer_subscriptions (
  id          uuid primary key default uuid_generate_v4(),
  employer_id uuid not null references public.profiles(id) on delete cascade,
  package_id  uuid not null references public.packages(id),
  started_at  timestamptz not null default now(),
  expires_at  timestamptz not null,
  jobs_used   int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.jobs (
  id                   uuid primary key default uuid_generate_v4(),
  company_id           uuid not null references public.companies(id) on delete cascade,
  employer_id          uuid not null references public.profiles(id) on delete cascade,
  title                text not null,
  description          text not null,
  requirements         text,
  benefits             text,
  category             text not null,
  subcategory          text,
  panel                text not null check (panel in ('skilled', 'regular')),
  job_type             job_type not null default 'full_time',
  location             text not null,
  country              text not null default 'TR',
  salary_min           numeric(10,2),
  salary_max           numeric(10,2),
  salary_currency      text not null default 'TRY',
  experience_required  int not null default 0,
  languages_required   text[] not null default '{}',
  openings             int not null default 1,
  deadline             date,
  status               job_status not null default 'pending',
  views                int not null default 0,
  applications_count   int not null default 0,
  is_featured          boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table if not exists public.applications (
  id              uuid primary key default uuid_generate_v4(),
  job_id          uuid not null references public.jobs(id) on delete cascade,
  worker_id       uuid not null references public.profiles(id) on delete cascade,
  cover_letter    text,
  cv_url          text,
  status          application_status not null default 'pending',
  employer_notes  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(job_id, worker_id)
);

create table if not exists public.favorites (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  job_id     uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, job_id)
);

create table if not exists public.conversations (
  id                uuid primary key default uuid_generate_v4(),
  participant_one   uuid not null references public.profiles(id) on delete cascade,
  participant_two   uuid not null references public.profiles(id) on delete cascade,
  last_message_at   timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  unique(participant_one, participant_two),
  check(participant_one <> participant_two)
);

create table if not exists public.messages (
  id               uuid primary key default uuid_generate_v4(),
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  sender_id        uuid not null references public.profiles(id) on delete cascade,
  content          text not null,
  is_read          boolean not null default false,
  created_at       timestamptz not null default now()
);

create table if not exists public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text not null,
  link       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  package_id          uuid references public.packages(id),
  amount              numeric(10,2) not null,
  currency            text not null default 'TRY',
  provider            text not null check (provider in ('stripe', 'iyzico')),
  provider_payment_id text,
  status              payment_status not null default 'pending',
  metadata            jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.investor_inquiries (
  id              uuid primary key default uuid_generate_v4(),
  profile_id      uuid references public.profiles(id) on delete set null,
  full_name       text not null,
  email           text not null,
  phone           text,
  budget_range    text,
  sector_interest text,
  message         text,
  is_contacted    boolean not null default false,
  created_at      timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id           uuid primary key default uuid_generate_v4(),
  author_id    uuid not null references public.profiles(id) on delete cascade,
  slug         text not null unique,
  title_tr     text not null,
  title_en     text not null,
  content_tr   text not null,
  content_en   text not null,
  excerpt_tr   text,
  excerpt_en   text,
  cover_image  text,
  tags         text[] not null default '{}',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  admin_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  target_type text not null,
  target_id   uuid,
  details     jsonb,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- RLS
-- ============================================================

alter table public.profiles enable row level security;
alter table public.worker_profiles enable row level security;
alter table public.companies enable row level security;
alter table public.packages enable row level security;
alter table public.employer_subscriptions enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.favorites enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.payments enable row level security;
alter table public.investor_inquiries enable row level security;
alter table public.blog_posts enable row level security;
alter table public.audit_logs enable row level security;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- profiles
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- worker_profiles
drop policy if exists "Worker profiles are viewable by everyone" on public.worker_profiles;
create policy "Worker profiles are viewable by everyone" on public.worker_profiles for select using (true);

drop policy if exists "Workers can manage their own profile" on public.worker_profiles;
create policy "Workers can manage their own profile" on public.worker_profiles for all using (profile_id = auth.uid());

-- companies
drop policy if exists "Companies are viewable by everyone" on public.companies;
create policy "Companies are viewable by everyone" on public.companies for select using (true);

drop policy if exists "Employers can manage their own company" on public.companies;
create policy "Employers can manage their own company" on public.companies for all using (profile_id = auth.uid());

-- packages
drop policy if exists "Packages viewable by everyone" on public.packages;
create policy "Packages viewable by everyone" on public.packages for select using (true);

-- employer_subscriptions
drop policy if exists "Employers can view their own subscriptions" on public.employer_subscriptions;
create policy "Employers can view their own subscriptions" on public.employer_subscriptions for select using (employer_id = auth.uid());

-- jobs
drop policy if exists "Active jobs are viewable by everyone" on public.jobs;
create policy "Active jobs are viewable by everyone" on public.jobs for select using (status = 'active' or employer_id = auth.uid());

drop policy if exists "Employers can create jobs" on public.jobs;
create policy "Employers can create jobs" on public.jobs for insert with check (employer_id = auth.uid());

drop policy if exists "Employers can update their own jobs" on public.jobs;
create policy "Employers can update their own jobs" on public.jobs for update using (employer_id = auth.uid());

drop policy if exists "Employers can delete their own jobs" on public.jobs;
create policy "Employers can delete their own jobs" on public.jobs for delete using (employer_id = auth.uid());

drop policy if exists "Admins can manage all jobs" on public.jobs;
create policy "Admins can manage all jobs" on public.jobs for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- applications
drop policy if exists "Workers can view their own applications" on public.applications;
create policy "Workers can view their own applications" on public.applications for select using (worker_id = auth.uid());

drop policy if exists "Employers can view applications to their jobs" on public.applications;
create policy "Employers can view applications to their jobs" on public.applications for select using (
  exists (select 1 from public.jobs where id = applications.job_id and employer_id = auth.uid())
);

drop policy if exists "Workers can apply to jobs" on public.applications;
create policy "Workers can apply to jobs" on public.applications for insert with check (worker_id = auth.uid());

drop policy if exists "Workers can withdraw applications" on public.applications;
create policy "Workers can withdraw applications" on public.applications for delete using (worker_id = auth.uid());

drop policy if exists "Employers can update application status" on public.applications;
create policy "Employers can update application status" on public.applications for update using (
  exists (select 1 from public.jobs where id = applications.job_id and employer_id = auth.uid())
);

-- favorites
drop policy if exists "Users can manage their own favorites" on public.favorites;
create policy "Users can manage their own favorites" on public.favorites for all using (user_id = auth.uid());

-- conversations
drop policy if exists "Participants can view their conversations" on public.conversations;
create policy "Participants can view their conversations" on public.conversations for select using (
  participant_one = auth.uid() or participant_two = auth.uid()
);

drop policy if exists "Authenticated users can create conversations" on public.conversations;
create policy "Authenticated users can create conversations" on public.conversations for insert with check (
  participant_one = auth.uid() or participant_two = auth.uid()
);

-- messages
drop policy if exists "Conversation participants can view messages" on public.messages;
create policy "Conversation participants can view messages" on public.messages for select using (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.participant_one = auth.uid() or c.participant_two = auth.uid())
  )
);

drop policy if exists "Senders can insert messages" on public.messages;
create policy "Senders can insert messages" on public.messages for insert with check (sender_id = auth.uid());

drop policy if exists "Recipients can mark messages as read" on public.messages;
create policy "Recipients can mark messages as read" on public.messages for update using (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.participant_one = auth.uid() or c.participant_two = auth.uid())
  )
);

-- notifications
drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications" on public.notifications for select using (user_id = auth.uid());

drop policy if exists "Users can mark their notifications as read" on public.notifications;
create policy "Users can mark their notifications as read" on public.notifications for update using (user_id = auth.uid());

-- payments
drop policy if exists "Users can view their own payments" on public.payments;
create policy "Users can view their own payments" on public.payments for select using (user_id = auth.uid());

drop policy if exists "Service role can insert payments" on public.payments;
create policy "Service role can insert payments" on public.payments for insert with check (user_id = auth.uid());

-- investor_inquiries
drop policy if exists "Anyone can create investor inquiry" on public.investor_inquiries;
create policy "Anyone can create investor inquiry" on public.investor_inquiries for insert with check (true);

drop policy if exists "Investors can view their own inquiries" on public.investor_inquiries;
create policy "Investors can view their own inquiries" on public.investor_inquiries for select using (profile_id = auth.uid());

drop policy if exists "Admins can view investor inquiries" on public.investor_inquiries;
create policy "Admins can view investor inquiries" on public.investor_inquiries for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- blog_posts
drop policy if exists "Published posts are viewable by everyone" on public.blog_posts;
create policy "Published posts are viewable by everyone" on public.blog_posts for select using (is_published = true);

drop policy if exists "Admins can manage blog posts" on public.blog_posts;
create policy "Admins can manage blog posts" on public.blog_posts for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- audit_logs
drop policy if exists "Admins can view audit logs" on public.audit_logs;
create policy "Admins can view audit logs" on public.audit_logs for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

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
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

drop trigger if exists set_worker_profiles_updated_at on public.worker_profiles;
create trigger set_worker_profiles_updated_at before update on public.worker_profiles
  for each row execute function public.update_updated_at();

drop trigger if exists set_companies_updated_at on public.companies;
create trigger set_companies_updated_at before update on public.companies
  for each row execute function public.update_updated_at();

drop trigger if exists set_jobs_updated_at on public.jobs;
create trigger set_jobs_updated_at before update on public.jobs
  for each row execute function public.update_updated_at();

drop trigger if exists set_applications_updated_at on public.applications;
create trigger set_applications_updated_at before update on public.applications
  for each row execute function public.update_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at before update on public.payments
  for each row execute function public.update_updated_at();

drop trigger if exists set_blog_updated_at on public.blog_posts;
create trigger set_blog_updated_at before update on public.blog_posts
  for each row execute function public.update_updated_at();

create or replace function public.increment_job_views(job_id uuid)
returns void language sql security definer as $$
  update public.jobs set views = views + 1 where id = job_id;
$$;

create or replace function public.handle_new_application()
returns trigger language plpgsql as $$
begin
  update public.jobs set applications_count = applications_count + 1
  where id = new.job_id;
  return new;
end;
$$;

drop trigger if exists on_new_application on public.applications;
create trigger on_new_application
  after insert on public.applications
  for each row execute function public.handle_new_application();

create or replace function public.handle_new_message()
returns trigger language plpgsql as $$
begin
  update public.conversations set last_message_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_new_message on public.messages;
create trigger on_new_message
  after insert on public.messages
  for each row execute function public.handle_new_message();

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_worker_profiles_profile on public.worker_profiles(profile_id);
create index if not exists idx_companies_profile on public.companies(profile_id);
create index if not exists idx_jobs_search on public.jobs
  using gin(to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location, '')));
create index if not exists idx_jobs_status on public.jobs(status);
create index if not exists idx_jobs_panel on public.jobs(panel);
create index if not exists idx_jobs_category on public.jobs(category);
create index if not exists idx_jobs_employer on public.jobs(employer_id);
create index if not exists idx_jobs_company on public.jobs(company_id);
create index if not exists idx_jobs_created on public.jobs(created_at desc);
create index if not exists idx_applications_worker on public.applications(worker_id);
create index if not exists idx_applications_job on public.applications(job_id);
create index if not exists idx_favorites_user on public.favorites(user_id);
create index if not exists idx_conversations_p1 on public.conversations(participant_one);
create index if not exists idx_conversations_p2 on public.conversations(participant_two);
create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at desc);
create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);
create index if not exists idx_notifications_unread on public.notifications(user_id) where is_read = false;
create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_investor_inquiries_email on public.investor_inquiries(email);
create index if not exists idx_blog_slug on public.blog_posts(slug);
create index if not exists idx_blog_published on public.blog_posts(published_at desc) where is_published = true;

-- ============================================================
-- REALTIME
-- ============================================================

do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when others then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when others then null; end $$;

-- ============================================================
-- SEED DATA
-- ============================================================

insert into public.packages (name, description, price_try, price_eur, job_limit, featured_limit, duration_days)
values
  ('Başlangıç', 'Küçük işletmeler için', 0, 0, 1, 0, 30),
  ('Standart', 'Büyüyen işletmeler için', 999, 30, 10, 2, 30),
  ('Profesyonel', 'Kurumsal çözüm', 2499, 75, 30, 5, 30),
  ('Kurumsal', 'Sınırsız kullanım', 4999, 150, 100, 20, 30)
on conflict do nothing;
