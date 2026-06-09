"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  locale: string;
  post?: Record<string, unknown>;
}

export default function BlogPostForm({ locale, post }: Props) {
  const router = useRouter();
  const isEdit = !!post;

  const [form, setForm] = useState({
    slug:       (post?.slug as string)       ?? "",
    title_tr:   (post?.title_tr as string)   ?? "",
    title_en:   (post?.title_en as string)   ?? "",
    content_tr: (post?.content_tr as string) ?? "",
    content_en: (post?.content_en as string) ?? "",
    excerpt_tr: (post?.excerpt_tr as string) ?? "",
    excerpt_en: (post?.excerpt_en as string) ?? "",
    cover_image:(post?.cover_image as string) ?? "",
    tags:       ((post?.tags as string[]) ?? []).join(", "),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Oturum süresi doldu."); setSaving(false); return; }

    const payload = {
      slug:        form.slug.trim(),
      title_tr:    form.title_tr.trim(),
      title_en:    form.title_en.trim(),
      content_tr:  form.content_tr.trim(),
      content_en:  form.content_en.trim(),
      excerpt_tr:  form.excerpt_tr.trim() || null,
      excerpt_en:  form.excerpt_en.trim() || null,
      cover_image: form.cover_image.trim() || null,
      tags:        form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      author_id:   user.id,
    };

    let err;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    if (isEdit) {
      ({ error: err } = await db.from("blog_posts").update(payload).eq("id", post!.id as string));
    } else {
      ({ error: err } = await db.from("blog_posts").insert(payload));
    }

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    router.push(`/${locale}/admin/blog`);
    router.refresh();
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";
  const textareaCls = `${inputCls} resize-none`;
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Link href={`/${locale}/admin/blog`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={14} /> Geri
      </Link>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Temel Bilgiler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Slug (URL) *</label>
            <input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="ornek-yazi-basligi" required />
          </div>
          <div>
            <label className={labelCls}>Başlık (TR) *</label>
            <input className={inputCls} value={form.title_tr} onChange={(e) => set("title_tr", e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Başlık (EN) *</label>
            <input className={inputCls} value={form.title_en} onChange={(e) => set("title_en", e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Özet (TR)</label>
            <textarea className={textareaCls} rows={2} value={form.excerpt_tr} onChange={(e) => set("excerpt_tr", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Özet (EN)</label>
            <textarea className={textareaCls} rows={2} value={form.excerpt_en} onChange={(e) => set("excerpt_en", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Kapak Görseli URL</label>
            <input className={inputCls} type="url" value={form.cover_image} onChange={(e) => set("cover_image", e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className={labelCls}>Etiketler (virgülle ayırın)</label>
            <input className={inputCls} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="iş, kariyer, istihdam" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">İçerik</h2>
        <div>
          <label className={labelCls}>İçerik (TR) *</label>
          <textarea className={textareaCls} rows={14} value={form.content_tr} onChange={(e) => set("content_tr", e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>İçerik (EN) *</label>
          <textarea className={textareaCls} rows={14} value={form.content_en} onChange={(e) => set("content_en", e.target.value)} required />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          <Save size={16} /> {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
