import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ArticleCard from "@/components/news/ArticleCard";
import NewsletterSignup from "@/components/news/NewsletterSignup";
import { supabase } from "@/integrations/supabase/client";
import { articles as mockArticles, categories } from "@/lib/mockData";
import { type Article } from "@/lib/mockData";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Index = () => {
  const [dbArticles, setDbArticles] = useState<Article[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await (supabase as any)
        .from("articles")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(20);

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
          isImportant: a.is_important || false,
          showInHero: a.show_in_hero || false,
        }));
        setDbArticles(mapped);
      }
    };

    fetchArticles();

    const channel = supabase
      .channel("homepage-articles")
      .on("postgres_changes", { event: "*", schema: "public", table: "articles" }, () => {
        fetchArticles();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Merge: DB articles first, then mock as fallback
  const allArticles = dbArticles.length > 0 ? [...dbArticles, ...mockArticles] : mockArticles;

  // Hero slideshow: only important articles marked for hero
  const heroArticles = allArticles.filter((a: any) => a.showInHero || (a.isImportant && a.isFeatured));
  const heroSlides = heroArticles.length > 0 ? heroArticles.slice(0, 5) : [allArticles[0]].filter(Boolean);

  // Auto-advance hero slideshow
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const currentHero = heroSlides[heroIndex] || allArticles[0];

  const featuredArticles = allArticles.filter((a) => a.isFeatured && a.id !== currentHero?.id).slice(0, 2);
  const trendingArticles = allArticles.filter((a) => a.isTrending).slice(0, 5);
  const latestArticles = allArticles.filter((a) => a.id !== currentHero?.id).slice(0, 6);

  return (
    <Layout>
      {/* Hero Slideshow */}
      <section className="container py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 border-r-0 lg:border-r border-border lg:pr-8">
            {currentHero && (
              <div className="relative">
                <ArticleCard article={currentHero} variant="hero" />
                {heroSlides.length > 1 && (
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-1">
                      {heroSlides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setHeroIndex(i)}
                          className={`h-1.5 rounded-full transition-all ${
                            i === heroIndex ? "w-6 bg-foreground" : "w-1.5 bg-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="lg:col-span-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 pb-2 border-b border-border">
              Trending Now
            </h2>
            <div className="space-y-0">
              {trendingArticles.map((a, i) => (
                <div key={a.id} className="flex gap-3 items-start card-editorial py-4">
                  <span className="font-serif text-3xl font-bold text-muted-foreground/30 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Link to={`/article/${a.id}`} className="group flex-1">
                    <span className="category-tag text-[10px] mb-1 block">{a.category}</span>
                    <h3 className="text-sm font-serif font-semibold leading-snug headline-hover">
                      {a.title}
                    </h3>
                    <span className="meta-text text-xs mt-1 block">{a.readTime}</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container py-8 md:py-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 pb-2 border-b border-border">
            Featured Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container py-8 md:py-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 pb-2 border-b border-border">
            Latest News
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/50">
        <div className="container py-8 md:py-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 pb-2 border-b border-border">
            Explore Sections
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.path}
                to={cat.path}
                className="border border-border bg-background p-4 text-center hover:border-foreground transition-colors group"
              >
                <span className="text-sm font-medium group-hover:text-accent transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <NewsletterSignup />
    </Layout>
  );
};

export default Index;
