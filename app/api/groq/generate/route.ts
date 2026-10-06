import { NextRequest, NextResponse } from "next/server";
import { processUserFormRequest, GroqRateLimitError } from "@/lib/groq/formGenerator";
import { extractAttachment, AttachmentError, FormAttachment } from "@/lib/groq/fileExtraction";
import { ChatMessage, FormDefinition } from "@/types/form";

export const runtime = "nodejs";

const DEFAULT_FILE_PROMPT = "Create a Google Form based on the attached file.";

function parseJsonField<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (typeof value !== "string" || !value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function POST(req: NextRequest) {
  try {
    let prompt: unknown;
    let chatHistory: ChatMessage[] = [];
    let currentForm: FormDefinition | null = null;
    let attachment: FormAttachment | undefined;

    // Requests with a file attached arrive as multipart form data; plain chat stays JSON.
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      if (file instanceof File) {
        attachment = await extractAttachment(file);
      }
      prompt = String(formData.get("prompt") || "").trim() || (attachment ? DEFAULT_FILE_PROMPT : "");
      chatHistory = parseJsonField(formData.get("chatHistory"), []);
      currentForm = parseJsonField(formData.get("currentForm"), null);
    } else {
      const body = await req.json();
      ({ prompt, chatHistory = [], currentForm = null } = body);
    }

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "A prompt is required to generate or edit the form." },
        { status: 400 }
      );
    }

    const result = await processUserFormRequest(prompt, chatHistory, currentForm, attachment);

    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof AttachmentError) {
      return NextResponse.json({ error: error.message, userFacing: true }, { status: error.status });
    }
    if (error instanceof GroqRateLimitError) {
      return NextResponse.json({ error: error.message, userFacing: true }, { status: 429 });
    }
    console.error("API /api/groq/generate error:", error);
    return NextResponse.json(
      {
        error: "Failed to process form request. Please try again.",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
