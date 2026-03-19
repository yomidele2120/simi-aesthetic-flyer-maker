import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { articles as mockArticles, type Article } from "@/lib/mockData";

const VideoArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>("");

  useEffect(() => {
    const fetchArticle = async () => {
      const mock = mockArticles.find((a) => a.id === id);
      if (mock) {
        setArticle(mock);
        setVideoUrl(mock.imageUrl || "");
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id!)
        .maybeSingle();

      if (data) {
        const normalized: Article = {
          id: data.id,
          title: data.title,
          summary: data.summary || "",
          content: data.content || "",
          category: data.category,
          author: data.author || "Frontier Staff",
          date: data.published_at ? new Date(data.published_at).toLocaleDateString() : "",
          imageUrl: data.image_url || "",
          readTime: data.read_time || "5 min",
          isBreaking: data.is_breaking || false,
          isFeatured: data.is_featured || false,
          isTrending: data.is_trending || false,
          isOpinion: data.is_opinion || false,
        };

        setArticle(normalized);

        const { data: mediaData } = await supabase
          .from("article_media")
          .select("media_url, media_type")
          .eq("article_id", data.id)
          .order("position", { ascending: true })
          .limit(1);

        const firstMedia = mediaData?.[0];

        if (firstMedia?.media_type === "youtube" && firstMedia.media_url) {
          const idMatch = firstMedia.media_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
          if (idMatch?.[1]) {
            setVideoUrl(`https://www.youtube.com/embed/${idMatch[1]}`);
          }
        } else if (firstMedia?.media_type === "video") {
          setVideoUrl(firstMedia.media_url);
        } else if (normalized.imageUrl) {
          setVideoUrl(normalized.imageUrl);
        }

        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-16 text-center">Loading video article...</div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container py-16 text-center"><h1 className="text-3xl">Video not found</h1></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="container py-8 md:py-12">
        <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/videos" className="hover:underline">Video Hub</Link> / <span>{article.title}</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">{article.title}</h1>
        <p className="text-sm text-muted-foreground mb-4">{article.date} · {article.author} · {article.readTime}read</p>

        <div className="mb-6">
          {videoUrl.startsWith("https://www.youtube.com/embed/") ? (
            <iframe
              className="w-full aspect-video"
              src={videoUrl}
              title={article.title}
              allowFullScreen
            />
          ) : videoUrl.endsWith(".mp4") ? (
            <video src={videoUrl} controls className="w-full aspect-video" />
          ) : (
            <img src={videoUrl || article.imageUrl} alt={article.title} className="w-full h-auto object-cover" />
          )}
        </div>

        <p className="text-lg leading-relaxed text-muted-foreground mb-8">{article.summary}</p>
        <div className="prose-article">{article.content.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}</div>

        <div className="mt-8 flex gap-2 flex-wrap">
          <Link to={`/article/${article.id}`} className="rounded border border-border px-3 py-2 text-sm hover:bg-muted">Open Article View</Link>
          <Link to="/videos" className="rounded border border-border px-3 py-2 text-sm hover:bg-muted">Back to Videos</Link>
        </div>
      </article>
    </Layout>
  );
};

export default VideoArticlePage;
