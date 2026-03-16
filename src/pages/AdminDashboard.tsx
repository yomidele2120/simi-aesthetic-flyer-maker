import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { RefreshCw, Sparkles, PenLine, Send, ChevronRight, LogOut, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Suggestion = {
  id: string;
  original_title: string;
  original_summary: string | null;
  ai_title: string | null;
  ai_summary: string | null;
  ai_content: string | null;
  ai_headlines: any;
  source_name: string | null;
  source_url: string | null;
  image_url: string | null;
  category: string | null;
  confidence: number | null;
  status: string | null;
  created_at: string | null;
};

type PublishedArticle = {
  id: string;
  title: string;
  category: string;
  author: string | null;
  published_at: string | null;
};

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [publishedArticles, setPublishedArticles] = useState<PublishedArticle[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pulse" | "published">("pulse");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isGeneratingHeadlines, setIsGeneratingHeadlines] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Editable fields
  const [editHeadline, setEditHeadline] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSummary, setEditSummary] = useState("");

  const fetchSuggestions = async () => {
    const { data } = await supabase
      .from("ai_suggestions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(20);
    setSuggestions((data as Suggestion[]) || []);
  };

  const fetchPublished = async () => {
    const { data } = await supabase
      .from("articles")
      .select("id, title, category, author, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(20);
    setPublishedArticles((data as PublishedArticle[]) || []);
  };

  useEffect(() => {
    fetchSuggestions();
    fetchPublished();
  }, []);

  // When selecting a suggestion, populate editor
  useEffect(() => {
    if (selectedSuggestion) {
      const s = suggestions.find((x) => x.id === selectedSuggestion);
      if (s) {
        setEditHeadline(s.ai_title || s.original_title);
        setEditCategory(s.category || "Nigeria");
        setEditContent(s.ai_content || s.original_summary || "");
        setEditSummary(s.ai_summary || s.original_summary || "");
      }
    }
  }, [selectedSuggestion, suggestions]);

  const runDiscovery = async () => {
    setIsDiscovering(true);
    try {
      const { data, error } = await supabase.functions.invoke("news-discovery");
      if (error) throw error;
      toast({ title: "Discovery Complete", description: data?.message || "News fetched successfully." });
      await fetchSuggestions();
    } catch (e: any) {
      toast({ title: "Discovery Error", description: e.message, variant: "destructive" });
    } finally {
      setIsDiscovering(false);
    }
  };

  const aiRewrite = async () => {
    const s = suggestions.find((x) => x.id === selectedSuggestion);
    if (!s) return;
    setIsRewriting(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-rewrite", {
        body: { action: "rewrite", title: editHeadline, summary: editSummary, content: editContent },
      });
      if (error) throw error;
      setEditContent(data.result);
      toast({ title: "Article Rewritten" });
    } catch (e: any) {
      toast({ title: "Rewrite Error", description: e.message, variant: "destructive" });
    } finally {
      setIsRewriting(false);
    }
  };

  const generateHeadlines = async () => {
    setIsGeneratingHeadlines(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-rewrite", {
        body: { action: "headlines", title: editHeadline, summary: editSummary },
      });
      if (error) throw error;
      const headlines = Array.isArray(data.result) ? data.result : [data.result];
      // Update the suggestion's ai_headlines locally
      setSuggestions((prev) =>
        prev.map((s) => (s.id === selectedSuggestion ? { ...s, ai_headlines: headlines } : s))
      );
      toast({ title: "Headlines Generated", description: `${headlines.length} headlines ready.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsGeneratingHeadlines(false);
    }
  };

  const publishStory = async () => {
    const s = suggestions.find((x) => x.id === selectedSuggestion);
    if (!s) return;
    setIsPublishing(true);
    try {
      // Insert into articles
      const { error: insertError } = await supabase.from("articles").insert({
        title: editHeadline,
        summary: editSummary,
        content: editContent,
        category: editCategory,
        image_url: s.image_url,
        source_url: s.source_url,
        source_name: s.source_name,
        status: "published",
        published_at: new Date().toISOString(),
      });
      if (insertError) throw insertError;

      // Mark suggestion as published
      await supabase.from("ai_suggestions").update({ status: "published" }).eq("id", s.id);

      toast({ title: "Story Published!", description: "Article is now live on the site." });
      setSelectedSuggestion(null);
      await Promise.all([fetchSuggestions(), fetchPublished()]);
    } catch (e: any) {
      toast({ title: "Publish Error", description: e.message, variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  const selected = suggestions.find((s) => s.id === selectedSuggestion);
  const headlines = selected?.ai_headlines;
  const headlinesList = Array.isArray(headlines) ? headlines : [];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-serif text-xl font-bold">
              Core<span className="text-primary">News</span>
            </Link>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-l border-border pl-4">
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Site
            </Link>
            <button onClick={signOut} className="ghost-button flex items-center gap-2 text-xs">
              <LogOut className="h-3 w-3" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="flex gap-1 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("pulse")}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "pulse" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI News Pulse
            </span>
          </button>
          <button
            onClick={() => setActiveTab("published")}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "published" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            Published Stories ({publishedArticles.length})
          </button>
        </div>

        {activeTab === "pulse" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  AI Suggestions ({suggestions.length})
                </h2>
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-2 w-2 rounded-full bg-green-500"
                  />
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              </div>

              {suggestions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm mb-4">No suggestions yet. Run discovery to fetch news.</p>
                </div>
              )}

              <div className="space-y-0 max-h-[600px] overflow-y-auto">
                {suggestions.map((s) => (
                  <motion.div
                    key={s.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setSelectedSuggestion(s.id)}
                    className={`border-b border-border py-4 cursor-pointer transition-colors ${
                      selectedSuggestion === s.id ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="category-tag text-[10px]">{s.category}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          (s.confidence || 0) >= 90
                            ? "bg-green-100 text-green-800"
                            : (s.confidence || 0) >= 80
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {s.confidence}% confidence
                      </span>
                    </div>
                    <h3 className="text-sm font-serif font-semibold leading-snug">
                      {s.ai_title || s.original_title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {s.ai_summary || s.original_summary}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">Source: {s.source_name}</p>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={runDiscovery}
                disabled={isDiscovering}
                className="ghost-button mt-4 w-full flex items-center justify-center gap-2"
              >
                {isDiscovering ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                {isDiscovering ? "Discovering..." : "Run AI Discovery"}
              </button>
            </div>

            <div className="lg:col-span-7 border-l-0 lg:border-l border-border lg:pl-8">
              {selected ? (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 pb-2 border-b border-border">
                    Story Editor
                  </h2>

                  {/* AI generated headlines */}
                  {headlinesList.length > 0 && (
                    <div className="mb-4 p-3 bg-muted/50 border border-border">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        AI Headlines (click to use)
                      </p>
                      <div className="space-y-1">
                        {headlinesList.map((h: string, i: number) => (
                          <button
                            key={i}
                            onClick={() => setEditHeadline(h)}
                            className="block text-left text-sm hover:text-primary transition-colors w-full"
                          >
                            {i + 1}. {h}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mb-6 flex-wrap">
                    <button
                      onClick={generateHeadlines}
                      disabled={isGeneratingHeadlines}
                      className="ghost-button flex items-center gap-2 text-xs"
                    >
                      {isGeneratingHeadlines ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      Generate Headlines
                    </button>
                    <button
                      onClick={aiRewrite}
                      disabled={isRewriting}
                      className="ghost-button flex items-center gap-2 text-xs"
                    >
                      {isRewriting ? <Loader2 className="h-3 w-3 animate-spin" /> : <PenLine className="h-3 w-3" />}
                      Journalistic Rewrite
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">Headline</label>
                      <input
                        value={editHeadline}
                        onChange={(e) => setEditHeadline(e.target.value)}
                        className="w-full border border-border px-3 py-2 text-sm font-serif font-semibold focus:outline-none focus:border-foreground transition-colors bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background"
                      >
                        <option>Nigeria</option>
                        <option>World</option>
                        <option>Business & Economy</option>
                        <option>Technology</option>
                        <option>Investigations</option>
                        <option>Opinions</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">Summary</label>
                      <textarea
                        rows={3}
                        value={editSummary}
                        onChange={(e) => setEditSummary(e.target.value)}
                        className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background resize-none leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">Article Body</label>
                      <textarea
                        rows={10}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background resize-none leading-relaxed"
                      />
                    </div>
                    {selected.source_url && (
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">Source</label>
                        <a href={selected.source_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                          {selected.source_name} →
                        </a>
                      </div>
                    )}
                    <button
                      onClick={publishStory}
                      disabled={isPublishing}
                      className="bg-foreground text-background px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {isPublishing ? "Publishing..." : "Publish Story"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px] text-muted-foreground">
                  <div className="text-center">
                    <ChevronRight className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Select a story suggestion to begin editing</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "published" && (
          <div className="space-y-0">
            {publishedArticles.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-12">No published articles yet.</p>
            )}
            {publishedArticles.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-border py-4">
                <div className="flex-1">
                  <span className="category-tag text-[10px] mb-1 block">{a.category}</span>
                  <h3 className="text-sm font-serif font-semibold">{a.title}</h3>
                  <span className="meta-text text-xs">
                    {a.author} · {a.published_at ? new Date(a.published_at).toLocaleDateString() : "Draft"}
                  </span>
                </div>
                <Link to={`/article/${a.id}`} className="ghost-button text-xs ml-4">
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
