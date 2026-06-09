import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { PlusCircle, Edit, Eye, EyeOff } from "lucide-react";
import BlogPostActions from "./BlogPostActions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminBlogPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, title_tr, title_en, is_published, created_at, published_at")
    .order("created_at", { ascending: false });

  const list = (posts ?? []) as Array<Record<string, unknown>>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Yönetimi</h1>
          <p className="text-gray-500 text-sm mt-0.5">{list.length} yazı</p>
        </div>
        <Link
          href={`/${locale}/admin/blog/new`}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <PlusCircle size={16} /> Yeni Yazı
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-400 mb-4">Henüz blog yazısı yok.</p>
          <Link
            href={`/${locale}/admin/blog/new`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={16} /> İlk Yazıyı Ekle
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Başlık (TR)</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Durum</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tarih</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((post) => (
                <tr key={post.id as string} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900 truncate max-w-[240px]">
                      {post.title_tr as string}
                    </div>
                    <div className="text-xs text-gray-400">{post.title_en as string}</div>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 font-mono">{post.slug as string}</td>
                  <td className="px-5 py-4">
                    {post.is_published ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        <Eye size={11} /> Yayında
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        <EyeOff size={11} /> Taslak
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">
                    {new Date(post.created_at as string).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/${locale}/admin/blog/${post.id as string}`}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        <Edit size={12} /> Düzenle
                      </Link>
                      <BlogPostActions postId={post.id as string} isPublished={post.is_published as boolean} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
