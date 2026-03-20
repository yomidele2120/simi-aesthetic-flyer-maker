import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const UNSPLASH_ACCESS_KEY = Deno.env.get("UNSPLASH_ACCESS_KEY");
    if (!UNSPLASH_ACCESS_KEY) throw new Error("UNSPLASH_ACCESS_KEY not configured");

    const { query, count } = await req.json();
    if (!query) throw new Error("query is required");

    const perPage = count || 1;
    const resp = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
    );

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Unsplash error:", resp.status, text);
      throw new Error(`Unsplash API error: ${resp.status}`);
    }

    const data = await resp.json();
    const results = (data.results || []).map((photo: any) => ({
      url: photo.urls?.regular || photo.urls?.small,
      thumb: photo.urls?.thumb,
      alt: photo.alt_description || photo.description || query,
      photographerName: photo.user?.name || "Unknown",
      photographerUrl: photo.user?.links?.html || "https://unsplash.com",
      unsplashLink: photo.links?.html || "https://unsplash.com",
      downloadUrl: photo.links?.download_location,
    }));

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unsplash function error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
