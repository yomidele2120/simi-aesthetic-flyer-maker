import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  RefreshCw, Sparkles, PenLine, Send, ChevronRight, LogOut, Loader2,
  CheckCircle, XCircle, Upload, Link2, Image, Trash2, Eye, Edit3,
  AlertTriangle, Settings, Star, Zap, Archive, Globe
} from "lucide-react";
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
  summary: string | null;
  content: string | null;
  category: string;
  author: string | null;
  published_at: string | null;
  image_url: string | null;
  is_breaking: boolean | null;
  is_featured: boolean | null;
  is_trending: boolean | null;
  hero_enabled: boolean | null;
  tags: string[] | null;
  importance_score: number | null;
};

type ApiStatus = {
  name: string;
  envKey: string;
  connected: boolean;
};

type MediaItem = {
  url: string;
  type: "image" | "video" | "youtube";
  isFeatured: boolean;
};

const CATEGORIES = ["Nigeria", "World", "Business & Economy", "Technology", "Investigations", "Opinions", "Sports", "Politics", "Science", "Health", "Entertainment"];

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [publishedArticles, setPublishedArticles] = useState<PublishedArticle[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pulse" | "published" | "create" | "api-status">("pulse");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isGeneratingHeadlines, setIsGeneratingHeadlines] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([]);

  // Editable fields
  const [editHeadline, setEditHeadline] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editIsBreaking, setEditIsBreaking] = useState(false);
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editHeroEnabled, setEditHeroEnabled] = useState(false);
  const [editHeroDuration, setEditHeroDuration] = useState("24");
  const [editImportance, setEditImportance] = useState(50);

  // Media
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit published article mode
  const [editingPublishedId, setEditingPublishedId] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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
      .select("id, title, summary, content, category, author, published_at, image_url, is_breaking, is_featured, is_trending, hero_enabled, tags, importance_score")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50);
    setPublishedArticles((data as PublishedArticle[]) || []);
  };

  const fetchApiStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("api-status");
      if (!error && data?.statuses) {
        setApiStatuses(data.statuses);
      }
    } catch (e) {
      console.error("Failed to fetch API status:", e);
    }
  };

  useEffect(() => {
    fetchSuggestions();
    fetchPublished();
    fetchApiStatus();
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
        setEditTags("");
        setEditIsBreaking(false);
        setEditIsFeatured(false);
        setEditHeroEnabled(false);
        setEditImportance(s.confidence || 50);
        setMediaItems(s.image_url ? [{ url: s.image_url, type: "image", isFeatured: true }] : []);
        setEditingPublishedId(null);
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
      if (selectedSuggestion) {
        setSuggestions((prev) =>
          prev.map((s) => (s.id === selectedSuggestion ? { ...s, ai_headlines: headlines } : s))
        );
      }
      toast({ title: "Headlines Generated", description: `${headlines.length} headlines ready.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsGeneratingHeadlines(false);
    }
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const isVideo = ["mp4"].includes(ext || "");
      const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext || "");

      if (!isImage && !isVideo) {
        toast({ title: "Unsupported file", description: `${file.name} is not a supported format.`, variant: "destructive" });
        continue;
      }

      const filePath = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("article-media").upload(filePath, file);

      if (error) {
        toast({ title: "Upload Error", description: error.message, variant: "destructive" });
        continue;
      }

      const { data: publicUrl } = supabase.storage.from("article-media").getPublicUrl(filePath);
      setMediaItems((prev) => [
        ...prev,
        { url: publicUrl.publicUrl, type: isVideo ? "video" : "image", isFeatured: prev.length === 0 },
      ]);
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addMediaUrl = () => {
    if (!mediaUrlInput.trim()) return;
    const url = mediaUrlInput.trim();
    const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
    const isVideo = url.match(/\.(mp4)$/i) || isYoutube;

    setMediaItems((prev) => [
      ...prev,
      { url, type: isYoutube ? "youtube" : isVideo ? "video" : "image", isFeatured: prev.length === 0 },
    ]);
    setMediaUrlInput("");
  };

  const removeMedia = (index: number) => {
    setMediaItems((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((m) => m.isFeatured)) {
        next[0].isFeatured = true;
      }
      return next;
    });
  };

  const setFeatured = (index: number) => {
    setMediaItems((prev) =>
      prev.map((m, i) => ({ ...m, isFeatured: i === index }))
    );
  };

  const publishStory = async () => {
    if (mediaItems.length === 0) {
      toast({ title: "Media Required", description: "Please add at least one image or video before publishing.", variant: "destructive" });
      return;
    }

    setIsPublishing(true);
    try {
      const featuredMedia = mediaItems.find((m) => m.isFeatured) || mediaItems[0];
      const s = selectedSuggestion ? suggestions.find((x) => x.id === selectedSuggestion) : null;

      const heroExpiresAt = editHeroEnabled
        ? new Date(Date.now() + parseInt(editHeroDuration) * 3600 * 1000).toISOString()
        : null;

      const { data: inserted, error: insertError } = await supabase.from("articles").insert({
        title: editHeadline,
        summary: editSummary,
        content: editContent,
        category: editCategory,
        image_url: featuredMedia.url,
        source_url: s?.source_url || null,
        source_name: s?.source_name || null,
        status: "published",
        published_at: new Date().toISOString(),
        is_breaking: editIsBreaking,
        is_featured: editIsFeatured,
        is_trending: false,
        hero_enabled: editHeroEnabled,
        hero_expires_at: heroExpiresAt,
        tags: editTags ? editTags.split(",").map((t) => t.trim()) : [],
        importance_score: editImportance,
      }).select("id").single();

      if (insertError) throw insertError;

      // Save additional media
      if (inserted && mediaItems.length > 1) {
        const mediaRecords = mediaItems.map((m, i) => ({
          article_id: inserted.id,
          media_url: m.url,
          media_type: m.type,
          is_featured: m.isFeatured,
          position: i,
        }));
        await supabase.from("article_media").insert(mediaRecords);
      }

      // Mark suggestion as published
      if (s) {
        await supabase.from("ai_suggestions").update({ status: "published" }).eq("id", s.id);
      }

      toast({ title: "Story Published!", description: "Article is now live on the site." });
      setSelectedSuggestion(null);
      setMediaItems([]);
      await Promise.all([fetchSuggestions(), fetchPublished()]);
    } catch (e: any) {
      toast({ title: "Publish Error", description: e.message, variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  const rejectSuggestion = async () => {
    if (!selectedSuggestion) return;
    await supabase.from("ai_suggestions").update({ status: "rejected" }).eq("id", selectedSuggestion);
    toast({ title: "Suggestion Rejected" });
    setSelectedSuggestion(null);
    await fetchSuggestions();
  };

  const saveDraft = async () => {
    const s = selectedSuggestion ? suggestions.find((x) => x.id === selectedSuggestion) : null;
    const featuredMedia = mediaItems.find((m) => m.isFeatured) || mediaItems[0];

    const { error } = await supabase.from("articles").insert({
      title: editHeadline,
      summary: editSummary,
      content: editContent,
      category: editCategory,
      image_url: featuredMedia?.url || null,
      source_url: s?.source_url || null,
      source_name: s?.source_name || null,
      status: "draft",
      tags: editTags ? editTags.split(",").map((t) => t.trim()) : [],
      importance_score: editImportance,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      if (s) await supabase.from("ai_suggestions").update({ status: "draft" }).eq("id", s.id);
      toast({ title: "Saved as Draft" });
      setSelectedSuggestion(null);
      await fetchSuggestions();
    }
  };

  // Edit published article
  const startEditingPublished = (article: PublishedArticle) => {
    setEditingPublishedId(article.id);
    setEditHeadline(article.title);
    setEditCategory(article.category);
    setEditContent(article.content || "");
    setEditSummary(article.summary || "");
    setEditIsBreaking(article.is_breaking || false);
    setEditIsFeatured(article.is_featured || false);
    setEditHeroEnabled(article.hero_enabled || false);
    setEditImportance(article.importance_score || 50);
    setEditTags(article.tags?.join(", ") || "");
    setMediaItems(article.image_url ? [{ url: article.image_url, type: "image", isFeatured: true }] : []);
    setSelectedSuggestion(null);
    setActiveTab("published");
  };

  const savePublishedEdit = async () => {
    if (!editingPublishedId) return;
    setIsSavingEdit(true);

    const featuredMedia = mediaItems.find((m) => m.isFeatured) || mediaItems[0];
    const heroExpiresAt = editHeroEnabled
      ? new Date(Date.now() + parseInt(editHeroDuration) * 3600 * 1000).toISOString()
      : null;

    const { error } = await supabase
      .from("articles")
      .update({
        title: editHeadline,
        summary: editSummary,
        content: editContent,
        category: editCategory,
        image_url: featuredMedia?.url || null,
        is_breaking: editIsBreaking,
        is_featured: editIsFeatured,
        hero_enabled: editHeroEnabled,
        hero_expires_at: heroExpiresAt,
        tags: editTags ? editTags.split(",").map((t) => t.trim()) : [],
        importance_score: editImportance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingPublishedId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Article Updated", description: "Changes are now live." });
      setEditingPublishedId(null);
      await fetchPublished();
    }
    setIsSavingEdit(false);
  };

  const selected = suggestions.find((s) => s.id === selectedSuggestion);
  const headlines = selected?.ai_headlines;
  const headlinesList = Array.isArray(headlines) ? headlines : [];

  // Shared editor component
  const renderEditor = (mode: "suggestion" | "edit-published") => (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 pb-2 border-b border-border">
        {mode === "edit-published" ? "Edit Published Article" : "Story Editor"}
      </h2>

      {/* AI generated headlines (suggestion mode only) */}
      {mode === "suggestion" && headlinesList.length > 0 && (
        <div className="mb-4 p-3 bg-muted/50 border border-border">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            AI Headlines (click to use)
          </p>
          <div className="space-y-1">
            {headlinesList.map((h: string, i: number) => (
              <button key={i} onClick={() => setEditHeadline(h)} className="block text-left text-sm hover:text-primary transition-colors w-full">
                {i + 1}. {h}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={generateHeadlines} disabled={isGeneratingHeadlines} className="ghost-button flex items-center gap-2 text-xs">
          {isGeneratingHeadlines ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          Generate Headlines
        </button>
        <button onClick={aiRewrite} disabled={isRewriting} className="ghost-button flex items-center gap-2 text-xs">
          {isRewriting ? <Loader2 className="h-3 w-3 animate-spin" /> : <PenLine className="h-3 w-3" />}
          Journalistic Rewrite
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">Headline</label>
          <input value={editHeadline} onChange={(e) => setEditHeadline(e.target.value)}
            className="w-full border border-border px-3 py-2 text-sm font-serif font-semibold focus:outline-none focus:border-foreground transition-colors bg-background" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">Category</label>
            <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">Importance Score</label>
            <input type="number" min={0} max={100} value={editImportance} onChange={(e) => setEditImportance(Number(e.target.value))}
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">Tags (comma separated)</label>
          <input value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="politics, economy, breaking"
            className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">Summary</label>
          <textarea rows={3} value={editSummary} onChange={(e) => setEditSummary(e.target.value)}
            className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background resize-none leading-relaxed" />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">Article Body</label>
          <textarea rows={10} value={editContent} onChange={(e) => setEditContent(e.target.value)}
            className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background resize-none leading-relaxed" />
        </div>

        {/* Article Settings */}
        <div className="p-4 border border-border bg-muted/30">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Article Settings</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={editIsBreaking} onChange={(e) => setEditIsBreaking(e.target.checked)} className="rounded" />
              <Zap className="h-3 w-3 text-destructive" /> Breaking News
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={editIsFeatured} onChange={(e) => setEditIsFeatured(e.target.checked)} className="rounded" />
              <Star className="h-3 w-3 text-yellow-500" /> Featured
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={editHeroEnabled} onChange={(e) => setEditHeroEnabled(e.target.checked)} className="rounded" />
              <Globe className="h-3 w-3 text-accent" /> Hero Section
            </label>
          </div>
          {editHeroEnabled && (
            <div className="mt-3">
              <label className="text-xs text-muted-foreground block mb-1">Hero Duration (hours)</label>
              <select value={editHeroDuration} onChange={(e) => setEditHeroDuration(e.target.value)}
                className="border border-border px-3 py-1.5 text-sm bg-background">
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="72">72 hours</option>
                <option value="168">1 week</option>
              </select>
            </div>
          )}
        </div>

        {/* Media Section */}
        <div className="p-4 border border-border bg-muted/30">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Media {mediaItems.length === 0 && <span className="text-destructive ml-1">(required)</span>}
          </p>

          {/* Media preview */}
          {mediaItems.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {mediaItems.map((m, i) => (
                <div key={i} className={`relative border ${m.isFeatured ? "border-primary" : "border-border"} bg-background overflow-hidden`}>
                  {m.type === "image" ? (
                    <img src={m.url} alt="" className="w-full h-20 object-cover" />
                  ) : (
                    <div className="w-full h-20 flex items-center justify-center bg-muted text-xs text-muted-foreground">
                      {m.type === "youtube" ? "YouTube" : "Video"}
                    </div>
                  )}
                  <div className="absolute top-1 right-1 flex gap-1">
                    {!m.isFeatured && (
                      <button onClick={() => setFeatured(i)} className="bg-background/80 p-0.5 rounded" title="Set as featured">
                        <Star className="h-3 w-3" />
                      </button>
                    )}
                    <button onClick={() => removeMedia(i)} className="bg-background/80 p-0.5 rounded text-destructive" title="Remove">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  {m.isFeatured && (
                    <span className="absolute bottom-0 left-0 right-0 text-[9px] bg-primary text-primary-foreground text-center py-0.5">Featured</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept="image/jpeg,image/png,image/webp,video/mp4" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="ghost-button flex items-center gap-2 text-xs flex-1">
              {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              Upload Files
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            <input value={mediaUrlInput} onChange={(e) => setMediaUrlInput(e.target.value)} placeholder="Paste image/video/YouTube URL"
              className="flex-1 border border-border px-3 py-1.5 text-xs bg-background focus:outline-none focus:border-foreground" />
            <button onClick={addMediaUrl} className="ghost-button text-xs flex items-center gap-1">
              <Link2 className="h-3 w-3" /> Add URL
            </button>
          </div>
        </div>

        {/* Source info (suggestion mode) */}
        {mode === "suggestion" && selected?.source_url && (
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">Source</label>
            <a href={selected.source_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
              {selected.source_name} →
            </a>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 flex-wrap">
          {mode === "suggestion" ? (
            <>
              <button onClick={publishStory} disabled={isPublishing}
                className="bg-foreground text-background px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors flex items-center gap-2 disabled:opacity-50">
                {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isPublishing ? "Publishing..." : "Publish Story"}
              </button>
              <button onClick={saveDraft} className="ghost-button flex items-center gap-2 text-xs">
                <Archive className="h-3 w-3" /> Save as Draft
              </button>
              <button onClick={rejectSuggestion} className="ghost-button flex items-center gap-2 text-xs text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground">
                <XCircle className="h-3 w-3" /> Reject
              </button>
            </>
          ) : (
            <>
              <button onClick={savePublishedEdit} disabled={isSavingEdit}
                className="bg-foreground text-background px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors flex items-center gap-2 disabled:opacity-50">
                {isSavingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setEditingPublishedId(null)} className="ghost-button text-xs">
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Manual story creation
  const [isPublishingManual, setIsPublishingManual] = useState(false);

  const initManualCreate = () => {
    setActiveTab("create");
    setSelectedSuggestion(null);
    setEditingPublishedId(null);
    setEditHeadline("");
    setEditCategory("Nigeria");
    setEditContent("");
    setEditSummary("");
    setEditTags("");
    setEditIsBreaking(false);
    setEditIsFeatured(false);
    setEditHeroEnabled(false);
    setEditImportance(50);
    setMediaItems([]);
  };

  const publishManualStory = async (asDraft = false) => {
    if (!editHeadline.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    if (!asDraft && mediaItems.length === 0) {
      toast({ title: "Media Required", description: "Please add at least one image before publishing.", variant: "destructive" });
      return;
    }

    setIsPublishingManual(true);
    try {
      const featuredMedia = mediaItems.find((m) => m.isFeatured) || mediaItems[0];
      const heroExpiresAt = editHeroEnabled
        ? new Date(Date.now() + parseInt(editHeroDuration) * 3600 * 1000).toISOString()
        : null;

      const { data: inserted, error: insertError } = await supabase.from("articles").insert({
        title: editHeadline,
        summary: editSummary,
        content: editContent,
        category: editCategory,
        image_url: featuredMedia?.url || null,
        status: asDraft ? "draft" : "published",
        published_at: asDraft ? null : new Date().toISOString(),
        is_breaking: editIsBreaking,
        is_featured: editIsFeatured,
        is_trending: false,
        hero_enabled: editHeroEnabled,
        hero_expires_at: heroExpiresAt,
        tags: editTags ? editTags.split(",").map((t) => t.trim()) : [],
        importance_score: editImportance,
        author: "Frontier Staff",
      }).select("id").single();

      if (insertError) throw insertError;

      if (inserted && mediaItems.length > 1) {
        const mediaRecords = mediaItems.map((m, i) => ({
          article_id: inserted.id,
          media_url: m.url,
          media_type: m.type,
          is_featured: m.isFeatured,
          position: i,
        }));
        await supabase.from("article_media").insert(mediaRecords);
      }

      toast({ title: asDraft ? "Saved as Draft" : "Story Published!", description: asDraft ? "Article saved." : "Article is now live." });
      initManualCreate();
      await fetchPublished();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsPublishingManual(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border">
        <div className="container flex items-center justify-between py-3 px-3 md:px-6 gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Link to="/" className="font-serif text-lg md:text-xl font-bold uppercase tracking-tight shrink-0">
              Frontier
            </Link>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground border-l border-border pl-2 md:pl-4 shrink-0">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <Link to="/" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Site
            </Link>
            <button onClick={signOut} className="ghost-button flex items-center gap-1 text-xs px-2 py-1.5 md:px-4 md:py-2">
              <LogOut className="h-3 w-3" /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container py-4 md:py-8 px-3 md:px-6">
        <div className="flex gap-1 mb-6 md:mb-8 border-b border-border overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
          <button
            onClick={() => setActiveTab("pulse")}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "pulse" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI News Pulse
            </span>
          </button>
          <button
            onClick={initManualCreate}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "create" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              <PenLine className="h-4 w-4" />
              Create Story
            </span>
          </button>
          <button
            onClick={() => setActiveTab("published")}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "published" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            Published Stories ({publishedArticles.length})
          </button>
          <button
            onClick={() => { setActiveTab("api-status"); fetchApiStatus(); }}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "api-status" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              API Status
            </span>
          </button>
        </div>

        {/* AI News Pulse Tab */}
        {activeTab === "pulse" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  AI Suggestions ({suggestions.length})
                </h2>
                <div className="flex items-center gap-2">
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
                    className="h-2 w-2 rounded-full bg-green-500" />
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
                  <motion.div key={s.id} whileHover={{ x: 4 }} onClick={() => setSelectedSuggestion(s.id)}
                    className={`border-b border-border py-4 cursor-pointer transition-colors ${
                      selectedSuggestion === s.id ? "bg-muted/50" : ""
                    }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="category-tag text-[10px]">{s.category}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        (s.confidence || 0) >= 90 ? "bg-green-100 text-green-800"
                        : (s.confidence || 0) >= 80 ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                      }`}>
                        {s.confidence}% confidence
                      </span>
                    </div>
                    <h3 className="text-sm font-serif font-semibold leading-snug">{s.ai_title || s.original_title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.ai_summary || s.original_summary}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Source: {s.source_name}</p>
                  </motion.div>
                ))}
              </div>

              <button onClick={runDiscovery} disabled={isDiscovering} className="ghost-button mt-4 w-full flex items-center justify-center gap-2">
                {isDiscovering ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                {isDiscovering ? "Discovering..." : "Run AI Discovery"}
              </button>
            </div>

            <div className="lg:col-span-7 border-l-0 lg:border-l border-border lg:pl-8">
              {selected ? renderEditor("suggestion") : (
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

        {/* Published Stories Tab */}
        {activeTab === "published" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className={editingPublishedId ? "lg:col-span-5" : "lg:col-span-12"}>
              <div className="space-y-0">
                {publishedArticles.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-12">No published articles yet.</p>
                )}
                {publishedArticles.map((a) => (
                  <div key={a.id} className={`flex items-center justify-between border-b border-border py-4 ${editingPublishedId === a.id ? "bg-muted/50" : ""}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="category-tag text-[10px]">{a.category}</span>
                        {a.is_breaking && <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-bold">BREAKING</span>}
                        {a.hero_enabled && <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-bold">HERO</span>}
                      </div>
                      <h3 className="text-sm font-serif font-semibold">{a.title}</h3>
                      <span className="meta-text text-xs">
                        {a.author} · {a.published_at ? new Date(a.published_at).toLocaleDateString() : "Draft"}
                      </span>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => startEditingPublished(a)} className="ghost-button text-xs flex items-center gap-1">
                        <Edit3 className="h-3 w-3" /> Edit
                      </button>
                      <Link to={`/article/${a.id}`} className="ghost-button text-xs flex items-center gap-1">
                        <Eye className="h-3 w-3" /> View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {editingPublishedId && (
              <div className="lg:col-span-7 border-l-0 lg:border-l border-border lg:pl-8">
                {renderEditor("edit-published")}
              </div>
            )}
          </div>
        )}

        {/* Create Story Tab */}
        {activeTab === "create" && (
          <div className="max-w-3xl">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 pb-2 border-b border-border">
              Create Story Manually
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Write and publish a story from scratch without AI assistance.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">Story Title *</label>
                <input value={editHeadline} onChange={(e) => setEditHeadline(e.target.value)}
                  className="w-full border border-border px-3 py-2 text-sm font-serif font-semibold focus:outline-none focus:border-foreground transition-colors bg-background"
                  placeholder="Enter a compelling headline..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">Category</label>
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">Tags (comma separated)</label>
                  <input value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="politics, economy"
                    className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">Story Highlights / Summary</label>
                <textarea rows={3} value={editSummary} onChange={(e) => setEditSummary(e.target.value)}
                  placeholder="A brief summary of the story..."
                  className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background resize-none leading-relaxed" />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">Full Story Content *</label>
                <textarea rows={16} value={editContent} onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Write the full story here. Use double line breaks for paragraphs..."
                  className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background resize-none leading-relaxed" />
              </div>

              {/* Article Settings */}
              <div className="p-4 border border-border bg-muted/30">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Article Settings</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={editIsBreaking} onChange={(e) => setEditIsBreaking(e.target.checked)} className="rounded" />
                    <Zap className="h-3 w-3 text-destructive" /> Breaking News
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={editIsFeatured} onChange={(e) => setEditIsFeatured(e.target.checked)} className="rounded" />
                    <Star className="h-3 w-3 text-yellow-500" /> Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={editHeroEnabled} onChange={(e) => setEditHeroEnabled(e.target.checked)} className="rounded" />
                    <Globe className="h-3 w-3 text-accent" /> Hero Section
                  </label>
                </div>
                {editHeroEnabled && (
                  <div className="mt-3">
                    <label className="text-xs text-muted-foreground block mb-1">Hero Duration (hours)</label>
                    <select value={editHeroDuration} onChange={(e) => setEditHeroDuration(e.target.value)}
                      className="border border-border px-3 py-1.5 text-sm bg-background">
                      <option value="24">24 hours</option>
                      <option value="48">48 hours</option>
                      <option value="72">72 hours</option>
                      <option value="168">1 week</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Media Section */}
              <div className="p-4 border border-border bg-muted/30">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Featured Image & Gallery
                </p>

                {mediaItems.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {mediaItems.map((m, i) => (
                      <div key={i} className={`relative border ${m.isFeatured ? "border-primary" : "border-border"} bg-background overflow-hidden`}>
                        {m.type === "image" ? (
                          <img src={m.url} alt="" className="w-full h-20 object-cover" />
                        ) : (
                          <div className="w-full h-20 flex items-center justify-center bg-muted text-xs text-muted-foreground">
                            {m.type === "youtube" ? "YouTube" : "Video"}
                          </div>
                        )}
                        <div className="absolute top-1 right-1 flex gap-1">
                          {!m.isFeatured && (
                            <button onClick={() => setFeatured(i)} className="bg-background/80 p-0.5 rounded" title="Set as featured">
                              <Star className="h-3 w-3" />
                            </button>
                          )}
                          <button onClick={() => removeMedia(i)} className="bg-background/80 p-0.5 rounded text-destructive" title="Remove">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        {m.isFeatured && (
                          <span className="absolute bottom-0 left-0 right-0 text-[9px] bg-primary text-primary-foreground text-center py-0.5">Featured</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept="image/jpeg,image/png,image/webp,video/mp4" className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="ghost-button flex items-center gap-2 text-xs flex-1">
                    {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    Upload from Device
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <input value={mediaUrlInput} onChange={(e) => setMediaUrlInput(e.target.value)} placeholder="Paste image/video URL"
                    className="flex-1 border border-border px-3 py-1.5 text-xs bg-background focus:outline-none focus:border-foreground" />
                  <button onClick={addMediaUrl} className="ghost-button text-xs flex items-center gap-1">
                    <Link2 className="h-3 w-3" /> Add URL
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 flex-wrap pt-4">
                <button onClick={() => publishManualStory(false)} disabled={isPublishingManual}
                  className="bg-foreground text-background px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors flex items-center gap-2 disabled:opacity-50">
                  {isPublishingManual ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isPublishingManual ? "Publishing..." : "Publish Story"}
                </button>
                <button onClick={() => publishManualStory(true)} className="ghost-button flex items-center gap-2 text-xs">
                  <Archive className="h-3 w-3" /> Save as Draft
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API Status Tab */}
        {activeTab === "api-status" && (
          <div className="max-w-2xl">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 pb-2 border-b border-border">
              API Connection Status
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Shows which APIs are connected and ready to use. Missing APIs will not be used during news discovery.
            </p>
            <div className="space-y-0">
              {apiStatuses.map((api) => (
                <div key={api.envKey} className="flex items-center justify-between border-b border-border py-4">
                  <div className="flex items-center gap-3">
                    {api.connected ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive/50" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{api.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{api.envKey}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded ${
                    api.connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {api.connected ? "Connected" : "Not Connected"}
                  </span>
                </div>
              ))}
            </div>
            {apiStatuses.some((a) => !a.connected) && (
              <div className="mt-6 p-4 border border-border bg-muted/30 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Some APIs are not connected</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    The system will work with available APIs. Missing APIs will be skipped during news discovery. Contact your admin to configure the missing API keys.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
