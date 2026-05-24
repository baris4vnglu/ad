-- Conversations
create table public.conversations (
  id                uuid primary key default uuid_generate_v4(),
  participant_one   uuid not null references public.profiles(id) on delete cascade,
  participant_two   uuid not null references public.profiles(id) on delete cascade,
  last_message_at   timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  unique(participant_one, participant_two),
  check(participant_one <> participant_two)
);

-- Messages
create table public.messages (
  id               uuid primary key default uuid_generate_v4(),
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  sender_id        uuid not null references public.profiles(id) on delete cascade,
  content          text not null,
  is_read          boolean not null default false,
  created_at       timestamptz not null default now()
);

-- Notifications
create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text not null,
  link       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

-- Conversation policies
create policy "Participants can view their conversations"
  on public.conversations for select using (
    participant_one = auth.uid() or participant_two = auth.uid()
  );

create policy "Authenticated users can create conversations"
  on public.conversations for insert with check (
    participant_one = auth.uid() or participant_two = auth.uid()
  );

-- Messages policies
create policy "Conversation participants can view messages"
  on public.messages for select using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.participant_one = auth.uid() or c.participant_two = auth.uid())
    )
  );

create policy "Senders can insert messages"
  on public.messages for insert with check (sender_id = auth.uid());

create policy "Recipients can mark messages as read"
  on public.messages for update using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.participant_one = auth.uid() or c.participant_two = auth.uid())
    )
  );

-- Notifications policies
create policy "Users can view their own notifications"
  on public.notifications for select using (user_id = auth.uid());

create policy "Users can mark their notifications as read"
  on public.notifications for update using (user_id = auth.uid());

-- Update conversation last_message_at on new message
create or replace function public.handle_new_message()
returns trigger language plpgsql as $$
begin
  update public.conversations
  set last_message_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger on_new_message
  after insert on public.messages
  for each row execute function public.handle_new_message();

-- Indexes
create index idx_conversations_p1 on public.conversations(participant_one);
create index idx_conversations_p2 on public.conversations(participant_two);
create index idx_messages_conversation on public.messages(conversation_id, created_at desc);
create index idx_messages_sender on public.messages(sender_id);
create index idx_notifications_user on public.notifications(user_id, created_at desc);
create index idx_notifications_unread on public.notifications(user_id) where is_read = false;

-- Enable realtime for messages and notifications
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
