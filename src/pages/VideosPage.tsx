import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { articles as mockArticles, type Article } from "@/lib/mockData";

const VideosPage = () => {
  const [videos, setVideos] = useState<Article[]>([]);

  useEffect(() => {
    const fetchVideoArticles = async () => {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .or("category.ilike.%video%,title.ilike.%video%,summary.ilike.%video%")
        .order("published_at", { ascending: false })
        .limit(60);

      if (data && data.length > 0) {
        setVideos(
          data.map((a: any) => ({
            id: a.id,
            title: a.title,
            summary: a.summary || "",
            content: a.content || "",
            category: a.category,
            author: a.author || "Frontier Staff",
            date: a.published_at ? new Date(a.published_at).toLocaleDateString() : "",
            imageUrl: a.image_url || "",
            readTime: a.read_time || "5 min",
            isBreaking: a.is_breaking || false,
            isFeatured: a.is_featured || false,
            isTrending: a.is_trending || false,
            isOpinion: a.is_opinion || false,
          }))
        );
      } else {
        setVideos(mockArticles.filter((a) => a.category.toLowerCase().includes("video") || a.title.toLowerCase().includes("video")));
      }
    };

    fetchVideoArticles();
  }, []);

  return (
    <Layout>
      <section className="container py-8 md:py-12">
        <h1 className="font-serif text-4xl font-bold mb-4">Video News</h1>
        <p className="text-muted-foreground mb-8">Explore the latest video journalism from Frontier, featuring breaking reports, interviews and investigations.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((article) => (
            <Link
              key={article.id}
              to={`/video/${article.id}`}
              className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              {article.imageUrl ? (
                <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground">Video Thumbnail</div>
              )}
              <div className="p-4">
                {article.isBreaking && <span className="category-tag mb-1 block">Breaking</span>}
                <h2 className="text-lg font-semibold leading-tight">{article.title}</h2>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{article.summary}</p>
                <div className="mt-3 text-xs text-muted-foreground">{article.date} · {article.readTime} read</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default VideosPage;
