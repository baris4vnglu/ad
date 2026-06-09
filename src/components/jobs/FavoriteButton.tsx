"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Props {
  jobId: string;
  userId: string;
  initialSaved: boolean;
}

export default function FavoriteButton({ jobId, userId, initialSaved }: Props) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    if (saved) {
      await db.from("favorites").delete().eq("user_id", userId).eq("job_id", jobId);
    } else {
      await db.from("favorites").insert({ user_id: userId, job_id: jobId });
    }
    setSaved(!saved);
    setLoading(false);
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); toggle(); }}
      disabled={loading}
      aria-label={saved ? "Favorilerden çıkar" : "Favorilere ekle"}
      className={cn(
        "p-2 rounded-xl border transition-colors disabled:opacity-50",
        saved
          ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
          : "bg-white border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200"
      )}
    >
      <Heart size={15} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
