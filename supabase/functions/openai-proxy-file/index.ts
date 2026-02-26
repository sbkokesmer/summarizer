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
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["summarize", "translate", "summarize_translate"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const toneInstruction = tone && tone !== "standard"
      ? `Use a ${tone} tone in your response.`
      : "Use a clear, professional tone.";

    let extractedText = "";
    const mimeType = file.type || "";
    const fileName = file.name || "file";

    if (mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
      const uploadForm = new FormData();
      uploadForm.append("file", file, fileName);
      uploadForm.append("purpose", "assistants");

      const uploadRes = await fetch("https://api.openai.com/v1/files", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiApiKey}` },
        body: uploadForm,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error?.message || "Failed to upload PDF to OpenAI");
      }

      const uploadedFile = await uploadRes.json();
      const fileId = uploadedFile.id;

      const toneInst = toneInstruction;
      const lang = targetLanguage;

      let systemPrompt = "";
      let userPrompt = "";

      if (action === "summarize") {
        systemPrompt = `You are an expert summarizer. ${toneInst}
CRITICAL LANGUAGE RULE: Write your ENTIRE response in ${lang} only.
Return markdown with a TL;DR section and Key Takeaways section in ${lang}.`;
        userPrompt = `Summarize the content of this PDF document. Write your entire response in ${lang}.`;
      } else if (action === "translate") {
        systemPrompt = `You are an expert translator. ${toneInst}
CRITICAL RULE: Output ONLY the translated text in ${lang}. No headings, no labels, no markdown formatting. Just the raw translation.`;
        userPrompt = `Translate all text content from this PDF to ${lang}. Output only the translation.`;
      } else {
        systemPrompt = `You are an expert summarizer and translator. ${toneInst}
CRITICAL LANGUAGE RULE: Write your ENTIRE response in ${lang} only.
Return markdown with: TL;DR section, Key Takeaways section, Translation section. All in ${lang}.`;
        userPrompt = `Summarize and translate the content of this PDF to ${lang}. Write your entire response in ${lang}.`;
      }

      const completionRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: userPrompt,
                },
                {
                  type: "file",
                  file: { file_id: fileId },
                },
              ],
            },
          ],
          max_tokens: 4000,
          temperature: 0.7,
        }),
      });

      await fetch(`https://api.openai.com/v1/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${openaiApiKey}` },
      });

      if (!completionRes.ok) {
        const errData = await completionRes.json();
        throw new Error(errData.error?.message || "OpenAI API error");
      }

      const completionData = await completionRes.json();
      const result = completionData.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fileBytes = await file.arrayBuffer();
    extractedText = new TextDecoder("utf-8", { fatal: false })
      .decode(new Uint8Array(fileBytes))
      .replace(/[^\x20-\x7E\n\r\t]/g, " ")
      .replace(/\s{3,}/g, "\n")
      .trim();

    if (extractedText.length < 80) {
      throw new Error("Could not extract readable text from this file. Please use a PDF or plain text (.txt) file.");
    }

    const truncated = extractedText.slice(0, 20000);

    let systemPrompt = "";
    let actionVerb = "";

    if (action === "summarize") {
      systemPrompt = `You are an expert summarizer. ${toneInstruction}
CRITICAL LANGUAGE RULE: Write your ENTIRE response in ${targetLanguage} only.
Return markdown with a TL;DR section and Key Takeaways section in ${targetLanguage}.`;
      actionVerb = `Summarize the following document content. Write your entire response in ${targetLanguage}`;
    } else if (action === "translate") {
      systemPrompt = `You are an expert translator. ${toneInstruction}
CRITICAL RULE: Output ONLY the translated text in ${targetLanguage}. No headings, labels, or formatting. Just the raw translation.`;
      actionVerb = `Translate the following document content to ${targetLanguage}. Output only the translation`;
    } else {
      systemPrompt = `You are an expert summarizer and translator. ${toneInstruction}
CRITICAL LANGUAGE RULE: Write your ENTIRE response in ${targetLanguage} only.
Return markdown with: TL;DR section, Key Takeaways section, Translation section. All in ${targetLanguage}.`;
      actionVerb = `Summarize and translate the following document content to ${targetLanguage}. Write your entire response in ${targetLanguage}`;
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${actionVerb}:\n\n${truncated}` },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      throw new Error(errorData.error?.message || "OpenAI API error");
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
