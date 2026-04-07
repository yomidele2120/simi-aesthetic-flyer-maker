import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ArticleCard from "@/components/news/ArticleCard";
import { supabase } from "@/integrations/supabase/client";
import { articles as mockArticles, type Article } from "@/lib/mockData";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [dbArticles, setDbArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetch = async () => {
      if (!query.trim()) return;
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .or(`title.ilike.%${query}%,summary.ilike.%${query}%,category.ilike.%${query}%`)
        .order("published_at", { ascending: false })
        .limit(50);

      if (data) {
        setDbArticles(data.map((a: any) => ({
          id: a.id,
          title: a.title,
          viralHeadline: a.viral_headline || undefined,
          summary: a.summary || "",
          content: a.content || "",
          category: a.category,
          author: a.author || "Frontier Staff",
          date: a.published_at ? new Date(a.published_at).toLocaleDateString() : "",
          imageUrl: a.image_url || "",
          videoUrl: a.video_url || undefined,
          readTime: a.read_time || "5 min",
          isBreaking: a.is_breaking || false,
          isFeatured: a.is_featured || false,
          isTrending: a.is_trending || false,
          isOpinion: a.is_opinion || false,
        })));
      }
    };
    fetch();
  }, [query]);

  const results = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return [];
    const mockResults = mockArticles.filter(
      (a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    );
    const allIds = new Set(dbArticles.map((a) => a.id));
    return [...dbArticles, ...mockResults.filter((a) => !allIds.has(a.id))];
  }, [query, dbArticles]);

  return (
    <Layout>
      <section className="container py-8 md:py-12">
        <h1 className="font-serif text-2xl md:text-3xl font-bold mb-2">
          {query ? `Search results for "${query}"` : "Search Frontier"}
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          {results.length} {results.length === 1 ? "result" : "results"} found
        </p>
        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {results.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : query ? (
          <p className="text-muted-foreground">No articles found matching your search.</p>
        ) : null}
      </section>
    </Layout>
  );
};

export default SearchPage;
