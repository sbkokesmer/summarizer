import { supabase } from '@/lib/supabase';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const REQUEST_TIMEOUT = 60000;

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
  customFocus?: string;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || SUPABASE_ANON_KEY;
  return {
    Authorization: `Bearer ${token}`,
  };
}

function createTimeoutSignal(): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  return { signal: controller.signal, clear: () => clearTimeout(timeout) };
}

export async function callOpenAI(params: OpenAIRequestParams): Promise<string> {
  if (params.audioBlob || params.audioBase64) {
    return callOpenAIWithAudio(params);
  }

  if (params.fileBlob || params.fileBase64) {
    return callOpenAIWithFile(params);
  }

  const authHeaders = await getAuthHeaders();
  const { signal, clear } = createTimeoutSignal();

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify(params),
      signal,
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || "Something went wrong");
    }

    return data.result;
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    throw err;
  } finally {
    clear();
  }
}

async function callOpenAIWithFile(params: OpenAIRequestParams): Promise<string> {
  const form = new FormData();
  form.append("action", params.action);
  if (params.targetLanguage) form.append("targetLanguage", params.targetLanguage);
  if (params.tone) form.append("tone", params.tone);
  if (params.customFocus) form.append("customFocus", params.customFocus);

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

  const authHeaders = await getAuthHeaders();
  const { signal, clear } = createTimeoutSignal();

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-proxy-file`, {
      method: "POST",
      headers: authHeaders,
      body: form,
      signal,
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || "Something went wrong");
    }

    return data.result;
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    throw err;
  } finally {
    clear();
  }
}

async function callOpenAIWithAudio(params: OpenAIRequestParams): Promise<string> {
  const form = new FormData();
  form.append("action", params.action);
  if (params.targetLanguage) form.append("targetLanguage", params.targetLanguage);
  if (params.tone) form.append("tone", params.tone);
  if (params.customFocus) form.append("customFocus", params.customFocus);

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

  const authHeaders = await getAuthHeaders();
  const { signal, clear } = createTimeoutSignal();

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-proxy-audio`, {
      method: "POST",
      headers: authHeaders,
      body: form,
      signal,
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || "Something went wrong");
    }

    return data.result;
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    throw err;
  } finally {
    clear();
  }
}
