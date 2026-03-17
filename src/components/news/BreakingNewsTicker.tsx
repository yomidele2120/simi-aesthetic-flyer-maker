import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { breakingNews as mockBreaking } from "@/lib/mockData";

type BreakingItem = {
  id: string;
  title: string;
};

const BreakingNewsTicker = () => {
  const [items, setItems] = useState<BreakingItem[]>([]);

  useEffect(() => {
    const fetchBreaking = async () => {
      const { data } = await supabase
        .from("articles")
        .select("id, title")
        .eq("status", "published")
        .eq("is_breaking", true)
        .order("published_at", { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        setItems(data);
      } else {
        // Fallback to mock
        setItems(mockBreaking.map((t, i) => ({ id: `mock-${i}`, title: t })));
      }
    };

    fetchBreaking();

    const channel = supabase
      .channel("breaking-ticker")
      .on("postgres_changes", { event: "*", schema: "public", table: "articles" }, () => {
        fetchBreaking();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const doubled = [...items, ...items];

  if (items.length === 0) return null;

  return (
    <div className="ticker-bar">
      <div className="flex-shrink-0 px-4 font-bold text-xs uppercase tracking-widest border-r border-primary-foreground/20 mr-4">
        Breaking
      </div>
      <div className="overflow-hidden flex-1 relative">
        <div className="flex whitespace-nowrap animate-ticker-scroll">
          {doubled.map((item, i) => (
            <span key={`${item.id}-${i}`} className="text-sm font-medium mx-8 inline-block">
              {item.id.startsWith("mock-") ? (
                item.title
              ) : (
                <Link to={`/article/${item.id}`} className="hover:underline">
                  {item.title}
                </Link>
              )}
              <span className="mx-8 text-primary-foreground/40">●</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;
