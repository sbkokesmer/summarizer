const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

type Action = "summarize" | "translate" | "summarize_translate";

export interface OpenAIRequestParams {
  action: Action;
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
}

export async function callOpenAI(params: OpenAIRequestParams): Promise<string> {
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
