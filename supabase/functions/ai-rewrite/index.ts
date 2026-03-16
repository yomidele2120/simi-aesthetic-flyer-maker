import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { action, title, summary, content } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "rewrite":
        systemPrompt = "You are a senior journalist at a professional Nigerian news outlet called CoreNews. Rewrite the following article in a clear, professional journalistic format. Use inverted pyramid style. Include a compelling lede, context, quotes where appropriate, and a strong conclusion. Output only the article text.";
        userPrompt = `Title: ${title}\n\nOriginal content: ${summary || content}`;
        break;

      case "headlines":
        systemPrompt = "You are an expert headline writer for a Nigerian news platform. Generate exactly 5 catchy, engaging headlines for the following article. Each headline should be concise (under 80 characters), attention-grabbing, and accurate. Return them as a JSON array of strings.";
        userPrompt = `Title: ${title}\n\nSummary: ${summary}`;
        break;

      case "summarize":
        systemPrompt = "You are a news editor. Write a concise 2-3 sentence summary of the following article that captures the key facts. Output only the summary.";
        userPrompt = `Title: ${title}\n\nContent: ${content || summary}`;
        break;

      case "seo":
        systemPrompt = "You are an SEO specialist for a news website. Generate an SEO-optimized title (under 60 chars) and meta description (under 160 chars) for this article. Return as JSON: {\"seoTitle\": \"...\", \"seoDescription\": \"...\"}";
        userPrompt = `Title: ${title}\n\nSummary: ${summary}`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    // Parse headlines as JSON array if action is headlines
    let parsed: any = result;
    if (action === "headlines") {
      try {
        const match = result.match(/\[[\s\S]*\]/);
        parsed = match ? JSON.parse(match[0]) : [result];
      } catch {
        parsed = result.split("\n").filter((l: string) => l.trim()).slice(0, 5);
      }
    } else if (action === "seo") {
      try {
        const match = result.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : { seoTitle: title, seoDescription: summary };
      } catch {
        parsed = { seoTitle: title, seoDescription: summary };
      }
    }

    return new Response(JSON.stringify({ result: parsed }), {
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
