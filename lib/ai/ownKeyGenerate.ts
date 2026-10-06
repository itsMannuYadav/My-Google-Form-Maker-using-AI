import type { ChatMessage, FormDefinition } from "@/types/form";
import type { AIFormResponseType } from "@/lib/validation/formSchema";
import type { FormAttachment } from "@/lib/groq/fileExtraction";
import { SYSTEM_PROMPT, ATTACHMENT_PROMPT, buildUserText, recentHistory, parseAIFormResponse } from "./formPrompt";
import { generateWithGemini } from "./gemini";

export class OwnKeyUserError extends Error {}

// Runs a form request entirely in the browser with the user's own Gemini key.
// Only an attached file is sent to our server (to extract its text), and without the key.
export async function generateWithOwnKey(opts: {
  apiKey: string;
  prompt: string;
  chatHistory: ChatMessage[];
  currentForm: FormDefinition | null;
  file?: File;
}): Promise<AIFormResponseType> {
  let attachment: FormAttachment | undefined;
  if (opts.file) {
    const body = new FormData();
    body.append("file", opts.file);
    const res = await fetch("/api/attachment", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new OwnKeyUserError(data.error || "Couldn't read that file. Please try again.");
    attachment = data as FormAttachment;
  }

  const responseText = await generateWithGemini(
    opts.apiKey,
    attachment ? SYSTEM_PROMPT + ATTACHMENT_PROMPT : SYSTEM_PROMPT,
    recentHistory(opts.chatHistory),
    buildUserText(opts.prompt, opts.currentForm, attachment),
    attachment
  );

  try {
    return parseAIFormResponse(responseText, opts.currentForm);
  } catch {
    throw new OwnKeyUserError("Gemini returned an unreadable response. Please try again.");
  }
}
