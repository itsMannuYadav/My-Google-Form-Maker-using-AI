"use client";

import React, { useState } from "react";
import { KeyRound, X, ExternalLink, ShieldCheck, Trash2 } from "lucide-react";
import { looksLikeGeminiKey } from "@/lib/geminiKey";

interface ApiKeyModalProps {
  currentKey: string;
  remembered: boolean;
  onSave: (key: string, remember: boolean) => void;
  onRemove: () => void;
  onClose: () => void;
  notice?: string | null;
}

export default function ApiKeyModal({ currentKey, remembered, onSave, onRemove, onClose, notice }: ApiKeyModalProps) {
  const [value, setValue] = useState(currentKey);
  const [error, setError] = useState<string | null>(null);
  const [remember, setRemember] = useState(remembered);

  const handleSave = () => {
    const key = value.trim();
    if (!looksLikeGeminiKey(key)) {
      setError("That doesn't look like a Gemini API key. Copy the whole key from Google AI Studio.");
      return;
    }
    onSave(key, remember);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gov-50 text-gov-800 border border-gov-200">
            <KeyRound className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Use your own free Gemini API key</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Optional. My AI Form Maker works without this. Adding your own key uses your personal
              Google quota instead of ours, which keeps the shared service fast for everyone.
            </p>
          </div>
        </div>

        {notice && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">{notice}</p>
        )}

        <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-700 leading-relaxed">
          <li>
            Open{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 font-semibold text-gov-700 underline hover:text-gov-900"
            >
              Google AI Studio → API keys <ExternalLink className="h-3 w-3" />
            </a>{" "}
            and sign in with a Google account.
          </li>
          <li>Accept the Terms of Service. Google creates a default project and key for you.</li>
          <li>
            Click <span className="font-semibold">Create API key</span> if you don&apos;t see one, then copy it.
          </li>
          <li>Paste it below. No credit card or billing setup is needed for the free tier.</li>
        </ol>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600 leading-relaxed space-y-1">
          <p>
            <span className="font-semibold text-slate-800">Good to know:</span> Google requires users of the
            Gemini API to be 18 or older, and free-tier limits are set per project by Google (see yours in
            AI Studio;{" "}
            <a
              href="https://ai.google.dev/gemini-api/docs/rate-limits"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-900"
            >
              rate limits
            </a>
            ). On the free tier, Google may use your prompts to improve its products (
            <a
              href="https://ai.google.dev/gemini-api/docs/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-900"
            >
              details
            </a>
            ), so avoid sending sensitive content.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="gemini-key" className="text-xs font-semibold text-slate-800">
            Your Gemini API key
          </label>
          <input
            id="gemini-key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            placeholder="Paste your key here"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-gov-700 focus:outline-none focus:ring-1 focus:ring-gov-700"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <label className="flex items-start gap-2 pt-0.5 text-[11px] text-slate-700 leading-relaxed cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300"
            />
            <span>
              Remember on this device. Leave unchecked on a shared or public computer; the key is then
              forgotten when you close the browser tab.
            </span>
          </label>
          <p className="flex items-start gap-1.5 text-[11px] text-slate-500 leading-relaxed">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-px text-emerald-600" />
            <span>
              <span className="font-semibold text-slate-700">Your key never reaches our servers.</span> It
              stays in this browser and is sent only to Google, straight from your device (you can check
              this in your browser&apos;s Network tab). Best practice: create a key just for this site, and
              delete or regenerate it in AI Studio whenever you like.
            </span>
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          {currentKey ? (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove key
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-gov-800 px-4 py-2 text-xs font-semibold text-white hover:bg-gov-900"
            >
              Save key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
