const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

type Action = "summarize" | "translate" | "summarize_translate";

export interface OpenAIRequestParams {
  action: Action;
  text?: string;
  fileBase64?: string;
  fileMimeType?: string;
  fileName?: string;
  fileBlob?: Blob;
  imageBase64?: string;
  audioBase64?: string;
  audioMimeType?: string;
  audioBlob?: Blob;
  url?: string;
  targetLanguage?: string;
  tone?: string;
}

export async function callOpenAI(params: OpenAIRequestParams): Promise<string> {
  if (params.audioBlob || params.audioBase64) {
    return callOpenAIWithAudio(params);
  }

  if (params.fileBlob || params.fileBase64) {
    return callOpenAIWithFile(params);
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-proxy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || "Something went wrong");
  }

  return data.result;
}

async function callOpenAIWithFile(params: OpenAIRequestParams): Promise<string> {
  const form = new FormData();
  form.append("action", params.action);
  if (params.targetLanguage) form.append("targetLanguage", params.targetLanguage);
  if (params.tone) form.append("tone", params.tone);

  if (params.fileBlob) {
    form.append("file", params.fileBlob, params.fileName || "document");
  } else if (params.fileBase64) {
    const mimeType = params.fileMimeType || "application/octet-stream";
    const byteChars = atob(params.fileBase64);
    const bytes = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      bytes[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    form.append("file", blob, params.fileName || "document");
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-proxy-file`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: form,
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || "Something went wrong");
  }

  return data.result;
}

async function callOpenAIWithAudio(params: OpenAIRequestParams): Promise<string> {
  const form = new FormData();
  form.append("action", params.action);
  if (params.targetLanguage) form.append("targetLanguage", params.targetLanguage);
  if (params.tone) form.append("tone", params.tone);

  if (params.audioBlob) {
    const ext = (params.fileName?.split(".").pop() || "mp3").toLowerCase();
    form.append("audio", params.audioBlob, params.fileName || `audio.${ext}`);
  } else if (params.audioBase64) {
    const mimeType = params.audioMimeType || "audio/mpeg";
    const byteChars = atob(params.audioBase64);
    const bytes = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      bytes[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    const ext = (params.fileName?.split(".").pop() || "mp3").toLowerCase();
    form.append("audio", blob, params.fileName || `audio.${ext}`);
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-proxy-audio`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: form,
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || "Something went wrong");
  }

  return data.result;
}
