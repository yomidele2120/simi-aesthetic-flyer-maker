import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ArticleLikesProps {
  articleId: string;
}

const ArticleLikes = ({ articleId }: ArticleLikesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLikes = async () => {
      const { count } = await supabase
        .from("article_likes")
        .select("*", { count: "exact", head: true })
        .eq("article_id", articleId);
      setLikeCount(count || 0);

      if (user) {
        const { data } = await supabase
          .from("article_likes")
          .select("id")
          .eq("article_id", articleId)
          .eq("user_id", user.id)
          .maybeSingle();
        setLiked(!!data);
      }
    };
    fetchLikes();
  }, [articleId, user]);

  const toggleLike = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to like articles.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (liked) {
        await supabase.from("article_likes").delete().eq("article_id", articleId).eq("user_id", user.id);
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      } else {
        await supabase.from("article_likes").insert({ article_id: articleId, user_id: user.id });
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    } catch {
      toast({ title: "Error", description: "Could not update like.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-sm border transition-all duration-200",
        liked
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
      )}
      aria-label={liked ? "Unlike this article" : "Like this article"}
    >
      <Heart className={cn("h-4 w-4 transition-all", liked && "fill-primary")} />
      <span className="text-sm font-medium">{likeCount}</span>
    </button>
  );
};

export default ArticleLikes;
