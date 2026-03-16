import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SEARCH_QUERIES = [
  "latest Nigeria news",
  "breaking world news",
  "technology news today",
  "business news Nigeria",
  "trending global events",
];

interface NewsItem {
  title: string;
  description: string;
  source: string;
  url: string;
  imageUrl: string;
  author?: string;
  publishedAt?: string;
}

// Step 1: Serper API - discover trending topics
async function searchSerper(apiKey: string): Promise<NewsItem[]> {
  const results: NewsItem[] = [];
  for (const query of SEARCH_QUERIES) {
    try {
      const resp = await fetch("https://google.serper.dev/news", {
        method: "POST",
        headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ q: query, num: 5 }),
      });
      if (!resp.ok) { await resp.text(); continue; }
      const data = await resp.json();
      for (const item of data.news || []) {
        results.push({
          title: item.title,
          description: item.snippet || "",
          source: item.source || "Unknown",
          url: item.link || "",
          imageUrl: item.imageUrl || "",
          publishedAt: item.date,
        });
      }
    } catch (e) {
      console.error(`Serper search failed for "${query}":`, e);
    }
  }
  return results;
}

// Step 2: NewsAPI - fetch structured articles
async function fetchNewsAPI(apiKey: string): Promise<NewsItem[]> {
  const results: NewsItem[] = [];
  const queries = ["Nigeria", "Africa", "technology", "business", "world"];
  for (const q of queries) {
    try {
      const resp = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`
      );
      if (!resp.ok) { await resp.text(); continue; }
      const data = await resp.json();
      for (const a of data.articles || []) {
        results.push({
          title: a.title || "",
          description: a.description || "",
          source: a.source?.name || "Unknown",
          url: a.url || "",
          imageUrl: a.urlToImage || "",
          author: a.author,
          publishedAt: a.publishedAt,
        });
      }
    } catch (e) {
      console.error(`NewsAPI failed for "${q}":`, e);
    }
  }
  return results;
}

// Step 3: GNews API - fallback
async function fetchGNews(apiKey: string): Promise<NewsItem[]> {
  const results: NewsItem[] = [];
  const categories = ["general", "business", "technology", "world"];
  for (const cat of categories) {
    try {
      const resp = await fetch(
        `https://gnews.io/api/v4/top-headlines?category=${cat}&lang=en&country=ng&max=5&apikey=${apiKey}`
      );
      if (!resp.ok) { await resp.text(); continue; }
      const data = await resp.json();
      for (const a of data.articles || []) {
        results.push({
          title: a.title || "",
          description: a.description || "",
          source: a.source?.name || "Unknown",
          url: a.url || "",
          imageUrl: a.image || "",
          author: a.author,
          publishedAt: a.publishedAt,
        });
      }
    } catch (e) {
      console.error(`GNews failed for "${cat}":`, e);
    }
  }
  return results;
}

// Step 4: AI processing with Lovable AI
async function processWithAI(items: NewsItem[], lovableKey: string): Promise<any[]> {
  const processed: any[] = [];
  // Process in batches of 5
  const batch = items.slice(0, 15);

  for (const item of batch) {
    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          tools: [{
            type: "function",
            function: {
              name: "process_article",
              description: "Process a news article and return structured data",
              parameters: {
                type: "object",
                properties: {
                  ai_title: { type: "string", description: "Rewritten, engaging headline" },
                  ai_summary: { type: "string", description: "2-3 sentence professional summary" },
                  ai_content: { type: "string", description: "Full article rewrite in journalistic format, 3-5 paragraphs" },
                  ai_headlines: { type: "array", items: { type: "string" }, description: "3-5 alternative catchy headlines" },
                  category: { type: "string", enum: ["Nigeria", "World", "Business & Economy", "Technology", "Investigations", "Opinions"] },
                  confidence: { type: "integer", description: "Confidence score 0-100 for news relevance" },
                },
                required: ["ai_title", "ai_summary", "ai_content", "ai_headlines", "category", "confidence"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "process_article" } },
          messages: [
            {
              role: "system",
              content: "You are a senior editor at CoreNews, a leading Nigerian news platform. Process the following news article: rewrite it professionally, generate headlines, categorize it, and assess its relevance. Focus on Nigerian and African relevance when categorizing.",
            },
            {
              role: "user",
              content: `Title: ${item.title}\nSource: ${item.source}\nContent: ${item.description}`,
            },
          ],
        }),
      });

      if (!resp.ok) {
        console.error("AI processing failed:", resp.status, await resp.text());
        continue;
      }

      const data = await resp.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const args = JSON.parse(toolCall.function.arguments);
        processed.push({
          original_title: item.title,
          original_summary: item.description,
          source_name: item.source,
          source_url: item.url,
          image_url: item.imageUrl,
          ...args,
          ai_headlines: args.ai_headlines || [],
        });
      }
    } catch (e) {
      console.error("AI processing error:", e);
    }
  }
  return processed;
}

// Deduplicate by title similarity
function deduplicateItems(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.title.toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SERPER_API_KEY = Deno.env.get("SERPER_API_KEY");
    const NEWSAPI_KEY = Deno.env.get("NEWSAPI_KEY");
    const GNEWS_API_KEY = Deno.env.get("GNEWS_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let allItems: NewsItem[] = [];

    // Step 1: Serper search
    if (SERPER_API_KEY) {
      const serperResults = await searchSerper(SERPER_API_KEY);
      console.log(`Serper returned ${serperResults.length} results`);
      allItems.push(...serperResults);
    } else {
      console.warn("SERPER_API_KEY not set, skipping Serper");
    }

    // Step 2: NewsAPI
    let newsApiCount = 0;
    if (NEWSAPI_KEY) {
      const newsApiResults = await fetchNewsAPI(NEWSAPI_KEY);
      newsApiCount = newsApiResults.length;
      console.log(`NewsAPI returned ${newsApiCount} results`);
      allItems.push(...newsApiResults);
    } else {
      console.warn("NEWSAPI_KEY not set, skipping NewsAPI");
    }

    // Step 3: GNews fallback
    if (GNEWS_API_KEY && newsApiCount < 10) {
      const gnewsResults = await fetchGNews(GNEWS_API_KEY);
      console.log(`GNews fallback returned ${gnewsResults.length} results`);
      allItems.push(...gnewsResults);
    }

    // Deduplicate
    allItems = deduplicateItems(allItems);
    console.log(`Total unique items: ${allItems.length}`);

    if (allItems.length === 0) {
      return new Response(JSON.stringify({ message: "No news items found. Please check API keys.", count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 4: AI processing
    const processed = await processWithAI(allItems, LOVABLE_API_KEY);
    console.log(`AI processed ${processed.length} items`);

    // Step 5: Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let insertedCount = 0;
    for (const item of processed) {
      // Check for duplicate by original_title
      const { data: existing } = await supabase
        .from("ai_suggestions")
        .select("id")
        .eq("original_title", item.original_title)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from("ai_suggestions").insert(item);
        if (error) {
          console.error("Insert error:", error);
        } else {
          insertedCount++;
        }
      }
    }

    return new Response(JSON.stringify({
      message: `Discovery complete. ${insertedCount} new suggestions added.`,
      total_found: allItems.length,
      processed: processed.length,
      inserted: insertedCount,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("News discovery error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
