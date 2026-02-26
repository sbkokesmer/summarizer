import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

    const formData = await req.formData();
    const action = formData.get("action") as string;
    const targetLanguage = (formData.get("targetLanguage") as string) || "English";
    const tone = (formData.get("tone") as string) || "standard";
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: "No audio file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["summarize", "translate", "summarize_translate"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const whisperForm = new FormData();
    whisperForm.append("file", audioFile, audioFile.name);
    whisperForm.append("model", "whisper-1");

    const transcribeRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiApiKey}` },
      body: whisperForm,
    });

    if (!transcribeRes.ok) {
      const err = await transcribeRes.json();
      throw new Error(err.error?.message || "Audio transcription failed");
    }

    const { text: transcript } = await transcribeRes.json();

    if (!transcript || transcript.trim().length === 0) {
      throw new Error("No speech detected in the audio file.");
    }

    const toneInstruction = tone && tone !== "standard"
      ? `Use a ${tone} tone in your response.`
      : "Use a clear, professional tone.";

    let systemPrompt = "";
    let actionVerb = "";

    if (action === "summarize") {
      systemPrompt = `You are an expert summarizer. ${toneInstruction}
CRITICAL LANGUAGE RULE: You MUST write your ENTIRE response in ${targetLanguage} only.
Return your response in markdown format with a TL;DR section and Key Takeaways section, both written entirely in ${targetLanguage}.`;
      actionVerb = `Summarize the following transcribed audio content. Write your entire response in ${targetLanguage}`;
    } else if (action === "translate") {
      systemPrompt = `You are an expert translator. ${toneInstruction}
CRITICAL RULE: Output ONLY the translated text in ${targetLanguage}. Do NOT add any headings, section titles, markdown formatting, labels, introductions, or explanations. Just the raw translation itself, nothing else.`;
      actionVerb = `Translate the following transcribed audio to ${targetLanguage}. Output only the ${targetLanguage} translation`;
    } else {
      systemPrompt = `You are an expert summarizer and translator. ${toneInstruction}
CRITICAL LANGUAGE RULE: You MUST write your ENTIRE response in ${targetLanguage} only.
Return your response in markdown with:
- A TL;DR section (in ${targetLanguage})
- A Key Takeaways section (in ${targetLanguage})
- A Translation section (in ${targetLanguage})`;
      actionVerb = `Summarize and translate the following transcribed audio to ${targetLanguage}. Write your entire response in ${targetLanguage}`;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `${actionVerb}:\n\n${transcript}` },
    ];

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "gpt-4o-mini", messages, max_tokens: 2000, temperature: 0.7 }),
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

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
