import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  action: "summarize" | "translate" | "summarize_translate";
  text: string;
  targetLanguage?: string;
  tone?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RequestBody = await req.json();
    const { action, text, targetLanguage, tone } = body;

    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt = "";
    let userPrompt = "";

    const toneInstruction = tone && tone !== "standard"
      ? `Use a ${tone} tone in your response.`
      : "Use a clear, professional tone.";

    if (action === "summarize") {
      systemPrompt = `You are an expert summarizer. ${toneInstruction} Return your response in markdown format with a TL;DR section and Key Takeaways section.`;
      userPrompt = `Summarize the following text:\n\n${text}`;
    } else if (action === "translate") {
      systemPrompt = `You are an expert translator. ${toneInstruction} Translate the given text accurately while preserving meaning and context. Return your response in markdown format with a Translation section.`;
      userPrompt = `Translate the following text to ${targetLanguage || "English"}:\n\n${text}`;
    } else if (action === "summarize_translate") {
      systemPrompt = `You are an expert summarizer and translator. ${toneInstruction} First summarize the text, then translate the summary. Return your response in markdown with a TL;DR section, Key Takeaways section, and a Translation section.`;
      userPrompt = `Summarize and then translate to ${targetLanguage || "English"} the following text:\n\n${text}`;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      return new Response(
        JSON.stringify({ error: errorData.error?.message || "OpenAI API error" }),
        { status: openaiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await openaiResponse.json();
    const result = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
