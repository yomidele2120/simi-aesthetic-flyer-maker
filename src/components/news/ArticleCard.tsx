import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { type Article } from "@/lib/mockData";

type Props = {
  article: Article;
  variant?: "default" | "compact" | "hero";
};

const ArticleCard = ({ article, variant = "default" }: Props) => {
  const renderImage = (className: string) => {
    if (article.imageUrl) {
      return <img src={article.imageUrl} alt={article.title} className={`${className} object-cover`} loading="lazy" />;
    }
    return (
      <div className={`${className} bg-gradient-to-br from-muted to-border flex items-center justify-center`}>
        <span className="text-muted-foreground text-xs">Image</span>
      </div>
    );
  };

  if (variant === "compact") {
    return (
      <motion.div whileHover={{ x: 4 }} className="card-editorial">
        <Link to={`/article/${article.id}`}>
          <span className="category-tag mb-1 block">{article.category}</span>
          <h3 className="text-lg font-serif font-semibold leading-tight headline-hover">{article.title}</h3>
          <p className="meta-text mt-1">{article.readTime} read · {article.date}</p>
        </Link>
      </motion.div>
    );
  }

  if (variant === "hero") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="group cursor-pointer">
        <Link to={`/article/${article.id}`}>
          <div className="aspect-[16/9] bg-muted mb-4 overflow-hidden">
            {renderImage("w-full h-full")}
          </div>
          <span className="category-tag mb-2 block">{article.category}</span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight headline-hover">{article.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">{article.summary}</p>
          <div className="mt-3 flex items-center gap-2 meta-text">
            <span className="font-medium text-foreground">{article.author}</span>
            <span>·</span>
            <span>{article.readTime} read</span>
            <span>·</span>
            <span>{article.date}</span>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="card-editorial">
      <Link to={`/article/${article.id}`}>
        <div className="aspect-[16/9] bg-muted mb-3 overflow-hidden">
          {renderImage("w-full h-full")}
        </div>
        {article.isOpinion && <span className="text-xs font-bold uppercase tracking-widest text-accent mb-1 block">Opinion</span>}
        <span className="category-tag mb-1 block">{article.category}</span>
        <h3 className="text-xl font-serif font-semibold leading-tight headline-hover">{article.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{article.summary}</p>
        <div className="mt-2 flex items-center gap-2 meta-text">
          <span>{article.author}</span>
          <span>·</span>
          <span>{article.readTime}</span>
        </div>
      </Link>
    </motion.div>
  );
};

export default ArticleCard;
