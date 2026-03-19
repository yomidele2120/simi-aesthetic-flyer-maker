import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ArticleCard from "@/components/news/ArticleCard";
import { supabase } from "@/integrations/supabase/client";
import { articles as mockArticles, categories, type Article } from "@/lib/mockData";

const CategoryPage = () => {
  const location = useLocation();
  const category = location.pathname.replace("/", "");
  const [dbArticles, setDbArticles] = useState<Article[]>([]);

  const categoryMap: Record<string, string> = {
    nigeria: "Nigeria",
    world: "World",
    business: "Business & Economy",
    "business-economy": "Business & Economy",
    technology: "Technology",
    science: "Science",
    health: "Health",
    entertainment: "Entertainment",
    investigations: "Investigations",
    opinions: "Opinions",
    videos: "Videos",
    sports: "Sports",
    politics: "Politics",
  };

  const categoryName = categoryMap[category || ""] || category || "";
  const categoryInfo = categories.find((c) => c.name === categoryName);

  useEffect(() => {
    const fetchArticles = async () => {
      let query = supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(50);

      if (categoryName === "Videos") {
        query = query.or("category.ilike.%video%,title.ilike.%video%,content.ilike.%video%");
      } else {
        query = query.ilike("category", categoryName);
      }

      const { data } = await query;

      if (data && data.length > 0) {
        setDbArticles(
          data.map((a) => ({
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
      }
    };
    fetchArticles();
  }, [categoryName]);

  const mockFiltered = mockArticles.filter(
    (a) => a.category.toLowerCase() === categoryName.toLowerCase()
  );
  const allArticles = dbArticles.length > 0 ? [...dbArticles, ...mockFiltered] : mockFiltered;

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="border-b border-border pb-6 mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold">{categoryName}</h1>
          {categoryInfo?.subcategories && categoryInfo.subcategories.length > 0 && (
            <div className="flex gap-4 mt-4 flex-wrap">
              {categoryInfo.subcategories.map((sub) => (
                <span key={sub} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                  {sub}
                </span>
              ))}
            </div>
          )}
        </div>

        {allArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-16">
            No articles in this section yet. Check back soon.
          </p>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;
