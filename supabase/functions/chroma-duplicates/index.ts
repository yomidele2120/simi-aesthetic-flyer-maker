import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CHROMA_API_KEY = Deno.env.get("CHROMA_API_KEY");
    const CHROMA_ENDPOINT = Deno.env.get("CHROMA_ENDPOINT");

    if (!CHROMA_API_KEY || !CHROMA_ENDPOINT) {
      return new Response(
        JSON.stringify({ success: false, error: "ChromaDB credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, collection_name, documents, query_text, n_results } = await req.json();
    const collectionName = collection_name || "news_articles";

    // Normalize endpoint URL
    const baseUrl = CHROMA_ENDPOINT.replace(/\/$/, "");
    const headers = {
      "Authorization": `Bearer ${CHROMA_API_KEY}`,
      "Content-Type": "application/json",
    };

    if (action === "ensure_collection") {
      // Create or get collection
      const resp = await fetch(`${baseUrl}/api/v1/collections`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name: collectionName, get_or_create: true }),
      });
      if (!resp.ok) {
        const err = await resp.text();
        console.error("ChromaDB create collection error:", resp.status, err);
        return new Response(
          JSON.stringify({ success: false, error: `ChromaDB error: ${resp.status}` }),
          { status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const data = await resp.json();
      return new Response(
        JSON.stringify({ success: true, collection: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get collection ID first
    const colResp = await fetch(`${baseUrl}/api/v1/collections/${collectionName}`, { headers });
    if (!colResp.ok) {
      // Try creating it
      const createResp = await fetch(`${baseUrl}/api/v1/collections`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name: collectionName, get_or_create: true }),
      });
      if (!createResp.ok) {
        return new Response(
          JSON.stringify({ success: false, error: "Could not access ChromaDB collection" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    const collection = await (colResp.ok ? colResp : await fetch(`${baseUrl}/api/v1/collections/${collectionName}`, { headers })).json();
    const collectionId = collection.id;

    if (action === "add") {
      // Add documents to collection for future duplicate detection
      if (!documents || !Array.isArray(documents) || documents.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: "Documents array is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const ids = documents.map((d: any) => d.id);
      const docTexts = documents.map((d: any) => d.text);
      const metadatas = documents.map((d: any) => d.metadata || {});

      const addResp = await fetch(`${baseUrl}/api/v1/collections/${collectionId}/add`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ids, documents: docTexts, metadatas }),
      });

      if (!addResp.ok) {
        const err = await addResp.text();
        console.error("ChromaDB add error:", addResp.status, err);
        return new Response(
          JSON.stringify({ success: false, error: `ChromaDB add error: ${addResp.status}` }),
          { status: addResp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Added ${documents.length} documents to ChromaDB`);
      return new Response(
        JSON.stringify({ success: true, added: documents.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "check_duplicate") {
      // Query for similar documents to detect duplicates
      if (!query_text) {
        return new Response(
          JSON.stringify({ success: false, error: "query_text is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const queryResp = await fetch(`${baseUrl}/api/v1/collections/${collectionId}/query`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query_texts: [query_text],
          n_results: n_results || 3,
        }),
      });

      if (!queryResp.ok) {
        const err = await queryResp.text();
        console.error("ChromaDB query error:", queryResp.status, err);
        return new Response(
          JSON.stringify({ success: false, error: `ChromaDB query error: ${queryResp.status}` }),
          { status: queryResp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const queryData = await queryResp.json();
      const distances = queryData.distances?.[0] || [];
      const ids = queryData.ids?.[0] || [];
      const documents_found = queryData.documents?.[0] || [];
      const metadatas_found = queryData.metadatas?.[0] || [];

      // A distance < 0.3 typically indicates a near-duplicate
      const duplicates = ids.map((id: string, i: number) => ({
        id,
        distance: distances[i],
        text_preview: documents_found[i]?.slice(0, 200),
        metadata: metadatas_found[i],
        is_duplicate: distances[i] < 0.3,
      }));

      const hasDuplicate = duplicates.some((d: any) => d.is_duplicate);

      return new Response(
        JSON.stringify({ success: true, has_duplicate: hasDuplicate, matches: duplicates }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid action. Use: ensure_collection, add, check_duplicate" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ChromaDB error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
