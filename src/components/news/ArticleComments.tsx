import { useState, useEffect } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  user_id: string;
  status: string;
}

interface ArticleCommentsProps {
  articleId: string;
}

const ArticleComments = ({ articleId }: ArticleCommentsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("article_comments")
      .select("*")
      .eq("article_id", articleId)
      .order("created_at", { ascending: true });
    if (data) setComments(data as Comment[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to comment.", variant: "destructive" });
      return;
    }
    const trimmed = newComment.trim();
    if (!trimmed || trimmed.length > 2000) {
      toast({ title: "Invalid comment", description: "Comment must be between 1 and 2000 characters.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const authorName = user.email?.split("@")[0] || "Anonymous";
    const { error } = await supabase.from("article_comments").insert({
      article_id: articleId,
      user_id: user.id,
      author_name: authorName,
      content: trimmed,
    });

    if (error) {
      toast({ title: "Error", description: "Could not post comment.", variant: "destructive" });
    } else {
      setNewComment("");
      toast({ title: "Comment posted" });
      fetchComments();
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase.from("article_comments").delete().eq("id", commentId);
    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast({ title: "Comment deleted" });
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="mt-8 border-t border-border pt-6">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
        <MessageSquare className="h-4 w-4" />
        Comments ({comments.length})
      </h3>

      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[80px] resize-none bg-muted/50 border-border focus:border-primary"
            maxLength={2000}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">{newComment.length}/2000</span>
            <Button type="submit" size="sm" disabled={submitting || !newComment.trim()} className="gap-1">
              <Send className="h-3 w-3" />
              {submitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="mb-6 text-sm text-muted-foreground italic">
          Sign in to join the conversation.
        </p>
      )}

      {/* Comments list */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-border pb-4 last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{comment.author_name}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                </div>
                {user && user.id === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-sm text-foreground/85 leading-relaxed">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticleComments;
