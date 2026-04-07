import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Article } from "@/lib/mockData";

type Props = {
  articles: Article[];
};

const HeroSlideshow = ({ articles }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (articles.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [articles.length]);

  if (articles.length === 0) return null;

  const article = articles[currentIndex];

  return (
    <div className="relative overflow-hidden bg-foreground text-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={article.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <Link to={`/article/${article.id}`} className="block">
            <div className="aspect-[21/9] md:aspect-[3/1] relative">
              {article.imageUrl ? (
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-foreground to-foreground/80" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">
                  {article.isBreaking ? "Breaking News" : article.category}
                </span>
                <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-4xl">
                  {article.viralHeadline || article.title}
                </h2>
                <p className="mt-3 text-sm md:text-base text-background/70 max-w-2xl line-clamp-2">
                  {article.summary}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-background/50">
                  <span>{article.author}</span>
                  <span>·</span>
                  <span>{article.readTime} read</span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {articles.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/20 hover:bg-background/40 rounded transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5 text-background" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % articles.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/20 hover:bg-background/40 rounded transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5 text-background" />
          </button>
          <div className="absolute bottom-3 right-6 md:right-12 flex gap-1.5">
            {articles.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-background/40"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSlideshow;
