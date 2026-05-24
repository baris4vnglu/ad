import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Tag, ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function BlogDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const lang = locale === "tr" ? "tr" : "en";

  const { data: post } = await supabase
    .from("blog_posts")
    .select("slug, title_tr, title_en, content_tr, content_en, excerpt_tr, excerpt_en, cover_image, tags, published_at")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!post) notFound();

  const p = post as Record<string, unknown>;
  const title   = (lang === "tr" ? p.title_tr   : p.title_en)   as string;
  const content = (lang === "tr" ? p.content_tr : p.content_en) as string;
  const tags    = (p.tags as string[]) ?? [];

  return (
    <>
      {p.cover_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.cover_image as string} alt={title} className="w-full h-64 md:h-80 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-gray-900 to-blue-900" />
      )}

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft size={15} /> Blog&apos;a Dön
          </Link>

          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                <Tag size={10} /> {tag}
              </span>
            ))}
            {!!(p.published_at) && (
              <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                <Calendar size={11} />
                {new Date(p.published_at as string).toLocaleDateString("tr-TR")}
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8 leading-snug">{title}</h1>

          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {content}
          </div>
        </div>
      </section>
    </>
  );
}
