import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { articles as mockArticles, type Article } from "@/lib/mockData";
import { Share2, Facebook, Twitter } from "lucide-react";
import ArticleCard from "@/components/news/ArticleCard";
import ArticleLikes from "@/components/news/ArticleLikes";
import ArticleComments from "@/components/news/ArticleComments";

type MediaItem = {
  id: string;
  media_url: string;
  media_type: string;
  is_featured: boolean;
  position: number;
};

const ArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [relatedFromDb, setRelatedFromDb] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      // Try mock data first
      const mock = mockArticles.find((a) => a.id === id);
      if (mock) {
        setArticle(mock);
        setLoading(false);
        return;
      }

      // Try database
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id!)
        .maybeSingle();

      if (data) {
        setArticle({
            id: data.id,
            title: data.title,
            summary: data.summary || "",
            subheadline: data.subheadline || "",
            content: data.content || "",
            category: data.category,
            subcategory: data.subcategory || undefined,
            author: data.author || "CoreNews Staff",
            date: data.published_at ? new Date(data.published_at).toLocaleDateString() : "",
            imageUrl: data.image_url || "",
            readTime: data.read_time || "5 min",
            isBreaking: data.is_breaking || false,
            isFeatured: data.is_featured || false,
            isTrending: data.is_trending || false,
            isOpinion: data.is_opinion || false,
          });
        // Fetch additional media
        const { data: mediaData } = await supabase
          .from("article_media")
          .select("*")
          .eq("article_id", data.id)
          .order("position", { ascending: true });
        if (mediaData) setMedia(mediaData as MediaItem[]);

        // Fetch related articles from DB
        const { data: related } = await supabase
          .from("articles")
          .select("*")
          .eq("status", "published")
          .eq("category", data.category)
          .neq("id", data.id)
          .limit(3);
        if (related) {
          setRelatedFromDb(related.map((r: any) => ({
            id: r.id,
            title: r.title,
            summary: r.summary || "",
            subheadline: r.subheadline || "",
            content: r.content || "",
            category: r.category,
            author: r.author || "CoreNews Staff",
            date: r.published_at ? new Date(r.published_at).toLocaleDateString() : "",
            imageUrl: r.image_url || "",
            readTime: r.read_time || "5 min",
            isBreaking: r.is_breaking || false,
            isFeatured: r.is_featured || false,
            isTrending: r.is_trending || false,
            isOpinion: r.is_opinion || false,
          })));
        }

        // Record view for trending
        const sessionId = sessionStorage.getItem("view_session") || crypto.randomUUID();
        sessionStorage.setItem("view_session", sessionId);
        await supabase.from("article_views").insert({ article_id: data.id, session_id: sessionId });
      }
      setLoading(false);
    };

    fetchArticle();
  }, [id]);

  const relatedArticles = relatedFromDb.length > 0
    ? relatedFromDb
    : mockArticles.filter((a) => a.id !== id && a.category === article?.category).slice(0, 3);

  if (loading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="font-serif text-4xl font-bold">Article not found</h1>
          <Link to="/" className="ghost-button mt-6 inline-block">Back to Home</Link>
        </div>
      </Layout>
    );
  }

  const bodyContent = article.content || article.summary + "\n\nThis is a developing story. CoreNews will provide updates as more information becomes available.";

  // Get non-featured media for gallery
  const galleryMedia = media.filter((m) => !m.is_featured);

  const renderMediaEmbed = (m: MediaItem) => {
    if (m.media_type === "youtube") {
      const videoId = m.media_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
      return videoId ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full aspect-video"
          allowFullScreen
          title="Video"
        />
      ) : null;
    }
    if (m.media_type === "video") {
      return <video src={m.media_url} controls className="w-full aspect-video" />;
    }
    return <img src={m.media_url} alt="" className="w-full object-cover" loading="lazy" />;
  };

  return (
    <Layout>
      <article className="container py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {article.isOpinion && (
              <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Opinion</span>
            )}
            <span className="category-tag mb-3 block">{article.category}</span>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">{article.title}</h1>
            {article.subheadline && <p className="mt-3 text-lg font-medium text-foreground/80">{article.subheadline}</p>}
            <p className="mt-4 text-xl text-muted-foreground leading-relaxed">{article.summary}</p>

            <div className="mt-6 flex items-center gap-4 pb-6 border-b border-border">
              <span className="text-sm font-medium">{article.author}</span>
              <span className="meta-text">{article.date}</span>
              <span className="meta-text">{article.readTime} read</span>
            </div>

            <div className="flex items-center gap-3 py-4 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Share</span>
              <button className="p-2 hover:bg-muted rounded transition-colors" aria-label="Share">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-muted rounded transition-colors" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-muted rounded transition-colors" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </button>
            </div>

            {/* Featured Image */}
            {article.imageUrl ? (
              <div className="mt-6 aspect-[16/9] bg-muted overflow-hidden">
                <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="mt-6 aspect-[16/9] bg-muted">
                <div className="w-full h-full bg-gradient-to-br from-muted to-border flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Featured Image</span>
                </div>
              </div>
            )}

            <div className="mt-8 prose-article mx-auto lg:mx-0">
              {bodyContent.split("\n\n").map((p, i) => (
                <p key={i} className="mb-4 text-foreground/90">{p}</p>
              ))}
            </div>

            {/* Media Gallery */}
            {galleryMedia.length > 0 && (
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Media Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {galleryMedia.map((m) => (
                    <div key={m.id} className="overflow-hidden bg-muted">
                      {renderMediaEmbed(m)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-border flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-2">Tags</span>
              {[article.category, article.subcategory, "Nigeria"].filter(Boolean).map((tag) => (
                <span key={tag} className="text-xs border border-border px-3 py-1">{tag}</span>
              ))}
            </div>

            <div className="mt-4 text-xs text-muted-foreground italic">
              Augmented by CoreNews AI
            </div>
          </div>

          <aside className="lg:col-span-4 lg:border-l border-border lg:pl-8">
            <div className="sticky top-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 pb-2 border-b border-border">
                Related Stories
              </h3>
              <div className="space-y-0">
                {relatedArticles.length > 0 ? (
                  relatedArticles.map((a) => (
                    <ArticleCard key={a.id} article={a} variant="compact" />
                  ))
                ) : (
                  mockArticles.slice(0, 3).map((a) => (
                    <ArticleCard key={a.id} article={a} variant="compact" />
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </article>
    </Layout>
  );
};

export default ArticlePage;
