import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Tag } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const supabase = await createClient();
  const lang = locale === "tr" ? "tr" : "en";

  const { data: posts } = await supabase
    .from("blog_posts" as never)
    .select("id, slug, title_tr, title_en, excerpt_tr, excerpt_en, cover_image, tags, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(20);

  const list = ((posts ?? []) as Array<Record<string, unknown>>);

  const dateLocale = locale === "tr" ? "tr-TR" : locale === "ar" ? "ar-SA" : "en-GB";

  return (
    <>
      <section className="py-16 bg-gradient-to-br from-gray-900 to-blue-900">
        <div className="container mx-auto px-4">
          <div className="text-xs font-medium text-white/60 mb-4">
            <Link href={`/${locale}`} className="hover:text-white/80">{t("nav.home")}</Link>
            <span className="mx-2">/</span>
            <span>{t("blog.title")}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">{t("blog.title")}</h1>
          <p className="text-white/70 text-lg max-w-xl">{t("blog.sub")}</p>
        </div>
      </section>

      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          {list.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <div className="text-4xl mb-3">✍️</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{t("blog.empty")}</h2>
              <p className="text-gray-400 text-sm">{t("blog.empty_soon")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {list.map((post) => {
                const title   = (lang === "tr" ? post.title_tr   : post.title_en)   as string;
                const excerpt = (lang === "tr" ? post.excerpt_tr : post.excerpt_en) as string | null;
                const tags    = (post.tags as string[]) ?? [];

                return (
                  <Link
                    key={post.id as string}
                    href={`/${locale}/blog/${post.slug as string}`}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden flex flex-col"
                  >
                    {post.cover_image ? (
                      <div className="relative w-full h-44">
                        <Image
                          src={post.cover_image as string}
                          alt={title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-44 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-4xl">
                        📰
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <h2 className="font-bold text-gray-900 mb-2 leading-snug">{title}</h2>
                      {excerpt && (
                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3 flex-1">{excerpt}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                              <Tag size={10} /> {tag}
                            </span>
                          ))}
                        </div>
                        {!!(post.published_at) && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar size={11} />
                            {new Date(post.published_at as string).toLocaleDateString(dateLocale)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
