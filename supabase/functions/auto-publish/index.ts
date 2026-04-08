import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Step 1: Trigger news discovery to find fresh stories
    const discoveryUrl = `${supabaseUrl}/functions/v1/news-discovery`;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
    
    console.log("Step 1: Triggering news discovery...");
    try {
      const discResp = await fetch(discoveryUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${anonKey}`,
        },
        body: JSON.stringify({}),
      });
      const discData = await discResp.json();
      console.log("Discovery result:", discData);
    } catch (e) {
      console.error("Discovery trigger failed (non-fatal):", e);
    }

    // Step 2: Auto-publish pending suggestions (confidence 40+ to ensure continuous flow)
    console.log("Step 2: Auto-publishing pending suggestions...");
    const { data: pending, error: fetchErr } = await supabase
      .from("ai_suggestions")
      .select("*")
      .eq("status", "pending")
      .gte("confidence", 40)
      .order("confidence", { ascending: false })
      .limit(10);

    if (fetchErr) {
      console.error("Fetch pending error:", fetchErr);
      throw fetchErr;
    }

    if (!pending || pending.length === 0) {
      console.log("No pending high-confidence suggestions to publish.");
      return new Response(JSON.stringify({ message: "No new stories to publish", published: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let publishedCount = 0;
    const publishedArticleIds: string[] = [];

    for (const suggestion of pending) {
      const title = suggestion.ai_title || suggestion.original_title;
      const imageUrl = suggestion.image_url || "";
      const videoUrl = suggestion.video_url || null;

      if (!imageUrl && !videoUrl) {
        console.log(`Skipping without media: ${title}`);
        await supabase.from("ai_suggestions").update({ status: "expired" }).eq("id", suggestion.id);
        continue;
      }

      // Check for duplicate title or source in published articles
      const { data: existingByTitle } = await supabase
        .from("articles")
        .select("id")
        .eq("title", title)
        .maybeSingle();

      const { data: existingBySource } = suggestion.source_url
        ? await supabase
            .from("articles")
            .select("id")
            .eq("source_url", suggestion.source_url)
            .maybeSingle()
        : { data: null };

      if (existingByTitle || existingBySource) {
        console.log(`Skipping duplicate: ${suggestion.original_title}`);
        await supabase.from("ai_suggestions").update({ status: "duplicate" }).eq("id", suggestion.id);
        continue;
      }

      const viralHeadline = suggestion.viral_headline || title;
      const content = suggestion.ai_content || suggestion.original_summary || "";
      const summary = suggestion.ai_summary || suggestion.original_summary || "";
      const category = suggestion.category || "Nigeria";
      const tags = suggestion.tags || [];

      // Determine urgency flags from confidence
      const isBreaking = suggestion.confidence >= 85;
      const isTrending = suggestion.confidence >= 65;
      const isFeatured = suggestion.confidence >= 75;

      // Calculate read time
      const wordCount = content.split(/\s+/).length;
      const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

      const { data: inserted, error: insertErr } = await supabase
        .from("articles")
        .insert({
          title,
          viral_headline: viralHeadline,
          content,
          summary,
          category,
          image_url: imageUrl,
          video_url: videoUrl,
          tags,
          author: "Frontier Staff",
          status: "published",
          published_at: new Date().toISOString(),
          read_time: `${readMinutes} min`,
          source_name: suggestion.source_name,
          source_url: suggestion.source_url,
          seo_title: viralHeadline.slice(0, 60),
          seo_description: summary.slice(0, 160),
          is_featured: isFeatured,
          is_trending: isTrending,
          is_breaking: isBreaking,
          importance_score: suggestion.confidence || 50,
          // Breaking news goes straight to hero
          show_in_hero: isBreaking,
          hero_enabled: isBreaking,
          hero_expires_at: isBreaking ? new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() : null,
        })
        .select("id")
        .single();

      if (insertErr) {
        console.error(`Insert error for "${title}":`, insertErr);
        continue;
      }

      // Mark suggestion as published
      await supabase.from("ai_suggestions").update({ status: "published" }).eq("id", suggestion.id);

      // Add image as article media if available
      if (imageUrl && inserted) {
        await supabase.from("article_media").insert({
          article_id: inserted.id,
          media_url: imageUrl,
          media_type: "image",
          is_featured: true,
          position: 0,
        });
        publishedArticleIds.push(inserted.id);
      }

      publishedCount++;
      console.log(`Published: "${title}" (confidence: ${suggestion.confidence})`);
    }

    // Step 3: Hero rotation — set highest importance published article as hero
    console.log("Step 3: Hero rotation...");
    
    // Clear expired hero articles
    await supabase
      .from("articles")
      .update({ show_in_hero: false, hero_enabled: false })
      .eq("show_in_hero", true)
      .lt("hero_expires_at", new Date().toISOString());

    // Check if there's a current hero
    const { data: currentHero } = await supabase
      .from("articles")
      .select("id, importance_score")
      .eq("show_in_hero", true)
      .eq("hero_enabled", true)
      .eq("status", "published")
      .maybeSingle();

    // Find the best candidate for hero
    const { data: bestCandidate } = await supabase
      .from("articles")
      .select("id, importance_score, title")
      .eq("status", "published")
      .eq("show_in_hero", false)
      .order("importance_score", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (bestCandidate && (!currentHero || bestCandidate.importance_score > (currentHero.importance_score || 0))) {
      // Demote current hero
      if (currentHero) {
        await supabase.from("articles").update({ show_in_hero: false, hero_enabled: false }).eq("id", currentHero.id);
      }
      // Promote new hero
      const heroExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await supabase.from("articles").update({
        show_in_hero: true,
        hero_enabled: true,
        hero_expires_at: heroExpiry,
        is_featured: true,
      }).eq("id", bestCandidate.id);
      console.log(`New hero: "${bestCandidate.title}"`);
    }

    // Step 4: Cleanup — mark old low-confidence suggestions as expired
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("ai_suggestions")
      .update({ status: "expired" })
      .eq("status", "pending")
      .lt("confidence", 40)
      .lt("created_at", threeDaysAgo);

    return new Response(JSON.stringify({
      message: `Auto-publish complete. ${publishedCount} stories published.`,
      published: publishedCount,
      articles: publishedArticleIds,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Auto-publish error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
