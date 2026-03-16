import { useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ArticleCard from "@/components/news/ArticleCard";
import { articles, categories } from "@/lib/mockData";

const CategoryPage = () => {
  const location = useLocation();
  const category = location.pathname.replace("/", "");

  const categoryMap: Record<string, string> = {
    nigeria: "Nigeria",
    world: "World",
    business: "Business & Economy",
    "business-economy": "Business & Economy",
    technology: "Technology",
    investigations: "Investigations",
    opinions: "Opinions",
    videos: "Videos",
  };

  const categoryName = categoryMap[category || ""] || category || "";
  const categoryInfo = categories.find((c) => c.name === categoryName);
  const categoryArticles = articles.filter(
    (a) => a.category.toLowerCase() === categoryName.toLowerCase()
  );

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

        {categoryArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryArticles.map((a) => (
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
