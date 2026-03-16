import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const NIGERIA_QUERIES = [
  "Nigeria news today",
  "Nigerian politics latest",
  "Nigeria economy business",
  "Nigeria technology startups",
  "Nigeria entertainment Nollywood",
  "Nigeria sports football",
  "Lagos news",
  "Abuja government news",
];

const GLOBAL_QUERIES = [
  "breaking world news",
  "global economy markets",
  "technology AI latest",
  "Africa news today",
];

interface NewsItem {
  title: string;
  description: string;
  source: string;
  url: string;
  imageUrl: string;
  author?: string;
  publishedAt?: string;
  region: "nigeria" | "world";
}

// Serper API search
async function searchSerper(apiKey: string): Promise<NewsItem[]> {
  const results: NewsItem[] = [];
  const allQueries = [
    ...NIGERIA_QUERIES.map(q => ({ q, region: "nigeria" as const })),
    ...GLOBAL_QUERIES.map(q => ({ q, region: "world" as const })),
  ];

  for (const { q, region } of allQueries) {
    try {
      const resp = await fetch("https://google.serper.dev/news", {
        method: "POST",
        headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ q, num: 5 }),
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
          region,
        });
      }
    } catch (e) {
      console.error(`Serper failed for "${q}":`, e);
    }
  }
  return results;
}

// NewsAPI
async function fetchNewsAPI(apiKey: string): Promise<NewsItem[]> {
  const results: NewsItem[] = [];
  const queries = [
    { q: "Nigeria", region: "nigeria" as const },
    { q: "Lagos", region: "nigeria" as const },
    { q: "Africa", region: "world" as const },
    { q: "technology", region: "world" as const },
    { q: "business", region: "world" as const },
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

// GNews API
async function fetchGNews(apiKey: string): Promise<NewsItem[]> {
  const results: NewsItem[] = [];
  const categories = [
    { cat: "general", region: "nigeria" as const },
    { cat: "business", region: "nigeria" as const },
    { cat: "technology", region: "world" as const },
    { cat: "world", region: "world" as const },
  ];
  for (const { cat, region } of categories) {
    try {
      const country = region === "nigeria" ? "ng" : "us";
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

// Groq AI processing
async function processWithGroq(items: NewsItem[], groqKey: string): Promise<any[]> {
  const processed: any[] = [];
  const batch = items.slice(0, 15);

  for (const item of batch) {
    try {
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a senior editor at CoreNews, a leading Nigerian news platform. Process the following news article: rewrite it professionally, generate headlines, categorize it, and assess its relevance. Focus on Nigerian and African relevance when categorizing. Return valid JSON with these fields: ai_title (string), ai_summary (string, 2-3 sentences), ai_content (string, 3-5 paragraphs), ai_headlines (array of 3-5 strings), category (one of: Nigeria, World, Business & Economy, Technology, Investigations, Opinions), confidence (number 0-100), tags (array of strings).",
            },
            {
              role: "user",
              content: `Title: ${item.title}\nSource: ${item.source}\nContent: ${item.description}`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      });

      if (!resp.ok) {
        console.error("Groq error:", resp.status, await resp.text());
        continue;
      }

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        try {
          const args = JSON.parse(content);
          processed.push({
            original_title: item.title,
            original_summary: item.description,
            source_name: item.source,
            source_url: item.url,
            image_url: item.imageUrl,
            ai_title: args.ai_title,
            ai_summary: args.ai_summary,
            ai_content: args.ai_content,
            ai_headlines: args.ai_headlines || [],
            category: args.category || (item.region === "nigeria" ? "Nigeria" : "World"),
            confidence: args.confidence || 50,
          });
        } catch {
          console.error("Failed to parse Groq response");
        }
      }
    } catch (e) {
      console.error("Groq processing error:", e);
    }
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
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    let allItems: NewsItem[] = [];

    if (SERPER_API_KEY) {
      const results = await searchSerper(SERPER_API_KEY);
      console.log(`Serper: ${results.length} results`);
      allItems.push(...results);
    } else {
      console.warn("SERPER_API_KEY not set");
    }

    let newsApiCount = 0;
    if (NEWSAPI_KEY) {
      const results = await fetchNewsAPI(NEWSAPI_KEY);
      newsApiCount = results.length;
      console.log(`NewsAPI: ${newsApiCount} results`);
      allItems.push(...results);
    } else {
      console.warn("NEWSAPI_KEY not set");
    }

    if (GNEWS_API_KEY && newsApiCount < 10) {
      const results = await fetchGNews(GNEWS_API_KEY);
      console.log(`GNews: ${results.length} results`);
      allItems.push(...results);
    }

    allItems = deduplicateItems(allItems);
    console.log(`Total unique: ${allItems.length}`);

    if (allItems.length === 0) {
      return new Response(JSON.stringify({ message: "No news found. Check API keys.", count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const processed = await processWithGroq(allItems, GROQ_API_KEY);
    console.log(`Groq processed: ${processed.length}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let insertedCount = 0;
    for (const item of processed) {
      const { data: existing } = await supabase
        .from("ai_suggestions")
        .select("id")
        .eq("original_title", item.original_title)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from("ai_suggestions").insert(item);
        if (error) console.error("Insert error:", error);
        else insertedCount++;
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
