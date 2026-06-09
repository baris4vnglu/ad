"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  postId: string;
  isPublished: boolean;
}

export default function BlogPostActions({ postId, isPublished }: Props) {
  const [published, setPublished] = useState(isPublished);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function togglePublish() {
    setLoading(true);
    const supabase = createClient();
    const newVal = !published;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("blog_posts")
      .update({
        is_published: newVal,
        published_at: newVal ? new Date().toISOString() : null,
      })
      .eq("id", postId);
    setPublished(newVal);
    setLoading(false);
  }

  async function deletePost() {
    if (!confirm("Bu yazıyı silmek istediğinizden emin misiniz?")) return;
    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("blog_posts").delete().eq("id", postId);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={togglePublish}
        disabled={loading}
        className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors disabled:opacity-50 ${
          published
            ? "text-gray-600 border border-gray-200 hover:bg-gray-50"
            : "text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
        }`}
      >
        {published ? "Yayından Al" : "Yayınla"}
      </button>
      <button
        onClick={deletePost}
        disabled={loading}
        className="text-xs text-red-600 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
