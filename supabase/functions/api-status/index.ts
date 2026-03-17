import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const apis = [
    { name: "NewsAPI", key: "NEWSAPI_KEY" },
    { name: "GNews API", key: "GNEWS_API_KEY" },
    { name: "Serper API", key: "SERPER_API_KEY" },
    { name: "Groq API", key: "GROQ_API_KEY" },
    { name: "Tavily Search API", key: "TAVILY_API_KEY" },
    { name: "Firecrawl API", key: "FIRECRAWL_API_KEY" },
    { name: "ChromaDB API", key: "CHROMA_API_KEY" },
    { name: "Lovable AI", key: "LOVABLE_API_KEY" },
  ];

  const statuses = apis.map((api) => ({
    name: api.name,
    envKey: api.key,
    connected: !!Deno.env.get(api.key),
  }));

  return new Response(JSON.stringify({ statuses }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
