"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Shield,
  CheckCircle,
  FileText,
  HelpCircle,
  Layers,
  Lock,
  Zap,
  Users,
  Building,
  GraduationCap,
  Undo2,
  LayoutDashboard,
  RefreshCw,
  Smartphone,
  Edit3,
  BookOpen,
  Scale,
  ClipboardCheck,
} from "lucide-react";
import { FORM_TEMPLATES, AUDIENCE_LABELS, type Audience, type FormTemplate } from "@/lib/useCases";
import Footer from "@/components/Footer";
import Screenshot from "@/components/Screenshot";

const TEMPLATE_ICONS: Record<FormTemplate["icon"], React.ElementType> = {
  GraduationCap, Scale, FileText, Users, Zap, Layers, Building, ClipboardCheck,
};

function FeatureRow({
  icon: Icon,
  eyebrow,
  title,
  body,
  points,
  visual,
  reverse = false,
}: {
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
      <div className={`space-y-4 ${reverse ? "lg:order-2" : ""}`}>
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gov-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gov-50 text-gov-800 border border-gov-200">
            <Icon className="h-4 w-4" />
          </span>
          {eyebrow}
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
        <ul className="space-y-2">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-slate-700">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={reverse ? "lg:order-1" : ""}>{visual}</div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [demoPrompt, setDemoPrompt] = useState("");
  const [audience, setAudience] = useState<Audience>("students");

  const handleStartWithPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoPrompt.trim()) {
      router.push("/create");
    } else {
      router.push(`/create?prompt=${encodeURIComponent(demoPrompt.trim())}`);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-16 sm:pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <Link
              href="/whats-new"
              className="inline-flex items-center gap-2 rounded-full border border-gov-200 bg-gov-50 px-3.5 py-1 text-xs font-semibold text-gov-800 shadow-2xs hover:bg-gov-100 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-gov-600" />
              <span>New: update published forms without changing the link</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Create Google Forms by simply describing what you need.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Tell the AI what your form should collect. It builds the sections and questions, lets you fine-tune
              everything in a live preview, then creates the real Google Form in your Google Drive.
            </p>

            <form onSubmit={handleStartWithPrompt} className="pt-4 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-white border-2 border-gov-800/80 shadow-md focus-within:border-gov-900">
                <input
                  type="text"
                  value={demoPrompt}
                  onChange={(e) => setDemoPrompt(e.target.value)}
                  placeholder="e.g. A 10-question quiz with answers, a client intake form for my law firm, or a thesis survey..."
                  className="w-full px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gov-800 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gov-900 transition-colors shrink-0"
                >
                  <span>Create Form</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>See How It Works</span>
              </a>
              <Link
                href="/help"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span>Read the User Guide</span>
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Zero technical knowledge required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Creates authentic Google Forms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Try instantly as a guest</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-gov-700" />
                <span>Official Google OAuth</span>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-6xl pt-14">
            <Screenshot
              name="builder"
              frame="browser"
              priority
              alt="My AI Form Maker: AI chat on the left and a live Google Form preview on the right"
              caption="Chat with the AI on the left — the live Google Form preview on the right updates with every change."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-semibold text-gov-800 uppercase tracking-wider">Simple 3-Step Process</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">How the platform works</p>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              No need to learn Google Forms settings or question types. Describe it, check it, publish it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                n: 1,
                tone: "bg-gov-50 text-gov-800",
                title: "Describe what you need",
                body: "Type in your own words or pick a quick example. The AI drafts every section and question, and asks a quick follow-up if something is unclear.",
                shot: "chat-empty" as const,
                alt: "The AI assistant chat with starter suggestions and quick examples",
              },
              {
                n: 2,
                tone: "bg-purple-50 text-purple-700",
                title: "Review & fine-tune",
                body: "Ask the AI for changes (“make phone number required”) or edit directly: rename, reorder, duplicate, change types, or mark questions required.",
                shot: "question-editor" as const,
                alt: "The Edit Question dialog with title, hint, type and required settings",
              },
              {
                n: 3,
                tone: "bg-emerald-50 text-emerald-700",
                title: "Create the Google Form",
                body: "Confirm once and the form is created in your Google Drive. You get a shareable link, and you can come back later to update it.",
                shot: "publish-confirm" as const,
                alt: "The Review & Confirm dialog shown before creating the Google Form",
              },
            ].map((step) => (
              <div key={step.n} className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200 space-y-4">
                <Screenshot name={step.shot} alt={step.alt} fitAspect="aspect-[4/3]" crop />
                <div className="space-y-2 px-1">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold ${step.tone}`}>
                      {step.n}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="py-16 sm:py-24 bg-white border-b border-slate-200 scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-gov-800 uppercase tracking-wider">Everything in one place</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Built to get the form right, not just fast
            </p>
          </div>

          <div className="space-y-20">
            <FeatureRow
              icon={Edit3}
              eyebrow="Direct editing"
              title="Edit anything right in the preview"
              body="You are never stuck with what the AI wrote. Every part of the preview is editable with a click."
              points={[
                "Click the title or description to rewrite it in place",
                "Move questions up or down, duplicate, edit or delete them",
                "Add new questions and sections without typing a prompt",
                "Write your own thank-you (confirmation) message",
              ]}
              visual={
                <div className="space-y-4">
                  <Screenshot name="header-edit" alt="Editing the form title inline" />
                  <Screenshot
                    name="question-card"
                    alt="A question card with move, duplicate, edit and delete buttons"
                    caption="Each question has move, duplicate, edit and delete buttons."
                  />
                </div>
              }
            />

            <FeatureRow
              reverse
              icon={Undo2}
              eyebrow="Safe to experiment"
              title="Change your mind? Undo any step"
              body="Every AI change is saved as a step. Undo it from the AI's reply or from your own message, and the form goes back to exactly how it was."
              points={[
                "Undo button under both your messages and the AI's replies",
                "A confirmation step so you never undo by accident",
                "Copy any message with one click",
              ]}
              visual={
                <div className="relative pb-16 sm:pb-20">
                  <Screenshot name="chat-panel" alt="Chat messages with copy and undo buttons" fitAspect="aspect-[4/3]" crop />
                  <div className="absolute bottom-0 right-0 w-3/5 sm:w-1/2 drop-shadow-2xl">
                    <Screenshot name="undo-modal" alt="The Undo this change confirmation dialog" />
                  </div>
                </div>
              }
            />

            <FeatureRow
              icon={LayoutDashboard}
              eyebrow="Dashboard"
              title="All your forms, drafts and published, in one list"
              body="Your work is saved automatically as you go. Pick up any draft later exactly where you left off."
              points={[
                "Draft and Published status at a glance",
                "Search forms by name",
                "Edit reopens the form in the builder; Open goes to the live Google Form",
              ]}
              visual={<Screenshot name="dashboard" frame="browser" alt="The dashboard listing drafts and published forms" />}
            />

            <FeatureRow
              reverse
              icon={RefreshCw}
              eyebrow="Update published forms"
              title="Update a live form — the link stays the same"
              body="Already shared your form? Reopen it, make changes, and click Update Google Form. The changes go to the same Google Form, so the link you shared keeps working."
              points={[
                "Published forms show a “Published” badge and an Update button",
                "No duplicate forms in your Drive",
                "Existing responses are kept",
              ]}
              visual={<Screenshot name="update-confirm" alt="The Update your Google Form confirmation dialog" />}
            />

            <FeatureRow
              icon={Smartphone}
              eyebrow="Mobile friendly"
              title="Works on your phone, too"
              body="Switch between the AI chat and the preview with one tap. Headers scroll away so the form gets the whole screen."
              points={["Separate Chat and Preview tabs", "Full dashboard on mobile", "Same features as desktop"]}
              visual={
                <div className="grid grid-cols-3 gap-3 sm:gap-5">
                  <Screenshot name="mobile-chat" frame="phone" alt="AI chat on a phone" />
                  <Screenshot name="mobile-preview" frame="phone" alt="Form preview on a phone" />
                  <Screenshot name="mobile-dashboard" frame="phone" alt="Dashboard on a phone" />
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* Example Use Cases */}
      <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-gov-800 uppercase tracking-wider">Popular Form Templates</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Built for classrooms, law firms and offices</p>
            <p className="mt-3 text-sm text-slate-600">Pick your world, then click any template to open it in the builder and start customising.</p>
          </div>

          <div role="tablist" aria-label="Template audience" className="mb-10 flex flex-wrap justify-center gap-2">
            {(Object.keys(AUDIENCE_LABELS) as Audience[]).map((key) => (
              <button
                key={key}
                role="tab"
                aria-selected={audience === key}
                onClick={() => setAudience(key)}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                  audience === key
                    ? "border-gov-800 bg-gov-800 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-gov-300"
                }`}
              >
                {AUDIENCE_LABELS[key]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FORM_TEMPLATES.filter((t) => t.audience === audience).map((item, idx) => {
              const Icon = TEMPLATE_ICONS[item.icon];
              return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-sm hover:border-gov-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gov-800 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/60">
                  <button
                    onClick={() => router.push(`/create?prompt=${encodeURIComponent(item.prompt)}`)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gov-800 hover:text-gov-900"
                  >
                    <span>Try this template</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security and Trust Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3.5 py-1 text-xs font-semibold text-emerald-400">
                <Lock className="h-3.5 w-3.5" />
                <span>Data Security & Privacy First</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Your forms and responses stay in your Google account.</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Forms are created directly inside your Google Drive, so you own them completely. We save your form
                drafts so you can come back to them, but we never see or store the answers people submit.
              </p>
              <Link href="/privacy" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                <span>Read our Privacy Policy</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-800/80 p-5 border border-slate-700 space-y-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-semibold">Direct Google API</h3>
                <p className="text-xs text-slate-400">
                  Uses the official Google Forms API with standard OAuth2 sign-in. Permissions are limited to forms My AI Form Maker creates.
                </p>
              </div>

              <div className="rounded-xl bg-slate-800/80 p-5 border border-slate-700 space-y-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-semibold">Zero Response Harvesting</h3>
                <p className="text-xs text-slate-400">
                  Responses submitted to your forms go straight to your private Google account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-semibold text-gov-800 uppercase tracking-wider">FAQ</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Does this create a real Google Form?",
                a: "Yes. The app uses the official Google Forms API to create a genuine Google Form in your Google Drive, with all the questions, types and sections you approved.",
              },
              {
                q: "Can I change a form after I've published it?",
                a: "Yes. Open it from your dashboard, make changes with the AI or the edit buttons, and click “Update Google Form”. The changes are applied to the same form, so the link you shared keeps working.",
              },
              {
                q: "Can I try it without signing in with Google?",
                a: "Yes — choose “Continue as Administrative Guest” on the sign-in page. You can build and edit forms, and drafts are kept in that browser. To create the real Google Form you'll need to sign in with Google.",
              },
              {
                q: "What if the AI gets something wrong?",
                a: "Tell it what to fix in plain words, edit the question yourself in the preview, or press the undo button on that step to go back.",
              },
              {
                q: "Will my custom thank-you message appear in Google Forms?",
                a: "Google's API doesn't let apps set the confirmation message, so after publishing, paste it in Google Forms under Settings → Presentation. The builder reminds you of this.",
              },
              {
                q: "What Google permissions are needed?",
                a: "Only permission to create and manage the Google Forms and files My AI Form Maker creates. We never access your other Drive files or your email.",
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-2">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-gov-700 shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-slate-500">
            More answers, with screenshots, in the{" "}
            <Link href="/help" className="font-semibold text-gov-800 underline hover:text-gov-900">
              User Guide
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 bg-gov-900 text-white text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Ready to create your Google Form?</h2>
          <p className="text-sm text-gov-200 max-w-xl mx-auto">
            Describe your form in a sentence. Let the AI do the heavy lifting.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-gov-900 shadow-md hover:bg-slate-100 transition-colors"
            >
              <span>Start Building a Form</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>User Guide</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
