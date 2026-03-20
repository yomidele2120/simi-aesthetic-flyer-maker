import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Nigeria-focused search queries (prioritized)
const NIGERIA_QUERIES = [
  "Nigeria news today",
  "Nigerian politics latest",
  "Nigerian economy business",
  "Nigeria technology startups",
  "Lagos Abuja news",
  "Nigerian sports football",
  "Africa Nigeria breaking news",
];

const GLOBAL_QUERIES = [
  "breaking world news today",
  "global economy business",
  "technology news AI",
  "international politics",
  "world events trending",
];

interface NewsItem {
  title: string;
  description: string;
  source: string;
  url: string;
  imageUrl: string;
  author?: string;
  publishedAt?: string;
  region: "nigeria" | "global";
}

// Serper API
async function searchSerper(apiKey: string): Promise<NewsItem[]> {
  const results: NewsItem[] = [];
  const allQueries = [...NIGERIA_QUERIES, ...GLOBAL_QUERIES];

  for (const query of allQueries) {
    try {
      const isNigeria = NIGERIA_QUERIES.includes(query);
      const resp = await fetch("https://google.serper.dev/news", {
        method: "POST",
        headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ q: query, num: 5, gl: isNigeria ? "ng" : undefined }),
      });
      if (!resp.ok) continue;
      const data = await resp.json();
      for (const item of data.news || []) {
        results.push({
          title: item.title,
          description: item.snippet || "",
          source: item.source || "Unknown",
          url: item.link || "",
          imageUrl: item.imageUrl || "",
          publishedAt: item.date,
          region: isNigeria ? "nigeria" : "global",
        });
      }
    } catch (e) {
      console.error(`Serper failed for "${query}":`, e);
    }
  }
  return results;
}

// Tavily API
async function searchTavily(apiKey: string): Promise<NewsItem[]> {
  const results: NewsItem[] = [];
  const queries = ["Nigeria news latest", "breaking world news"];

  for (const query of queries) {
    try {
      const isNigeria = query.includes("Nigeria");
      const resp = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          search_depth: "basic",
          max_results: 5,
          topic: "news",
        }),
      });
      if (!resp.ok) continue;
      const data = await resp.json();
      for (const r of data.results || []) {
        results.push({
          title: r.title || "",
          description: r.content || "",
          source: new URL(r.url).hostname,
          url: r.url || "",
          imageUrl: "",
          region: isNigeria ? "nigeria" : "global",
        });
      }
    } catch (e) {
      console.error(`Tavily failed for "${query}":`, e);
    }
  }
  return results;
}

// NewsAPI
async function fetchNewsAPI(apiKey: string): Promise<NewsItem[]> {
  const results: NewsItem[] = [];
  const queries = [
    { q: "Nigeria", region: "nigeria" as const },
    { q: "Africa", region: "nigeria" as const },
    { q: "technology", region: "global" as const },
    { q: "business", region: "global" as const },
    { q: "world", region: "global" as const },
  ];

  for (const { q, region } of queries) {
    try {
      const resp = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`
      );
      if (!resp.ok) continue;
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
          region,
        });
      }
    } catch (e) {
      console.error(`NewsAPI failed for "${q}":`, e);
    }
  }
  return results;
}

// GNews API (fallback)
async function fetchGNews(apiKey: string): Promise<NewsItem[]> {
  const results: NewsItem[] = [];
  const categories = [
    { cat: "general", country: "ng", region: "nigeria" as const },
    { cat: "business", country: "ng", region: "nigeria" as const },
    { cat: "technology", country: "us", region: "global" as const },
    { cat: "world", country: "us", region: "global" as const },
  ];

  for (const { cat, country, region } of categories) {
    try {
      const resp = await fetch(
        `https://gnews.io/api/v4/top-headlines?category=${cat}&lang=en&country=${country}&max=5&apikey=${apiKey}`
      );
      if (!resp.ok) continue;
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
          region,
        });
      }
    } catch (e) {
      console.error(`GNews failed for "${cat}":`, e);
    }
  }
  return results;
}

// Firecrawl content extraction
async function extractWithFirecrawl(apiKey: string, url: string): Promise<string> {
  try {
    const resp = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });
    if (!resp.ok) return "";
    const data = await resp.json();
    return data.data?.markdown || data.markdown || "";
  } catch (e) {
    console.error("Firecrawl extraction failed:", e);
    return "";
  }
}

// Unsplash image fetching
async function fetchUnsplashImage(accessKey: string, query: string): Promise<{ url: string; photographerName: string; photographerUrl: string } | null> {
  try {
    const resp = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const photo = data.results?.[0];
    if (!photo) return null;
    return {
      url: photo.urls?.regular || photo.urls?.small,
      photographerName: photo.user?.name || "Unknown",
      photographerUrl: photo.user?.links?.html || "https://unsplash.com",
    };
  } catch (e) {
    console.error("Unsplash fetch error:", e);
    return null;
  }
}

// AI processing (Groq preferred, Lovable AI fallback)
async function processWithAI(items: NewsItem[], groqKey: string | undefined, lovableKey: string | undefined): Promise<any[]> {
  const useGroq = !!groqKey;
  const apiKey = useGroq ? groqKey : lovableKey;
  if (!apiKey) return [];

  const apiUrl = useGroq
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://ai.gateway.lovable.dev/v1/chat/completions";
  const model = useGroq ? "llama-3.3-70b-versatile" : "google/gemini-2.5-flash-lite";

  const batch = items.slice(0, 8);

  async function processOne(item: NewsItem) {
    try {
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
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
                  category: { type: "string", enum: ["Nigeria", "World", "Business & Economy", "Technology", "Investigations", "Opinions", "Sports", "Politics"] },
                  confidence: { type: "integer", description: "Confidence score 0-100 for news relevance" },
                  tags: { type: "array", items: { type: "string" }, description: "3-5 relevant tags" },
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
              content: "You are a senior editor at Frontier, a leading Nigerian news platform. Process the following news article. Prioritize Nigerian relevance when categorizing. For Nigeria-related content, use category 'Nigeria'. For international content, use 'World'.",
            },
            {
              role: "user",
              content: `Title: ${item.title}\nSource: ${item.source}\nRegion hint: ${item.region}\nContent: ${item.description}`,
            },
          ],
        }),
      });

      if (!resp.ok) {
        console.error("AI processing failed:", resp.status);
        return null;
      }

      const data = await resp.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const args = JSON.parse(toolCall.function.arguments);
        return {
          original_title: item.title,
          original_summary: item.description,
          source_name: item.source,
          source_url: item.url,
          image_url: item.imageUrl,
          ...args,
          ai_headlines: args.ai_headlines || [],
        };
      }
    } catch (e) {
      console.error("AI processing error:", e);
    }
    return null;
  }

  // Process sequentially to avoid Groq rate limits
  const processed: any[] = [];
  for (const item of batch) {
    const result = await processOne(item);
    if (result) processed.push(result);
  }
  return processed;
}

// Deduplicate
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
    const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY");
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!GROQ_API_KEY && !LOVABLE_API_KEY) throw new Error("No AI API key configured");

    let allItems: NewsItem[] = [];

    // Step 1: Serper search (Nigeria-focused + global)
    if (SERPER_API_KEY) {
      const results = await searchSerper(SERPER_API_KEY);
      console.log(`Serper: ${results.length} results`);
      allItems.push(...results);
    }

    // Step 1b: Tavily search
    if (TAVILY_API_KEY) {
      const results = await searchTavily(TAVILY_API_KEY);
      console.log(`Tavily: ${results.length} results`);
      allItems.push(...results);
    }

    // Step 2: NewsAPI
    let newsApiCount = 0;
    if (NEWSAPI_KEY) {
      const results = await fetchNewsAPI(NEWSAPI_KEY);
      newsApiCount = results.length;
      console.log(`NewsAPI: ${newsApiCount} results`);
      allItems.push(...results);
    }

    // Step 3: GNews fallback
    if (GNEWS_API_KEY && newsApiCount < 10) {
      const results = await fetchGNews(GNEWS_API_KEY);
      console.log(`GNews fallback: ${results.length} results`);
      allItems.push(...results);
    }

    // Deduplicate
    allItems = deduplicateItems(allItems);
    console.log(`Total unique: ${allItems.length}`);

    if (allItems.length === 0) {
      return new Response(JSON.stringify({ message: "No news items found. Check API keys.", count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 4: Firecrawl content extraction for top items
    if (FIRECRAWL_API_KEY) {
      const topItems = allItems.slice(0, 5);
      for (const item of topItems) {
        if (item.url && item.description.length < 200) {
          const extracted = await extractWithFirecrawl(FIRECRAWL_API_KEY, item.url);
          if (extracted) {
            item.description = extracted.slice(0, 2000);
          }
        }
      }
      console.log("Firecrawl extraction done for top items");
    }

    // Step 5: AI processing (Groq preferred)
    const processed = await processWithAI(allItems, GROQ_API_KEY, LOVABLE_API_KEY);
    console.log(`AI processed: ${processed.length} items`);

    // Step 6: Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Step 6a: ChromaDB duplicate detection (if configured)
    const CHROMA_API_KEY = Deno.env.get("CHROMA_API_KEY");
    const CHROMA_ENDPOINT = Deno.env.get("CHROMA_ENDPOINT");
    let chromaFiltered = processed;

    if (CHROMA_API_KEY && CHROMA_ENDPOINT) {
      const baseUrl = CHROMA_ENDPOINT.replace(/\/$/, "");
      const chromaHeaders = {
        "Authorization": `Bearer ${CHROMA_API_KEY}`,
        "Content-Type": "application/json",
      };

      try {
        // Ensure collection exists
        await fetch(`${baseUrl}/api/v1/collections`, {
          method: "POST",
          headers: chromaHeaders,
          body: JSON.stringify({ name: "news_articles", get_or_create: true }),
        });

        const colResp = await fetch(`${baseUrl}/api/v1/collections/news_articles`, { headers: chromaHeaders });
        if (colResp.ok) {
          const col = await colResp.json();
          const nonDuplicates: any[] = [];

          for (const item of processed) {
            try {
              const qResp = await fetch(`${baseUrl}/api/v1/collections/${col.id}/query`, {
                method: "POST",
                headers: chromaHeaders,
                body: JSON.stringify({ query_texts: [item.ai_title || item.original_title], n_results: 1 }),
              });
              if (qResp.ok) {
                const qData = await qResp.json();
                const dist = qData.distances?.[0]?.[0];
                if (dist === undefined || dist > 0.3) {
                  nonDuplicates.push(item);
                } else {
                  console.log(`Duplicate detected (distance ${dist}): ${item.original_title}`);
                }
              } else {
                nonDuplicates.push(item);
              }
            } catch {
              nonDuplicates.push(item);
            }
          }

          chromaFiltered = nonDuplicates;
          console.log(`ChromaDB: ${processed.length - nonDuplicates.length} duplicates filtered`);

          // Add non-duplicates to ChromaDB for future detection
          if (nonDuplicates.length > 0) {
            const ids = nonDuplicates.map((_, i) => `discovery-${Date.now()}-${i}`);
            const docs = nonDuplicates.map((item) => `${item.ai_title || item.original_title}. ${item.ai_summary || item.original_summary || ""}`);
            const metas = nonDuplicates.map((item) => ({ source: item.source_name || "", category: item.category || "" }));

            await fetch(`${baseUrl}/api/v1/collections/${col.id}/add`, {
              method: "POST",
              headers: chromaHeaders,
              body: JSON.stringify({ ids, documents: docs, metadatas: metas }),
            });
          }
        }
      } catch (e) {
        console.error("ChromaDB integration error (non-fatal):", e);
      }
    }

    // Step 7: Save to database
    let insertedCount = 0;
    for (const item of chromaFiltered) {
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
