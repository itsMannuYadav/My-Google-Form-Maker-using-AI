import { Groq } from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import type { FormAttachment } from "./fileExtraction";
import { FormDefinition, ChatMessage } from "@/types/form";
import { AIFormResponseSchema, AIFormResponseType } from "@/lib/validation/formSchema";
import { SYSTEM_PROMPT, ATTACHMENT_PROMPT, sanitizeAndNormalizeForm } from "@/lib/ai/formPrompt";
import { generateSmartFallbackForm } from "./fallbackGenerator";

const CANDIDATE_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
  "allam-2-7b"
];

// The only Groq model that currently accepts image input.
const VISION_MODEL = "qwen/qwen3.8-27b";

// Reasoning models must not put their reasoning into the content when JSON mode
// is on (Qwen's default "raw" format is rejected with a 400 in JSON mode).
function reasoningParams(model: string) {
  if (model.startsWith("qwen/")) return { reasoning_format: "hidden" as const };
  if (model.startsWith("openai/gpt-oss")) return { include_reasoning: false };
  return {};
}

export class GroqRateLimitError extends Error {}

export async function processUserFormRequest(
  userMessage: string,
  chatHistory: ChatMessage[],
  currentForm?: FormDefinition | null,
  attachment?: FormAttachment
): Promise<AIFormResponseType> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    if (attachment) {
      throw new Error("Reading files requires the AI service, which is not configured.");
    }
    return generateSmartFallbackForm(userMessage, currentForm);
  }

  const groq = new Groq({ apiKey });

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: attachment ? SYSTEM_PROMPT + ATTACHMENT_PROMPT : SYSTEM_PROMPT },
  ];

  // Include recent conversation context
  chatHistory.slice(-6).forEach((msg) => {
    messages.push({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content,
    });
  });

  const promptContent = currentForm
    ? `Current Form Draft:\n${JSON.stringify(currentForm, null, 2)}\n\nUser Request: ${userMessage}`
    : `User Request: ${userMessage}`;

  if (attachment?.kind === "image") {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: `${promptContent}\n\n(Attached image: ${attachment.name})` },
        { type: "image_url", image_url: { url: attachment.dataUrl } },
      ],
    });
  } else if (attachment?.kind === "document") {
    const note = attachment.truncated ? "\n[Document was long and has been truncated.]" : "";
    messages.push({
      role: "user",
      content: `${promptContent}\n\nAttached document "${attachment.name}":\n<document>\n${attachment.text}\n</document>${note}`,
    });
  } else {
    messages.push({ role: "user", content: promptContent });
  }

  const models = attachment?.kind === "image" ? [VISION_MODEL] : CANDIDATE_MODELS;
  let rateLimited = false;

  // Try candidate models in order of capability
  for (const model of models) {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages,
        model,
        temperature: 0.3,
        response_format: { type: "json_object" },
        ...reasoningParams(model),
      });

      const responseText = chatCompletion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(responseText);

      // Validate or safely sanitize output
      const validated = AIFormResponseSchema.safeParse(parsed);
      if (validated.success) {
        return validated.data;
      } else {
        return sanitizeAndNormalizeForm(parsed, currentForm);
      }
    } catch (err: any) {
      if (err instanceof Groq.RateLimitError) rateLimited = true;
      console.warn(`Groq model ${model} failed, trying next candidate:`, err?.message);
    }
  }

  // The keyword-based fallback can't read files, so report the failure instead.
  if (attachment) {
    if (rateLimited) {
      throw new GroqRateLimitError("The AI is busy right now. Please wait a minute and try again.");
    }
    throw new Error("The AI couldn't read that file. Please try again or describe the form in text.");
  }

  return generateSmartFallbackForm(userMessage, currentForm);
}
