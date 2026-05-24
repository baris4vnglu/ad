import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ConversationList from "@/components/messages/ConversationList";
import { MessageCircle } from "lucide-react";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function EmployerMessagesPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

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

  return (
    <div className="h-[calc(100vh-120px)] flex">
      <div className="w-80 shrink-0">
        <ConversationList
          conversations={conversations}
          basePath={`/${locale}/employer/messages`}
        />
      </div>
      <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-r-2xl">
        <div className="text-center">
          <MessageCircle size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Bir konuşma seçin</p>
        </div>
      </div>
    </div>
  );
}
