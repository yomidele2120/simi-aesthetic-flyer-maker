import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  RefreshCw, Sparkles, PenLine, Send, ChevronRight, LogOut, Loader2,
  Upload, Image, X, Edit3, Save, Trash2, Star, Eye, Globe
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

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
  summary: string | null;
  content: string | null;
  category: string;
  author: string | null;
  image_url: string | null;
  published_at: string | null;
  is_breaking: boolean;
  is_featured: boolean;
  is_trending: boolean;
  is_important: boolean;
  show_in_hero: boolean;
  hero_duration_hours: number;
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
  const [isScraping, setIsScraping] = useState(false);

  // Editable fields
  const [editHeadline, setEditHeadline] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [showInHero, setShowInHero] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);

  // Media upload
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit published article
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editArticleData, setEditArticleData] = useState<PublishedArticle | null>(null);

  const fetchSuggestions = async () => {
    const { data } = await (supabase as any)
      .from("ai_suggestions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(20);
    setSuggestions((data as Suggestion[]) || []);
  };

  const fetchPublished = async () => {
    const { data } = await (supabase as any)
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(20);
    setPublishedArticles((data as PublishedArticle[]) || []);
  };

  useEffect(() => {
    fetchSuggestions();
    fetchPublished();
  }, []);

  useEffect(() => {
    if (selectedSuggestion) {
      const s = suggestions.find((x) => x.id === selectedSuggestion);
      if (s) {
        setEditHeadline(s.ai_title || s.original_title);
        setEditCategory(s.category || "Nigeria");
        setEditContent(s.ai_content || s.original_summary || "");
        setEditSummary(s.ai_summary || s.original_summary || "");
        setUploadedMediaUrl(s.image_url || null);
        setIsImportant(false);
        setShowInHero(false);
        setIsBreaking(false);
      }
    }
  }, [selectedSuggestion, suggestions]);

  const runDiscovery = async () => {
    setIsDiscovering(true);
    try {
      const { data, error } = await supabase.functions.invoke("news-discovery");
      if (error) throw error;
      toast({ title: "Discovery Complete", description: data?.message || "News fetched." });
      await fetchSuggestions();
    } catch (e: any) {
      toast({ title: "Discovery Error", description: e.message, variant: "destructive" });
    } finally {
      setIsDiscovering(false);
    }
  };

  const scrapeContent = async () => {
    const s = suggestions.find((x) => x.id === selectedSuggestion);
    if (!s?.source_url) return;
    setIsScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke("firecrawl-scrape", {
        body: { url: s.source_url },
      });
      if (error) throw error;
      const markdown = data?.data?.markdown || data?.markdown;
      if (markdown) {
        setEditContent(markdown);
        toast({ title: "Content Extracted", description: "Full article content loaded." });
      } else {
        toast({ title: "No Content", description: "Could not extract content.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Scrape Error", description: e.message, variant: "destructive" });
    } finally {
      setIsScraping(false);
    }
  };

  const aiRewrite = async () => {
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

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage
        .from("article-media")
        .upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("article-media").getPublicUrl(data.path);
      setUploadedMediaUrl(urlData.publicUrl);
      toast({ title: "Media Uploaded" });
    } catch (e: any) {
      toast({ title: "Upload Error", description: e.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const publishStory = async () => {
    if (!uploadedMediaUrl) {
      toast({ title: "Media Required", description: "Please upload a featured image before publishing.", variant: "destructive" });
      return;
    }
    const s = suggestions.find((x) => x.id === selectedSuggestion);
    if (!s) return;
    setIsPublishing(true);
    try {
      const { error: insertError } = await (supabase as any).from("articles").insert({
        title: editHeadline,
        summary: editSummary,
        content: editContent,
        category: editCategory,
        image_url: uploadedMediaUrl,
        source_url: s.source_url,
        source_name: s.source_name,
        status: "published",
        published_at: new Date().toISOString(),
        is_important: isImportant,
        show_in_hero: showInHero,
        is_breaking: isBreaking,
      });
      if (insertError) throw insertError;

      await (supabase as any).from("ai_suggestions").update({ status: "published" }).eq("id", s.id);

      toast({ title: "Story Published!", description: "Article is now live." });
      setSelectedSuggestion(null);
      setUploadedMediaUrl(null);
      await Promise.all([fetchSuggestions(), fetchPublished()]);
    } catch (e: any) {
      toast({ title: "Publish Error", description: e.message, variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  const rejectStory = async () => {
    const s = suggestions.find((x) => x.id === selectedSuggestion);
    if (!s) return;
    await (supabase as any).from("ai_suggestions").update({ status: "rejected" }).eq("id", s.id);
    toast({ title: "Story Rejected" });
    setSelectedSuggestion(null);
    fetchSuggestions();
  };

  const saveDraft = async () => {
    const s = suggestions.find((x) => x.id === selectedSuggestion);
    if (!s) return;
    try {
      const { error } = await (supabase as any).from("articles").insert({
        title: editHeadline,
        summary: editSummary,
        content: editContent,
        category: editCategory,
        image_url: uploadedMediaUrl || s.image_url,
        source_url: s.source_url,
        source_name: s.source_name,
        status: "draft",
        is_important: isImportant,
        show_in_hero: showInHero,
        is_breaking: isBreaking,
      });
      if (error) throw error;
      await (supabase as any).from("ai_suggestions").update({ status: "draft" }).eq("id", s.id);
      toast({ title: "Saved as Draft" });
      setSelectedSuggestion(null);
      fetchSuggestions();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  // Edit published article
  const startEditArticle = (article: PublishedArticle) => {
    setEditingArticleId(article.id);
    setEditArticleData({ ...article });
  };

  const saveEditedArticle = async () => {
    if (!editArticleData) return;
    try {
      const { error } = await (supabase as any).from("articles").update({
        title: editArticleData.title,
        summary: editArticleData.summary,
        content: editArticleData.content,
        category: editArticleData.category,
        image_url: editArticleData.image_url,
        is_breaking: editArticleData.is_breaking,
        is_featured: editArticleData.is_featured,
        is_trending: editArticleData.is_trending,
        is_important: editArticleData.is_important,
        show_in_hero: editArticleData.show_in_hero,
        hero_duration_hours: editArticleData.hero_duration_hours,
        updated_at: new Date().toISOString(),
      }).eq("id", editArticleData.id);
      if (error) throw error;
      toast({ title: "Article Updated" });
      setEditingArticleId(null);
      setEditArticleData(null);
      fetchPublished();
    } catch (e: any) {
      toast({ title: "Update Error", description: e.message, variant: "destructive" });
    }
  };

  const handleEditMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editArticleData) return;
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage.from("article-media").upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("article-media").getPublicUrl(data.path);
      setEditArticleData({ ...editArticleData, image_url: urlData.publicUrl });
    } catch (e: any) {
      toast({ title: "Upload Error", description: e.message, variant: "destructive" });
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
                        {s.confidence}%
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
                    <button onClick={generateHeadlines} disabled={isGeneratingHeadlines} className="ghost-button flex items-center gap-2 text-xs">
                      {isGeneratingHeadlines ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      Headlines
                    </button>
                    <button onClick={aiRewrite} disabled={isRewriting} className="ghost-button flex items-center gap-2 text-xs">
                      {isRewriting ? <Loader2 className="h-3 w-3 animate-spin" /> : <PenLine className="h-3 w-3" />}
                      AI Rewrite
                    </button>
                    {selected.source_url && (
                      <button onClick={scrapeContent} disabled={isScraping} className="ghost-button flex items-center gap-2 text-xs">
                        {isScraping ? <Loader2 className="h-3 w-3 animate-spin" /> : <Globe className="h-3 w-3" />}
                        Extract Content
                      </button>
                    )}
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

                    {/* Media Upload */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                        Featured Image <span className="text-red-500">*</span>
                      </label>
                      {uploadedMediaUrl ? (
                        <div className="relative">
                          <img src={uploadedMediaUrl} alt="Featured" className="w-full h-48 object-cover border border-border" />
                          <button
                            onClick={() => setUploadedMediaUrl(null)}
                            className="absolute top-2 right-2 bg-background/80 p-1 rounded hover:bg-background"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full border-2 border-dashed border-border p-8 text-center hover:border-foreground transition-colors"
                        >
                          {isUploading ? (
                            <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Click to upload image (JPG, PNG, WEBP)</p>
                            </>
                          )}
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleMediaUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Hero & Importance Settings */}
                    <div className="p-4 border border-border bg-muted/30 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Story Settings</p>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Mark as Important</label>
                        <Switch checked={isImportant} onCheckedChange={setIsImportant} />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Show in Hero Slideshow</label>
                        <Switch checked={showInHero} onCheckedChange={setShowInHero} />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Breaking News</label>
                        <Switch checked={isBreaking} onCheckedChange={setIsBreaking} />
                      </div>
                    </div>

                    {selected.source_url && (
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">Source</label>
                        <a href={selected.source_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                          {selected.source_name} →
                        </a>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={publishStory}
                        disabled={isPublishing}
                        className="bg-foreground text-background px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Publish
                      </button>
                      <button onClick={saveDraft} className="ghost-button flex items-center gap-2 text-sm">
                        <Save className="h-4 w-4" /> Save Draft
                      </button>
                      <button onClick={rejectStory} className="ghost-button flex items-center gap-2 text-sm text-red-600">
                        <Trash2 className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px] text-muted-foreground">
                  <div className="text-center">
                    <ChevronRight className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Select a story to begin editing</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "published" && (
          <div className="space-y-0">
            {publishedArticles.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No published stories yet.</p>
              </div>
            )}
            {publishedArticles.map((a) => (
              <div key={a.id} className="border-b border-border py-4">
                {editingArticleId === a.id && editArticleData ? (
                  <div className="space-y-3">
                    <input
                      value={editArticleData.title}
                      onChange={(e) => setEditArticleData({ ...editArticleData, title: e.target.value })}
                      className="w-full border border-border px-3 py-2 text-sm font-serif font-semibold bg-background"
                    />
                    <textarea
                      value={editArticleData.summary || ""}
                      onChange={(e) => setEditArticleData({ ...editArticleData, summary: e.target.value })}
                      rows={2}
                      className="w-full border border-border px-3 py-2 text-sm bg-background resize-none"
                    />
                    <textarea
                      value={editArticleData.content || ""}
                      onChange={(e) => setEditArticleData({ ...editArticleData, content: e.target.value })}
                      rows={6}
                      className="w-full border border-border px-3 py-2 text-sm bg-background resize-none"
                    />
                    <select
                      value={editArticleData.category}
                      onChange={(e) => setEditArticleData({ ...editArticleData, category: e.target.value })}
                      className="border border-border px-3 py-2 text-sm bg-background"
                    >
                      <option>Nigeria</option>
                      <option>World</option>
                      <option>Business & Economy</option>
                      <option>Technology</option>
                      <option>Investigations</option>
                      <option>Opinions</option>
                    </select>
                    {editArticleData.image_url && (
                      <img src={editArticleData.image_url} alt="" className="w-32 h-20 object-cover border border-border" />
                    )}
                    <div>
                      <input type="file" accept="image/*" onChange={handleEditMediaUpload} className="text-xs" />
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <label className="flex items-center gap-2 text-xs">
                        <Switch checked={editArticleData.is_breaking} onCheckedChange={(v) => setEditArticleData({ ...editArticleData, is_breaking: v })} />
                        Breaking
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <Switch checked={editArticleData.is_important} onCheckedChange={(v) => setEditArticleData({ ...editArticleData, is_important: v })} />
                        Important
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <Switch checked={editArticleData.show_in_hero} onCheckedChange={(v) => setEditArticleData({ ...editArticleData, show_in_hero: v })} />
                        Hero
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <Switch checked={editArticleData.is_trending} onCheckedChange={(v) => setEditArticleData({ ...editArticleData, is_trending: v })} />
                        Trending
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveEditedArticle} className="bg-foreground text-background px-4 py-2 text-xs font-bold uppercase flex items-center gap-2">
                        <Save className="h-3 w-3" /> Save
                      </button>
                      <button onClick={() => { setEditingArticleId(null); setEditArticleData(null); }} className="ghost-button text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="category-tag text-[10px]">{a.category}</span>
                        {a.is_breaking && <span className="text-[10px] font-bold text-red-600">BREAKING</span>}
                        {a.is_important && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                        {a.show_in_hero && <Eye className="h-3 w-3 text-blue-500" />}
                      </div>
                      <h3 className="text-sm font-serif font-semibold">{a.title}</h3>
                      <p className="meta-text text-xs mt-1">
                        {a.author} · {a.published_at ? new Date(a.published_at).toLocaleDateString() : ""}
                      </p>
                    </div>
                    <button onClick={() => startEditArticle(a)} className="ghost-button flex items-center gap-1 text-xs ml-4">
                      <Edit3 className="h-3 w-3" /> Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
