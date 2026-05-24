"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Props {
  conversationId: string;
  currentUserId: string;
  otherUserName: string;
  initialMessages: Message[];
}

export default function ChatRoom({ conversationId, currentUserId, otherUserName, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const supabase = createClient();

    // Mark unread messages as read
    const unreadIds = initialMessages
      .filter((m) => !m.is_read && m.sender_id !== currentUserId)
      .map((m) => m.id);
    if (unreadIds.length > 0) {
      const client = supabase as unknown as { from: (t: string) => { update: (v: unknown) => { in: (c: string, v: string[]) => Promise<unknown> }; eq: (c: string, v: string) => { then: (cb: () => void) => void } } };
      client.from("messages").update({ is_read: true }).in("id", unreadIds).then(() => {});
    }

    // Realtime subscription
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Mark as read if from other user
          if (newMsg.sender_id !== currentUserId) {
            const c = supabase as unknown as { from: (t: string) => { update: (v: unknown) => { eq: (col: string, val: string) => Promise<unknown> } } };
            c.from("messages").update({ is_read: true }).eq("id", newMsg.id).then(() => {});
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, currentUserId, initialMessages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setSending(true);
    setInput("");

    const supabase = createClient();
    const c = supabase as unknown as { from: (t: string) => { insert: (v: unknown) => Promise<unknown> } };
    await c.from("messages").insert({ conversation_id: conversationId, sender_id: currentUserId, content: text });
    setSending(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-white">
        <h2 className="font-semibold text-gray-900">{otherUserName}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-10">
            Henüz mesaj yok. İlk mesajı siz gönderin.
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMine
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMine ? "text-blue-200" : "text-gray-400"}`}>
                  {new Date(msg.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  {isMine && <span className="ml-1">{msg.is_read ? " ✓✓" : " ✓"}</span>}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="px-4 py-3 border-t border-gray-100 bg-white flex gap-3 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Mesaj yaz..."
          rows={1}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors shrink-0"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
