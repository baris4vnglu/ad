import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ConversationList from "@/components/messages/ConversationList";
import ChatRoom from "@/components/messages/ChatRoom";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function WorkerChatPage({ params }: Props) {
  const { locale, id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  // Load all conversations
  const { data: convs } = await supabase
    .from("conversations")
    .select(`id, last_message_at, p1:participant_one(id, full_name), p2:participant_two(id, full_name)`)
    .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  const { data: unreadCounts } = await supabase
    .from("messages")
    .select("conversation_id")
    .eq("is_read", false)
    .neq("sender_id", user.id);

  const unreadMap: Record<string, number> = {};
  (unreadCounts ?? []).forEach((m) => {
    const cid = (m as Record<string, unknown>).conversation_id as string;
    unreadMap[cid] = (unreadMap[cid] ?? 0) + 1;
  });

  const conversations = (convs ?? []).map((c) => {
    const conv = c as Record<string, unknown>;
    const p1 = conv.p1 as Record<string, unknown> | null;
    const p2 = conv.p2 as Record<string, unknown> | null;
    const other = p1?.id === user.id ? p2 : p1;
    return {
      id: conv.id as string,
      otherName: other?.full_name as string ?? "Kullanıcı",
      lastMessageAt: conv.last_message_at as string,
      unreadCount: unreadMap[conv.id as string] ?? 0,
    };
  });

  // Load current conversation
  const currentConv = conversations.find((c) => c.id === id);
  if (!currentConv) notFound();

  const { data: msgs } = await supabase
    .from("messages")
    .select("id, sender_id, content, is_read, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const messages = (msgs ?? []) as Array<{
    id: string; sender_id: string; content: string; is_read: boolean; created_at: string;
  }>;

  return (
    <div className="h-[calc(100vh-120px)] flex rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="w-80 shrink-0">
        <ConversationList
          conversations={conversations}
          basePath={`/${locale}/worker/messages`}
          currentConvId={id}
        />
      </div>
      <div className="flex-1 min-w-0">
        <ChatRoom
          conversationId={id}
          currentUserId={user.id}
          otherUserName={currentConv.otherName}
          initialMessages={messages}
        />
      </div>
    </div>
  );
}
