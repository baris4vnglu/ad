import BlogPostForm from "../BlogPostForm";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NewBlogPostPage({ params }: Props) {
  const { locale } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni Blog Yazısı</h1>
      <BlogPostForm locale={locale} />
    </div>
  );
}
