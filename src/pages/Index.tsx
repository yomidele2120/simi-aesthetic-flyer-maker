import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import ArticleCard from "@/components/news/ArticleCard";
import HeroSlideshow from "@/components/news/HeroSlideshow";
import NewsletterSignup from "@/components/news/NewsletterSignup";
import VideoNewsSection from "@/components/news/VideoNewsSection";
import { supabase } from "@/integrations/supabase/client";
import { articles as mockArticles, categories } from "@/lib/mockData";
import { type Article } from "@/lib/mockData";
import { Link } from "react-router-dom";

const PAGE_SIZE = 8;

const Index = () => {
  const [dbArticles, setDbArticles] = useState<Article[]>([]);
  const [heroArticles, setHeroArticles] = useState<Article[]>([]);
  const [mostReadArticles, setMostReadArticles] = useState<Article[]>([]);
  const [latestFeed, setLatestFeed] = useState<Article[]>([]);
  const [feedPage, setFeedPage] = useState(1);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);

  const loadMoreObserverRef = useRef<HTMLDivElement | null>(null);

  const allArticles = useMemo(() => dbArticles.length > 0 ? [...dbArticles, ...mockArticles] : mockArticles, [dbArticles]);
  const slideshowArticles = heroArticles.length > 0
    ? heroArticles
    : allArticles.filter((a) => a.isFeatured || a.isBreaking).slice(0, 4);

  const heroStory = slideshowArticles[0] || allArticles[0];
  const heroSecondary = slideshowArticles.slice(1, 5);

  const topStoryCandidates = Array.from(new Set([
    ...allArticles.filter((a) => a.isFeatured),
    ...allArticles.filter((a) => a.isTrending),
  ])).slice(0, 8);

  const categorySlugs = [
    { name: "Politics", source: "Politics" },
    { name: "Business", source: "Business & Economy" },
    { name: "Technology", source: "Technology" },
    { name: "Health", source: "Health" },
    { name: "Sports", source: "Sports" },
    { name: "Entertainment", source: "Entertainment" },
  ];

  const videoArticles = allArticles.filter(
    (a) => a.category.toLowerCase().includes("video") || a.title.toLowerCase().includes("video")
  );

  const feedItems = latestFeed.slice(0, feedPage * PAGE_SIZE);

  const loadMore = useCallback(() => {
    setFeedPage((prev) => {
      const next = prev + 1;
      setHasMoreFeed(latestFeed.length > next * PAGE_SIZE);
      return next;
    });
  }, [latestFeed.length]);

  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(100);

      if (data && data.length > 0) {
        const mapped: Article[] = data.map((a: any) => ({
          id: a.id,
          title: a.title,
          summary: a.summary || "",
          content: a.content || "",
          category: a.category,
          author: a.author || "CoreNews Staff",
          date: a.published_at ? new Date(a.published_at).toLocaleDateString() : "",
          imageUrl: a.image_url || "",
          readTime: a.read_time || "5 min",
          isBreaking: a.is_breaking || false,
          isFeatured: a.is_featured || false,
          isTrending: a.is_trending || false,
          isOpinion: a.is_opinion || false,
        }));
        setDbArticles(mapped);

        const now = new Date().toISOString();
        const heroes = data
          .filter((a: any) => a.hero_enabled && (!a.hero_expires_at || a.hero_expires_at > now))
          .map((a: any) => ({
            id: a.id,
            title: a.title,
            summary: a.summary || "",
            content: a.content || "",
            category: a.category,
            author: a.author || "CoreNews Staff",
            date: a.published_at ? new Date(a.published_at).toLocaleDateString() : "",
            imageUrl: a.image_url || "",
            readTime: a.read_time || "5 min",
            isBreaking: a.is_breaking || false,
            isFeatured: a.is_featured || false,
            isTrending: a.is_trending || false,
            isOpinion: a.is_opinion || false,
          }));

        setHeroArticles(heroes);
      }
    };

    fetchArticles();

    const channel = supabase
      .channel("homepage-articles")
      .on("postgres_changes", { event: "*", schema: "public", table: "articles" }, () => {
        fetchArticles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const fetchMostRead = async () => {
      const { data: viewData } = await supabase
        .from("article_views")
        .select("article_id");

      if (viewData && viewData.length > 0) {
        const freq = viewData.reduce<Record<string, number>>((acc, view) => {
          if (!view.article_id) return acc;
          acc[view.article_id] = (acc[view.article_id] || 0) + 1;
          return acc;
        }, {});

        const sortedByViews = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([articleId]) => allArticles.find((a) => a.id === articleId))
          .filter((a): a is Article => Boolean(a));

        setMostReadArticles(sortedByViews);
      }
    };

    fetchMostRead();
  }, [allArticles]);

  useEffect(() => {
    const sorted = [...allArticles].sort((a, b) => {
      const dA = new Date(a.date).getTime();
      const dB = new Date(b.date).getTime();
      return dB - dA;
    });

    setLatestFeed(sorted);
    setFeedPage(1);
    setHasMoreFeed(sorted.length > PAGE_SIZE);
  }, [allArticles]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMoreFeed) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    if (loadMoreObserverRef.current) {
      observer.observe(loadMoreObserverRef.current);
    }

    return () => observer.disconnect();
  }, [hasMoreFeed, loadMore]);

  const breakingArticles = allArticles.filter((a) => a.isBreaking).slice(0, 5);
  const categoryResults = categorySlugs.map((cat) => {
    const items = allArticles.filter((a) => a.category.toLowerCase().includes(cat.source.toLowerCase()));
    return {
      name: cat.name,
      articles: items,
      featured: items[0],
      smalls: items.slice(1, 4),
    };
  });

  const trendingArticles = mostReadArticles.length > 0
    ? mostReadArticles
    : allArticles.filter((a) => a.isTrending).slice(0, 5);

  const latestForFeed = feedItems;

  return (
    <Layout>
      <section className="container py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {heroStory && (
              <article className="mb-8 rounded-lg overflow-hidden border border-border shadow-sm">
                {heroStory.imageUrl ? (
                  <img src={heroStory.imageUrl} alt={heroStory.title} className="w-full h-80 object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-80 bg-muted flex items-center justify-center text-muted-foreground">No hero image</div>
                )}
                <div className="p-6 bg-background">
                  {heroStory.isBreaking && <span className="category-tag mb-2 block">Breaking</span>}
                  <span className="category-tag mb-2 block">{heroStory.category}</span>
                  <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">{heroStory.title}</h1>
                  <p className="mt-3 text-lg text-muted-foreground leading-relaxed">{heroStory.summary}</p>
                  <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{heroStory.author}</span>
                    <span>·</span>
                    <span>{heroStory.date}</span>
                    <span>·</span>
                    <span>{heroStory.readTime} read</span>
                  </div>
                  <Link to={`/article/${heroStory.id}`} className="inline-block mt-4 rounded bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/90">
                    Read More
                  </Link>
                </div>
              </article>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {heroSecondary.map((article) => (
                <ArticleCard key={article.id} article={article} variant="hero" />
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4 lg:border-l border-border lg:pl-8">
            <div className="sticky top-24 space-y-5">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Most Read</h2>
                <div className="space-y-3">
                  {trendingArticles.map((article, index) => (
                    <Link key={article.id} to={`/article/${article.id}`} className="block p-2 rounded border border-border hover:border-primary transition">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{index + 1}. {article.title}</span>
                        <span className="text-xs text-muted-foreground">{article.readTime}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Breaking Headlines</h2>
                <ul className="space-y-2 text-sm">
                  {breakingArticles.map((article) => (
                    <li key={article.id}>
                      <Link to={`/article/${article.id}`} className="hover:underline">{article.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="container py-8 md:py-12">
        <h2 className="text-2xl font-serif font-bold mb-4">Top Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {topStoryCandidates.map((story) => (
            <ArticleCard key={story.id} article={story} />
          ))}
        </div>
      </section>

      <VideoNewsSection candidateVideos={videoArticles.length > 0 ? videoArticles.slice(0, 5).map((a) => ({
        id: a.id,
        title: a.title,
        duration: a.readTime,
        thumbnail: a.imageUrl || "https://images.unsplash.com/photo-1551739670-77d5f89741f3?auto=format&fit=crop&w=1200&q=80",
        articleId: a.id,
        source: "internal",
      })) : undefined} />

      <section className="container py-8 md:py-12">
        <h2 className="text-2xl font-serif font-bold mb-6">By Category</h2>
        <div className="space-y-10">
          {categoryResults.map((block) => (
            <section key={block.name}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{block.name}</h3>
                <Link to={`/${block.name.toLowerCase()}`} className="text-sm text-primary hover:underline">See more</Link>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {block.featured ? (
                  <ArticleCard article={block.featured} variant="hero" />
                ) : (
                  <div className="p-4 border border-border rounded text-muted-foreground">No featured story yet.</div>
                )}
                <div className="grid grid-cols-1 gap-3 lg:col-span-2">
                  {block.smalls.length > 0 ? block.smalls.map((item) => (
                    <ArticleCard key={item.id} article={item} variant="compact" />
                  )) : <p className="text-muted-foreground">No additional stories yet.</p>}
                </div>
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="container py-8 md:py-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-serif font-bold">Latest News Feed</h2>
          <span className="text-sm text-muted-foreground">Live updates and infinite scroll</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {latestForFeed.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {hasMoreFeed && (
          <div ref={loadMoreObserverRef} className="mt-6 text-center py-4">
            <button onClick={loadMore} className="rounded border border-border px-4 py-2 text-sm font-semibold hover:bg-muted transition">
              Load more stories
            </button>
          </div>
        )}

        {!hasMoreFeed && <p className="mt-6 text-center text-muted-foreground">You have reached the end of the feed.</p>}
      </section>

      <NewsletterSignup />
    </Layout>
  );
};

export default Index;
