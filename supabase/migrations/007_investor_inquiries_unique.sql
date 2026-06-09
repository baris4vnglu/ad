-- Allow only one inquiry per profile (upsert support)
alter table public.investor_inquiries
  add column if not exists updated_at timestamptz not null default now();

create trigger set_investor_inquiries_updated_at before update on public.investor_inquiries
  for each row execute function public.update_updated_at();

-- Partial unique index so each profile can have at most one inquiry
create unique index if not exists idx_investor_inquiries_profile
  on public.investor_inquiries (profile_id)
  where profile_id is not null;

-- Allow users to update their own inquiry
create policy "Users can update own investor inquiry"
  on public.investor_inquiries for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);
