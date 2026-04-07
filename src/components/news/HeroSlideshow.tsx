import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Article } from "@/lib/mockData";

type Props = {
  articles: Article[];
};

const HeroSlideshow = ({ articles }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  }, [articles.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  }, [articles.length]);

  useEffect(() => {
    if (articles.length <= 1) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [articles.length, goNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  if (articles.length === 0) return null;

  const article = articles[currentIndex];

  return (
    <div
      className="relative overflow-hidden bg-foreground text-background"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={article.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="aspect-[16/9] md:aspect-[21/9] relative">
            {article.imageUrl ? (
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-foreground to-foreground/80" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-10">
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">
                {article.isBreaking ? "🔴 Breaking News" : article.category}
              </span>
              <Link to={`/article/${article.id}`}>
                <h2 className="font-serif text-xl md:text-3xl lg:text-5xl font-bold leading-tight max-w-4xl hover:underline decoration-primary underline-offset-4">
                  {article.viralHeadline || article.title}
                </h2>
              </Link>
              <div className="mt-2 flex items-center gap-2 text-xs text-background/50">
                <span>{article.author}</span>
                <span>·</span>
                <span>{article.readTime} read</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {articles.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-background/20 hover:bg-background/40 rounded-full transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5 text-background" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-background/20 hover:bg-background/40 rounded-full transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5 text-background" />
          </button>
          <div className="absolute bottom-3 right-5 md:right-10 flex gap-1.5">
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
