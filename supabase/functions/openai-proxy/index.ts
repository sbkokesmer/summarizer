import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  action: "summarize" | "translate" | "summarize_translate";
  text?: string;
  fileBase64?: string;
  fileMimeType?: string;
  fileName?: string;
  imageBase64?: string;
  audioBase64?: string;
  audioMimeType?: string;
  url?: string;
  targetLanguage?: string;
  tone?: string;
  customFocus?: string;
}

async function fetchUrlContent(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SummaryBot/1.0)" },
  });
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);
  const html = await res.text();
  const stripped = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  return stripped.slice(0, 12000);
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
    const { action, text, fileBase64, fileMimeType, fileName, imageBase64, audioBase64, audioMimeType, url, targetLanguage, tone, customFocus } = body;

    const styleInstructions: Record<string, string> = {
      standard: `Structure your response with a "# TL;DR" section (2-3 sentences) followed by a "## Key Takeaways" section (4-6 bullet points).`,
      detailed: `Provide a thorough, in-depth summary. Start with a "# TL;DR" section, then a "## Key Takeaways" section, then a "## Detailed Breakdown" section with sub-headings for each major topic, supporting details, and important context.`,
      concise: `Write a single cohesive paragraph of no more than 5 sentences. No headings, no bullets. Just the most essential information.`,
      bullets: `Output ONLY a flat bullet-point list of key takeaways. No headings, no paragraphs, no introduction. Start directly with the first bullet point.`,
      curt: `Write exactly 3 sentences maximum. Be blunt, direct, and skip all pleasantries. No headings, no bullets.`,
    };
    const toneInstruction = styleInstructions[tone] || styleInstructions["standard"];
    const focusInstruction = customFocus?.trim()
      ? `\nCRITICAL FOCUS: The user has a specific focus request — "${customFocus.trim()}". Your entire response MUST be shaped around this. Ignore anything in the content that is not relevant to this focus.`
      : "";

    const outputLanguage = targetLanguage || "English";

    let systemPrompt = "";

    if (action === "summarize") {
      systemPrompt = `You are an expert summarizer. ${toneInstruction}${focusInstruction}
CRITICAL LANGUAGE RULE: You MUST write your ENTIRE response in ${outputLanguage} only. Do NOT use any other language anywhere in your response — not in section headings, not in the content, not in any part of the output.`;
    } else if (action === "translate") {
      systemPrompt = `You are an expert translator.${focusInstruction}
CRITICAL RULE: Output ONLY the translated text in ${outputLanguage}. Do NOT add any headings, section titles, markdown formatting, labels, introductions, or explanations. Do NOT include the original text. Just the raw translation itself, nothing else.`;
    } else if (action === "summarize_translate") {
      systemPrompt = `You are an expert summarizer and translator. ${toneInstruction}${focusInstruction}
CRITICAL LANGUAGE RULE: You MUST write your ENTIRE response in ${outputLanguage} only. Do NOT use any other language anywhere in your response.
After applying the summary style above, also include a "## Translation" section with the full translated text in ${outputLanguage}.`;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const actionVerb =
      action === "summarize"
        ? `Summarize the following content. Write your entire response in ${outputLanguage}`
        : action === "translate"
        ? `Translate the following content to ${outputLanguage}. Output only the ${outputLanguage} translation`
        : `Summarize and translate the following content to ${outputLanguage}. Write your entire response in ${outputLanguage}`;

    type OpenAIMessage = { role: string; content: string | unknown[] };
    let messages: OpenAIMessage[] = [];

    if (imageBase64) {
      messages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: `${actionVerb} the text content visible in this image:` },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ],
        },
      ];
    } else if (audioBase64) {
      const audioBytes = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));
      const isVideo = (audioMimeType || "").startsWith("video/");
      const effectiveMime = isVideo ? "video/mp4" : (audioMimeType || "audio/m4a");
      const effectiveExt = isVideo ? "mp4" : (fileName?.split(".").pop() || "m4a");
      const effectiveFileName = isVideo ? `audio.mp4` : (fileName || `audio.${effectiveExt}`);
      const audioBlob = new Blob([audioBytes], { type: effectiveMime });
      const form = new FormData();
      form.append("file", audioBlob, effectiveFileName);
      form.append("model", "whisper-1");

      const transcribeRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiApiKey}` },
        body: form,
      });

      if (!transcribeRes.ok) {
        const err = await transcribeRes.json();
        throw new Error(err.error?.message || "Audio transcription failed");
      }

      const { text: transcript } = await transcribeRes.json();
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${actionVerb} the following transcribed audio:\n\n${transcript}` },
      ];
    } else if (fileBase64) {
      const fileBytes = Uint8Array.from(atob(fileBase64), (c) => c.charCodeAt(0));
      let fileText = new TextDecoder("utf-8", { fatal: false }).decode(fileBytes);
      fileText = fileText.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s{3,}/g, "\n").trim();

      if (fileText.length < 80) {
        throw new Error(
          "Could not extract readable text from this file. Please use a plain text (.txt) file or paste your content directly."
        );
      }

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${actionVerb} the following document content:\n\n${fileText.slice(0, 12000)}` },
      ];
    } else if (url) {
      const urlContent = await fetchUrlContent(url);
      if (!urlContent || urlContent.length < 50) {
        throw new Error("Could not extract content from this URL. Please try a different link.");
      }
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${actionVerb} the following web page content:\n\n${urlContent}` },
      ];
    } else if (text && text.trim()) {
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${actionVerb} the following text:\n\n${text}` },
      ];
    } else {
      return new Response(
        JSON.stringify({ error: "No content provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const model = imageBase64 ? "gpt-4o" : "gpt-4o-mini";

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages, max_tokens: 2000, temperature: 0.7 }),
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
