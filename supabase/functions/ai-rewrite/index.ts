import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const useGroq = !!GROQ_API_KEY;
    const apiKey = useGroq ? GROQ_API_KEY : LOVABLE_API_KEY;
    const apiUrl = useGroq
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://ai.gateway.lovable.dev/v1/chat/completions";
    const model = useGroq ? "llama-3.3-70b-versatile" : "google/gemini-3-flash-preview";

    if (!apiKey) throw new Error("No AI API key configured (GROQ_API_KEY or LOVABLE_API_KEY)");

    const { action, title, summary, content } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "rewrite":
        systemPrompt = `You are a senior investigative journalist at Frontier, a leading global news platform. Your task is to transform the provided source material into a comprehensive, deeply detailed, and engaging long-form news article.

REQUIREMENTS:
- Write in professional journalism style similar to Reuters, BBC, or Al Jazeera
- Start with a powerful, attention-grabbing opening paragraph (the hook)
- Include detailed explanation of the event or topic with full context
- Provide background context, historical relevance, and how we got here
- Include expert-style analysis and commentary where appropriate
- Explain the impact on society, politics, economy, or technology
- Use multiple paragraphs, each exploring a different angle of the story
- Include a strong concluding section that summarizes key takeaways
- The article should be at least 800-1200 words
- Use inverted pyramid style but maintain reader engagement throughout
- Write in a way that makes readers want to stay on the page
- Avoid shallow summaries — every section should add value and depth
- Use specific details, data points, and contextual information
- The tone should be authoritative yet accessible

Output ONLY the article text, no meta commentary.`;
        userPrompt = `Title: ${title}\n\nSource material: ${content || summary}`;
        break;

      case "headlines":
        systemPrompt = "You are an expert headline writer for Frontier, a global news platform. Generate exactly 5 catchy, engaging headlines for the following article. Each headline should be concise (under 80 characters), attention-grabbing, and accurate. Return them as a JSON array of strings.";
        userPrompt = `Title: ${title}\n\nSummary: ${summary}`;
        break;

      case "summarize":
        systemPrompt = "You are a news editor at Frontier. Write a concise 2-3 sentence summary of the following article that captures the key facts. Output only the summary.";
        userPrompt = `Title: ${title}\n\nContent: ${content || summary}`;
        break;

      case "seo":
        systemPrompt = "You are an SEO specialist for Frontier news platform. Generate an SEO-optimized title (under 60 chars) and meta description (under 160 chars) for this article. Also generate 5-8 relevant SEO keywords. Return as JSON: {\"seoTitle\": \"...\", \"seoDescription\": \"...\", \"keywords\": [...]}";
        userPrompt = `Title: ${title}\n\nSummary: ${summary}`;
        break;

      case "viral_headline":
        systemPrompt = "You are a headline optimization expert at Frontier news. Generate 2 headlines for this article:\n1. Standard: Professional journalistic headline (factual, clear)\n2. Viral: Attention-grabbing, high CTR, emotionally compelling but NOT clickbait or misleading. Must preserve factual accuracy.\n\nReturn as JSON: {\"standard\": \"...\", \"viral\": \"...\"}";
        userPrompt = `Title: ${title}\n\nSummary: ${summary}`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI error:", response.status, text);
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    let parsed: any = result;
    if (action === "headlines") {
      try {
        const match = result.match(/\[[\s\S]*\]/);
        parsed = match ? JSON.parse(match[0]) : [result];
      } catch {
        parsed = result.split("\n").filter((l: string) => l.trim()).slice(0, 5);
      }
    } else if (action === "seo" || action === "viral_headline") {
      try {
        const match = result.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : { seoTitle: title, seoDescription: summary };
      } catch {
        parsed = { seoTitle: title, seoDescription: summary };
      }
    }

    return new Response(JSON.stringify({ result: parsed, provider: useGroq ? "groq" : "lovable" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI rewrite error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
