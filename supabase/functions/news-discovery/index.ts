import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Section-focused search queries so every homepage block stays populated
const NIGERIA_QUERIES = [
  "Nigeria breaking news today",
  "Nigerian politics latest",
  "Nigeria business economy latest",
  "Nigeria technology startups",
  "Nigeria health news",
  "Nigeria sports football latest",
  "Nigeria entertainment music film news",
  "Africa Nigeria breaking news",
];

const GLOBAL_QUERIES = [
  "breaking world news today",
  "global economy business",
  "technology news AI",
  "international politics",
  "health news today",
  "sports news today",
  "entertainment news today",
  "world events trending",
];

type SectionCategory = "Nigeria" | "World" | "Business & Economy" | "Technology" | "Investigations" | "Opinions" | "Sports" | "Politics" | "Health" | "Entertainment";

interface NewsItem {
  title: string;
  description: string;
  source: string;
  url: string;
  imageUrl: string;
  author?: string;
  publishedAt?: string;
  region: "nigeria" | "global";
  topicHint?: SectionCategory;
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
  const queries = [
    { q: "Nigeria news latest", region: "nigeria" as const, topicHint: "Nigeria" as const },
    { q: "breaking world news", region: "global" as const, topicHint: "World" as const },
    { q: "health news today", region: "global" as const, topicHint: "Health" as const },
    { q: "sports news today", region: "global" as const, topicHint: "Sports" as const },
    { q: "entertainment news today", region: "global" as const, topicHint: "Entertainment" as const },
  ];

  for (const { q, region, topicHint } of queries) {
    try {
      const resp = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query: q,
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
          region,
          topicHint,
        });
      }
    } catch (e) {
      console.error(`Tavily failed for "${q}":`, e);
    }
  }
  return results;
}

// NewsAPI
async function fetchNewsAPI(apiKey: string): Promise<NewsItem[]> {
  const results: NewsItem[] = [];
  const queries = [
    { q: "Nigeria", region: "nigeria" as const, topicHint: "Nigeria" as const },
    { q: "Africa politics", region: "nigeria" as const, topicHint: "Politics" as const },
    { q: "technology", region: "global" as const, topicHint: "Technology" as const },
    { q: "business", region: "global" as const, topicHint: "Business & Economy" as const },
    { q: "health", region: "global" as const, topicHint: "Health" as const },
    { q: "sports", region: "global" as const, topicHint: "Sports" as const },
    { q: "entertainment", region: "global" as const, topicHint: "Entertainment" as const },
    { q: "world", region: "global" as const, topicHint: "World" as const },
  ];

  for (const { q, region, topicHint } of queries) {
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
          topicHint,
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
    { cat: "general", country: "ng", region: "nigeria" as const, topicHint: "Nigeria" as const },
    { cat: "business", country: "ng", region: "nigeria" as const, topicHint: "Business & Economy" as const },
    { cat: "technology", country: "us", region: "global" as const, topicHint: "Technology" as const },
    { cat: "health", country: "us", region: "global" as const, topicHint: "Health" as const },
    { cat: "sports", country: "us", region: "global" as const, topicHint: "Sports" as const },
    { cat: "entertainment", country: "us", region: "global" as const, topicHint: "Entertainment" as const },
    { cat: "world", country: "us", region: "global" as const, topicHint: "World" as const },
  ];

  for (const { cat, country, region, topicHint } of categories) {
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
          topicHint,
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

// Unsplash image fetching with duplicate avoidance
async function fetchUnsplashImage(accessKey: string, query: string, usedUrls: Set<string>): Promise<{ url: string; photographerName: string; photographerUrl: string } | null> {
  try {
    const resp = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const photo = (data.results || []).find((result: any) => {
      const candidateUrl = result.urls?.regular || result.urls?.small;
      return candidateUrl && !usedUrls.has(candidateUrl);
    }) || data.results?.[0];
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

// AI processing (Lovable AI Gateway preferred, Groq fallback)
async function processWithAI(items: NewsItem[], groqKey: string | undefined, lovableKey: string | undefined): Promise<any[]> {
  // Prefer Lovable AI Gateway to avoid Groq rate limits
  const useLovable = !!lovableKey;
  const apiKey = useLovable ? lovableKey : groqKey;
  if (!apiKey) return [];

  const apiUrl = useLovable
    ? "https://ai.gateway.lovable.dev/v1/chat/completions"
    : "https://api.groq.com/openai/v1/chat/completions";
  const model = useLovable ? "google/gemini-2.5-flash" : "llama-3.3-70b-versatile";

  const batch = selectDiverseBatch(items, 10);

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
                  ai_title: { type: "string", description: "Rewritten, professional journalistic headline" },
                  viral_headline: { type: "string", description: "Attention-grabbing viral headline for homepage/SEO. Short, engaging, high CTR but NOT clickbait. Must be factually accurate." },
                  ai_summary: { type: "string", description: "2-3 sentence professional summary" },
                  ai_content: { type: "string", description: "Full article rewrite in journalistic format, 3-5 paragraphs" },
                  ai_headlines: { type: "array", items: { type: "string" }, description: "3-5 alternative catchy headlines" },
                  category: { type: "string", enum: ["Nigeria", "World", "Business & Economy", "Technology", "Investigations", "Opinions", "Sports", "Politics", "Health", "Entertainment"] },
                  news_urgency: { type: "string", enum: ["breaking", "trending", "regular"], description: "Classify: 'breaking' = urgent time-sensitive high-impact; 'trending' = gaining attention not urgent; 'regular' = standard news" },
                  confidence: { type: "integer", description: "Confidence score 0-100 for news relevance" },
                  tags: { type: "array", items: { type: "string" }, description: "3-5 relevant tags" },
                  video_url: { type: "string", description: "YouTube or video URL if the story contains video content, empty string if none" },
                },
                required: ["ai_title", "viral_headline", "ai_summary", "ai_content", "ai_headlines", "category", "news_urgency", "confidence"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "process_article" } },
          messages: [
            {
              role: "system",
              content: "You are a senior editor at Frontier, a leading Nigerian news platform. Process the following news article.\n\nRULES:\n1. Rewrite in professional journalistic tone (BBC/Reuters style). Remove filler, bias, repetition.\n2. Create TWO headlines: ai_title (standard journalistic) and viral_headline (engaging, high CTR, NOT clickbait).\n3. Classify news_urgency: 'breaking' for urgent/time-sensitive/high-impact events, 'trending' for gaining traction, 'regular' for standard.\n4. Use the most accurate category from: Nigeria, World, Business & Economy, Technology, Politics, Health, Sports, Entertainment, Investigations, Opinions.\n5. Prefer the supplied topic hint when it matches the story.\n6. If the source contains video content (YouTube links etc), extract the video_url.\n7. Confidence: 80+ for breaking, 60-79 for trending, 40-59 for regular quality news.",
            },
            {
              role: "user",
              content: `Title: ${item.title}\nSource: ${item.source}\nRegion hint: ${item.region}\nTopic hint: ${item.topicHint || "none"}\nContent: ${item.description}`,
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
        // Map urgency to confidence boost and flags
        const urgency = args.news_urgency || "regular";
        let confidence = args.confidence || 50;
        if (urgency === "breaking") confidence = Math.max(confidence, 85);
        else if (urgency === "trending") confidence = Math.max(confidence, 65);
        
        return {
          original_title: item.title,
          original_summary: item.description,
          source_name: item.source,
          source_url: item.url,
          image_url: item.imageUrl,
          ...args,
          category: args.category || item.topicHint || (item.region === "nigeria" ? "Nigeria" : "World"),
          confidence,
          ai_headlines: args.ai_headlines || [],
          viral_headline: args.viral_headline || args.ai_title,
          video_url: args.video_url || null,
        };
      }
    } catch (e) {
      console.error("AI processing error:", e);
    }
    return null;
  }

  // Process sequentially with delay to avoid rate limits
  const processed: any[] = [];
  for (let i = 0; i < batch.length; i++) {
    const result = await processOne(batch[i]);
    if (result) processed.push(result);
    // Small delay between requests
    if (i < batch.length - 1) await new Promise(r => setTimeout(r, 500));
  }
  return processed;
}

// Deduplicate by normalized title or source URL
function deduplicateItems(items: NewsItem[]): NewsItem[] {
  const seenTitles = new Set<string>();
  const seenUrls = new Set<string>();
  return items.filter((item) => {
    const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim().slice(0, 80);
    const normalizedUrl = item.url.trim().toLowerCase();
    if ((normalizedUrl && seenUrls.has(normalizedUrl)) || seenTitles.has(normalizedTitle)) return false;
    if (normalizedUrl) seenUrls.add(normalizedUrl);
    seenTitles.add(normalizedTitle);
    return true;
  });
}

function selectDiverseBatch(items: NewsItem[], size: number): NewsItem[] {
  const picked: NewsItem[] = [];
  const usedIndices = new Set<number>();
  const preferredOrder: SectionCategory[] = ["Nigeria", "Politics", "Business & Economy", "Technology", "Health", "Sports", "Entertainment", "World"];

  for (const category of preferredOrder) {
    const index = items.findIndex((item, i) => item.topicHint === category && !usedIndices.has(i));
    if (index !== -1) {
      picked.push(items[index]);
      usedIndices.add(index);
      if (picked.length === size) return picked;
    }
  }

  items.forEach((item, i) => {
    if (!usedIndices.has(i) && picked.length < size) {
      picked.push(item);
      usedIndices.add(i);
    }
  });

  return picked;
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
    const UNSPLASH_ACCESS_KEY = Deno.env.get("UNSPLASH_ACCESS_KEY");

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

    // Step 5b: Fetch Unsplash images for items without images
    if (UNSPLASH_ACCESS_KEY) {
      const usedImageUrls = new Set(processed.map((item) => item.image_url).filter(Boolean));
      for (const item of processed) {
        if (!item.image_url && !item.video_url) {
          const keywords = (item.category || item.ai_title || item.original_title).split(" ").slice(0, 4).join(" ");
          const photo = await fetchUnsplashImage(UNSPLASH_ACCESS_KEY, keywords, usedImageUrls);
          if (photo) {
            item.image_url = photo.url;
            usedImageUrls.add(photo.url);
            const existingTags = Array.isArray(item.tags) ? item.tags : [];
            item.tags = [...existingTags, `Photo: ${photo.photographerName}`];
          }
        }
      }
      console.log("Unsplash image enrichment done");
    }

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
        // Strip fields not in the ai_suggestions table
        const { news_urgency, ...insertData } = item;
        const { error } = await supabase.from("ai_suggestions").insert(insertData);
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
