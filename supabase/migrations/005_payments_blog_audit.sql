-- Payments
create table public.payments (
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

-- Investor inquiries
create table public.investor_inquiries (
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

-- Blog posts
create table public.blog_posts (
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

-- Audit log (admin only)
create table public.audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  admin_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  target_type text not null,
  target_id   uuid,
  details     jsonb,
  created_at  timestamptz not null default now()
);

-- RLS
alter table public.payments enable row level security;
alter table public.investor_inquiries enable row level security;
alter table public.blog_posts enable row level security;
alter table public.audit_logs enable row level security;

-- Payments policies
create policy "Users can view their own payments"
  on public.payments for select using (user_id = auth.uid());

create policy "Service role can insert payments"
  on public.payments for insert with check (user_id = auth.uid());

-- Investor inquiries — anyone can submit
create policy "Anyone can create investor inquiry"
  on public.investor_inquiries for insert with check (true);

create policy "Admins can view investor inquiries"
  on public.investor_inquiries for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Blog posts
create policy "Published posts are viewable by everyone"
  on public.blog_posts for select using (is_published = true);

create policy "Admins can manage blog posts"
  on public.blog_posts for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Audit logs — admin only
create policy "Admins can view audit logs"
  on public.audit_logs for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Triggers
create trigger set_payments_updated_at before update on public.payments
  for each row execute function public.update_updated_at();

create trigger set_blog_updated_at before update on public.blog_posts
  for each row execute function public.update_updated_at();

-- Indexes
create index idx_payments_user on public.payments(user_id);
create index idx_payments_status on public.payments(status);
create index idx_investor_inquiries_email on public.investor_inquiries(email);
create index idx_blog_slug on public.blog_posts(slug);
create index idx_blog_published on public.blog_posts(published_at desc) where is_published = true;

-- Default packages
insert into public.packages (name, description, price_try, price_eur, job_limit, featured_limit, duration_days)
values
  ('Başlangıç', 'Küçük işletmeler için', 0, 0, 1, 0, 30),
  ('Standart', 'Büyüyen işletmeler için', 999, 30, 10, 2, 30),
  ('Profesyonel', 'Kurumsal çözüm', 2499, 75, 30, 5, 30),
  ('Kurumsal', 'Sınırsız kullanım', 4999, 150, 100, 20, 30);
