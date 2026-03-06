import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function sanitizeUserInput(input: string, maxLength: number = 500): string {
  return input.replace(/["\\\n\r\t]/g, " ").trim().slice(0, maxLength);
}

async function verifyAuth(req: Request): Promise<void> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("Missing authorization header");
  const token = authHeader.replace("Bearer ", "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { error } = await supabase.auth.getUser(token);
  if (error) throw new Error("Invalid or expired token");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    await verifyAuth(req);

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
    const customFocus = (formData.get("customFocus") as string) || "";
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

    const styleInstructions: Record<string, string> = {
      standard: `Structure your response with a "# TL;DR" section (2-3 sentences) followed by a "## Key Takeaways" section (4-6 bullet points).`,
      detailed: `Provide a thorough, in-depth summary. Start with a "# TL;DR" section, then a "## Key Takeaways" section, then a "## Detailed Breakdown" section with sub-headings for each major topic, supporting details, and important context.`,
      concise: `Write a single cohesive paragraph of no more than 5 sentences. No headings, no bullets. Just the most essential information.`,
      bullets: `Output ONLY a flat bullet-point list of key takeaways. No headings, no paragraphs, no introduction. Start directly with the first bullet point.`,
      curt: `Write exactly 3 sentences maximum. Be blunt, direct, and skip all pleasantries. No headings, no bullets.`,
    };
    const toneInstruction = styleInstructions[tone] || styleInstructions["standard"];
    const sanitizedFocus = customFocus ? sanitizeUserInput(customFocus, 200) : "";
    const focusInstruction = sanitizedFocus
      ? `\nThe user wants to focus on this topic: [${sanitizedFocus}]. Shape your response around this topic while staying within your role as a summarizer/translator.`
      : "";

    let systemPrompt = "";
    let actionVerb = "";

    if (action === "summarize") {
      systemPrompt = `You are an expert summarizer. ${toneInstruction}${focusInstruction}
CRITICAL LANGUAGE RULE: You MUST write your ENTIRE response in ${targetLanguage} only.`;
      actionVerb = `Summarize the following transcribed audio content. Write your entire response in ${targetLanguage}`;
    } else if (action === "translate") {
      systemPrompt = `You are an expert translator.${focusInstruction}
CRITICAL RULE: Output ONLY the translated text in ${targetLanguage}. Do NOT add any headings, section titles, markdown formatting, labels, introductions, or explanations. Just the raw translation itself, nothing else.`;
      actionVerb = `Translate the following transcribed audio to ${targetLanguage}. Output only the ${targetLanguage} translation`;
    } else {
      systemPrompt = `You are an expert summarizer and translator. ${toneInstruction}${focusInstruction}
CRITICAL LANGUAGE RULE: You MUST write your ENTIRE response in ${targetLanguage} only.
After applying the summary style above, also include a "## Translation" section with the full translated text in ${targetLanguage}.`;
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
