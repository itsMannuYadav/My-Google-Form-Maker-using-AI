import { NextRequest, NextResponse } from "next/server";
import { extractAttachment, AttachmentError } from "@/lib/groq/fileExtraction";

export const runtime = "nodejs";

// Reads an attached file (image, PDF, Word) and returns its content for the browser
// to send to Gemini itself. No API key is involved here, and nothing is stored.
export async function POST(req: NextRequest) {
  try {
    const file = (await req.formData()).get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file was attached." }, { status: 400 });
    }
    return NextResponse.json(await extractAttachment(file));
  } catch (error: any) {
    if (error instanceof AttachmentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("API /api/attachment error:", error?.message);
    return NextResponse.json({ error: "Couldn't read that file. Please try again." }, { status: 500 });
  }
}
