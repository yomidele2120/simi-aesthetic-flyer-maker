import { breakingNews } from "@/lib/mockData";

const BreakingNewsTicker = () => {
  const items = [...breakingNews, ...breakingNews];

  return (
    <div className="ticker-bar">
      <div className="flex-shrink-0 px-4 font-bold text-xs uppercase tracking-widest border-r border-primary-foreground/20 mr-4">
        Breaking
      </div>
      <div className="overflow-hidden flex-1 relative">
        <div className="flex whitespace-nowrap animate-ticker-scroll">
          {items.map((item, i) => (
            <span key={i} className="text-sm font-medium mx-8 inline-block">
              {item}
              <span className="mx-8 text-primary-foreground/40">●</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;
