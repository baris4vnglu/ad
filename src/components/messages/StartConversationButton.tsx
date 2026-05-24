"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MessageCircle } from "lucide-react";

interface Props {
  workerId: string;
  employerId: string;
  locale: string;
  role: "employer" | "worker";
}

export default function StartConversationButton({ workerId, employerId, locale, role }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const supabase = createClient();

    // participant_one < participant_two (alphabetical) to satisfy unique constraint
    const [p1, p2] = [workerId, employerId].sort();

    // Upsert conversation
    const c = supabase as unknown as {
      from: (t: string) => {
        upsert: (v: unknown, opts: unknown) => { select: (cols: string) => { single: () => Promise<{ data: unknown }> } }
      }
    };
    const { data } = await c
      .from("conversations")
      .upsert({ participant_one: p1, participant_two: p2 }, { onConflict: "participant_one,participant_two" })
      .select("id")
      .single();

    const convId = (data as Record<string, unknown> | null)?.id as string;
    if (convId) {
      router.push(`/${locale}/${role}/messages/${convId}`);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs text-purple-700 font-semibold border border-purple-200 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
    >
      <MessageCircle size={13} />
      {loading ? "..." : "Mesaj Gönder"}
    </button>
  );
}
