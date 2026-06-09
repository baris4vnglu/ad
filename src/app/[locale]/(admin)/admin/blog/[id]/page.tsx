import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BlogPostForm from "../BlogPostForm";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditBlogPostPage({ params }: Props) {
  const { locale, id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Blog Yazısını Düzenle</h1>
      <BlogPostForm locale={locale} post={post as Record<string, unknown>} />
    </div>
  );
}
