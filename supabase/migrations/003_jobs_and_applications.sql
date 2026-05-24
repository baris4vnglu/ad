-- Jobs table
create table public.jobs (
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

-- Applications
create table public.applications (
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

-- Favorites
create table public.favorites (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  job_id     uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, job_id)
);

-- RLS
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.favorites enable row level security;

-- Jobs policies
create policy "Active jobs are viewable by everyone"
  on public.jobs for select using (status = 'active' or employer_id = auth.uid());

create policy "Employers can create jobs"
  on public.jobs for insert with check (employer_id = auth.uid());

create policy "Employers can update their own jobs"
  on public.jobs for update using (employer_id = auth.uid());

create policy "Employers can delete their own jobs"
  on public.jobs for delete using (employer_id = auth.uid());

-- Admin can see all jobs (function-based check)
create policy "Admins can manage all jobs"
  on public.jobs for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Applications policies
create policy "Workers can view their own applications"
  on public.applications for select using (worker_id = auth.uid());

create policy "Employers can view applications to their jobs"
  on public.applications for select using (
    exists (
      select 1 from public.jobs
      where id = applications.job_id and employer_id = auth.uid()
    )
  );

create policy "Workers can apply to jobs"
  on public.applications for insert with check (worker_id = auth.uid());

create policy "Workers can withdraw applications"
  on public.applications for delete using (worker_id = auth.uid());

create policy "Employers can update application status"
  on public.applications for update using (
    exists (
      select 1 from public.jobs
      where id = applications.job_id and employer_id = auth.uid()
    )
  );

-- Favorites policies
create policy "Users can manage their own favorites"
  on public.favorites for all using (user_id = auth.uid());

-- Triggers
create trigger set_jobs_updated_at before update on public.jobs
  for each row execute function public.update_updated_at();

create trigger set_applications_updated_at before update on public.applications
  for each row execute function public.update_updated_at();

-- Increment job views function
create or replace function public.increment_job_views(job_id uuid)
returns void language sql security definer as $$
  update public.jobs set views = views + 1 where id = job_id;
$$;

-- Increment applications count when new application is inserted
create or replace function public.handle_new_application()
returns trigger language plpgsql as $$
begin
  update public.jobs set applications_count = applications_count + 1
  where id = new.job_id;
  return new;
end;
$$;

create trigger on_new_application
  after insert on public.applications
  for each row execute function public.handle_new_application();

-- Full-text search index (Turkish config)
create index idx_jobs_search on public.jobs
  using gin(to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location, '')));

create index idx_jobs_status on public.jobs(status);
create index idx_jobs_panel on public.jobs(panel);
create index idx_jobs_category on public.jobs(category);
create index idx_jobs_employer on public.jobs(employer_id);
create index idx_jobs_company on public.jobs(company_id);
create index idx_jobs_created on public.jobs(created_at desc);
create index idx_applications_worker on public.applications(worker_id);
create index idx_applications_job on public.applications(job_id);
create index idx_favorites_user on public.favorites(user_id);
