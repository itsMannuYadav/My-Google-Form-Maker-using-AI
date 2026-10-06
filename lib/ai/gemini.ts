import type { FormAttachment } from "@/lib/groq/fileExtraction";

// Calls the Gemini API (generateContent, v1beta) straight from the browser with the user's own key.
// Docs: https://ai.google.dev/api/generate-content
// The key never goes through our server.
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

// Stable models available on Gemini's free tier, best first
// (https://ai.google.dev/gemini-api/docs/pricing).
export const GEMINI_MODELS = ["gemini-3.8-flash", "gemini-3.5-flash-lite"];

export type GeminiKeyProblem = "invalid" | "rate-limit" | "unavailable";

export class GeminiKeyError extends Error {
  constructor(message: string, public problem: GeminiKeyProblem, public status: number) {
    super(message);
  }
}

interface GeminiMessage {
  role: "user" | "assistant";
  content: string;
}

function toGeminiParts(text: string, attachment?: FormAttachment) {
  const parts: Record<string, unknown>[] = [{ text }];
  if (attachment?.kind === "image") {
    // dataUrl looks like "data:image/jpeg;base64,<data>"
    const url = attachment.dataUrl;
    const comma = url.indexOf(",");
    const mimeType = url.slice(5, url.indexOf(";"));
    if (url.startsWith("data:") && comma > 0) {
      parts.push({ inlineData: { mimeType, data: url.slice(comma + 1) } });
    }
  }
  return parts;
}

async function callModel(apiKey: string, model: string, body: unknown): Promise<string> {
  const res = await fetch(`${GEMINI_ENDPOINT}/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg: string = errBody?.error?.message || "";
    if (res.status === 429) {
      throw new GeminiKeyError(
        "Your Gemini API key has hit its free-tier limit. Wait a minute and try again, or check your limits in Google AI Studio.",
        "rate-limit",
        429
      );
    }
    if (res.status === 401 || res.status === 403 || /api key/i.test(msg)) {
      throw new GeminiKeyError(
        "Google rejected your Gemini API key. Please check it, or create a new one in Google AI Studio.",
        "invalid",
        401
      );
    }
    // 400 (e.g. free tier unavailable), 404 (model), 5xx: let the caller try the next model.
    throw new GeminiKeyError(msg || `Gemini request failed (${res.status}).`, "unavailable", res.status);
  }

  const data = await res.json();
  const text = (data?.candidates?.[0]?.content?.parts ?? [])
    .filter((p: any) => typeof p?.text === "string" && !p.thought)
    .map((p: any) => p.text)
    .join("");
  if (!text) throw new GeminiKeyError("Gemini returned an empty response.", "unavailable", 502);
  return text;
}

export async function generateWithGemini(
  apiKey: string,
  systemPrompt: string,
  history: GeminiMessage[],
  userText: string,
  attachment?: FormAttachment
): Promise<string> {
  const contents = [
    ...history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: toGeminiParts(userText, attachment) },
  ];

  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
  };

  let lastError: GeminiKeyError | null = null;
  for (const model of GEMINI_MODELS) {
    try {
      return await callModel(apiKey, model, body);
    } catch (err) {
      if (!(err instanceof GeminiKeyError)) throw err;
      // A bad key or exhausted quota will not improve on another model.
      if (err.problem === "invalid") throw err;
      lastError = err;
      if (err.problem === "rate-limit") continue;
    }
  }
  throw lastError ?? new GeminiKeyError("Gemini is unavailable right now.", "unavailable", 502);
}
