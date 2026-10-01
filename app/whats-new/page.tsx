import Link from "next/link";
import { Sparkles, RefreshCw, Edit3, Undo2, MessageSquareText, Maximize2, LayoutDashboard, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import Screenshot from "@/components/Screenshot";
import type { ScreenshotName } from "@/lib/screenshots";

export const metadata = {
  title: "What's New",
  description: "The latest improvements to My AI Form Maker.",
};

interface Update {
  icon: React.ElementType;
  tag: "New" | "Improved" | "Fixed";
  title: string;
  body: React.ReactNode;
  shots: { name: ScreenshotName; alt: string; frame?: "browser" | "card" | "phone" }[];
  guide?: string;
}

const UPDATES: Update[] = [
  {
    icon: Sparkles,
    tag: "New",
    title: "Made for students and lawyers too",
    body: (
      <>
        The AI now recognises what you are doing. Ask for a quiz and you get a real{" "}
        <strong>auto-graded Google Form quiz</strong> with an answer key and points. Ask for a thesis survey and it adds
        a consent note, Likert scales and optional demographics. Lawyers can start from a{" "}
        <strong>client intake</strong>, witness statement or NDA acknowledgement with consent checkboxes and a
        no-attorney-client-relationship notice. Browse the new templates by audience on the home page.
      </>
    ),
    shots: [],
  },
  {
    icon: RefreshCw,
    tag: "New",
    title: "Update a published form — same link, no duplicates",
    body: (
      <>
        Reopen a published form, make your changes, and click <strong>Update Google Form</strong>. The changes go
        to your existing Google Form instead of creating a new one, so the link you already shared keeps working.
        Published forms now show a <strong>Published</strong> badge in the builder.
      </>
    ),
    shots: [
      { name: "published-builder", alt: "A published form reopened in the builder", frame: "browser" },
      { name: "update-confirm", alt: "The Update your Google Form dialog" },
    ],
    guide: "/help#update-published",
  },
  {
    icon: Edit3,
    tag: "New",
    title: "Keep editing your drafts from the dashboard",
    body: (
      <>
        The <strong>Edit</strong> button on the dashboard now reopens the form in the full builder, with the AI chat
        and the live preview, instead of a read-only summary. The form details page also has an{" "}
        <strong>Edit Form</strong> button.
      </>
    ),
    shots: [{ name: "form-details", alt: "The form details page with the Edit Form button", frame: "browser" }],
    guide: "/help#drafts",
  },
  {
    icon: Undo2,
    tag: "New",
    title: "Undo and copy from your own messages",
    body: (
      <>
        The copy and undo buttons now appear under your messages as well as the AI&apos;s replies. Undoing from
        your message reverts the change that request made.
      </>
    ),
    shots: [{ name: "chat-panel", alt: "Chat messages with copy and undo buttons" }],
    guide: "/help#undo",
  },
  {
    icon: MessageSquareText,
    tag: "New",
    title: "Write your own confirmation message",
    body: (
      <>
        Click the confirmation message at the bottom of the preview to write what respondents see after
        submitting. Google&apos;s API doesn&apos;t let apps set it automatically, so the builder reminds you where
        to paste it in Google Forms.
      </>
    ),
    shots: [{ name: "confirmation-message", alt: "The editable confirmation message card" }],
    guide: "/help#edit-preview",
  },
  {
    icon: Maximize2,
    tag: "Improved",
    title: "More room for your form",
    body: (
      <>
        The preview toolbar and the chat header now scroll away with the content instead of staying pinned, so
        there&apos;s more space for the form — especially on phones.
      </>
    ),
    shots: [
      { name: "mobile-preview", alt: "The form preview on a phone", frame: "phone" },
      { name: "mobile-chat", alt: "The AI chat on a phone", frame: "phone" },
    ],
    guide: "/help#mobile",
  },
  {
    icon: LayoutDashboard,
    tag: "Fixed",
    title: "Saved forms always show on your dashboard",
    body: (
      <>
        Some drafts were saved but didn&apos;t appear on the dashboard. They now show up reliably, sorted by most
        recently updated. Editing a published form also keeps it marked as Published.
      </>
    ),
    shots: [{ name: "dashboard", alt: "The dashboard listing forms", frame: "browser" }],
    guide: "/help#drafts",
  },
];

const TAG_STYLES: Record<Update["tag"], string> = {
  New: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Improved: "bg-gov-50 text-gov-800 border-gov-200",
  Fixed: "bg-amber-50 text-amber-800 border-amber-200",
};

export default function WhatsNewPage() {
  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="mx-auto max-w-4xl w-full px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gov-800 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">What&apos;s New</h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            The latest improvements to My AI Form Maker. For how-to steps, see the{" "}
            <Link href="/help" className="font-semibold text-gov-800 underline hover:text-gov-900">
              User Guide
            </Link>
            .
          </p>
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-full bg-gov-800 px-3 py-1 text-xs font-semibold text-white">September 2026</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="space-y-6">
            {UPDATES.map((u) => {
              const phoneOnly = u.shots.length > 0 && u.shots.every((s) => s.frame === "phone");
              return (
                <article key={u.title} className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gov-50 text-gov-800 border border-gov-200">
                      <u.icon className="h-4 w-4" />
                    </span>
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${TAG_STYLES[u.tag]}`}>
                          {u.tag}
                        </span>
                        <h2 className="text-lg font-bold text-slate-900">{u.title}</h2>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{u.body}</p>
                      {u.guide && (
                        <Link
                          href={u.guide}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gov-800 hover:text-gov-900"
                        >
                          <span>How to use it</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>

                  <div
                    className={
                      phoneOnly
                        ? "grid grid-cols-2 gap-4 max-w-md mx-auto"
                        : u.shots.length > 1
                          ? "grid grid-cols-1 md:grid-cols-2 gap-4 items-center"
                          : ""
                    }
                  >
                    {u.shots.map((s) => (
                      <Screenshot key={s.name} name={s.name} alt={s.alt} frame={s.frame ?? "card"} />
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
