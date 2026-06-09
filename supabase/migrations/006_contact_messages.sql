-- Contact messages from public contact form
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text not null default '',
  subject     text not null default '',
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Only admins can read; anyone (including anon) can insert
alter table public.contact_messages enable row level security;

create policy "Anyone can submit contact message"
  on public.contact_messages for insert
  with check (true);

create policy "Admins can view contact messages"
  on public.contact_messages for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update contact messages"
  on public.contact_messages for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create index idx_contact_messages_created on public.contact_messages(created_at desc);
create index idx_contact_messages_unread on public.contact_messages(is_read) where is_read = false;
