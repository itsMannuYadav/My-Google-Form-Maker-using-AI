"use client";

import { STARTER_PROMPTS } from "@/lib/useCases";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { FormDefinition, FormQuestion, ChatMessage } from "@/types/form";
import { saveFormDraft, updateFormPublication, getFormById } from "@/lib/firebase/firestore";
import ChatPanel from "@/components/form-builder/ChatPanel";
import FormPreview from "@/components/form-builder/FormPreview";
import QuestionEditorModal from "@/components/form-builder/QuestionEditorModal";
import CreateSuccessModal from "@/components/form-builder/CreateSuccessModal";
import { Sparkles, ArrowLeft, Loader2, AlertTriangle, ExternalLink, CheckCircle2, ShieldAlert, LogIn, MessageSquare, Eye } from "lucide-react";
import Link from "next/link";
import { generateId } from "@/lib/utils";
import { downscaleImage } from "@/lib/imageResize";
import { generateWithOwnKey, OwnKeyUserError } from "@/lib/ai/ownKeyGenerate";
import { GeminiKeyError } from "@/lib/ai/gemini";
import ApiKeyModal from "@/components/form-builder/ApiKeyModal";
import { getStoredGeminiKey, storeGeminiKey, clearStoredGeminiKey } from "@/lib/geminiKey";

function CreateFormContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt");
  const editFormId = searchParams.get("formId");
  const router = useRouter();
  const { user, googleAccessToken, signInWithGoogle } = useAuth();

  const [formDef, setFormDef] = useState<FormDefinition | null>(null);
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);
  const [linkedGoogleFormId, setLinkedGoogleFormId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingExistingForm, setLoadingExistingForm] = useState(Boolean(editFormId));
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [geminiKey, setGeminiKey] = useState("");
  const [keyRemembered, setKeyRemembered] = useState(false);
  const [keyModal, setKeyModal] = useState<{ open: boolean; notice?: string | null }>({ open: false });
  const [mobileTab, setMobileTab] = useState<"chat" | "preview">("chat");

  // Question modal editor
  const [editingQuestion, setEditingQuestion] = useState<FormQuestion | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Publish confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Reset confirmation modal
  const [showResetModal, setShowResetModal] = useState(false);

  // Error / API Enable Required modal
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isApiDisabled?: boolean;
    isPermissionError?: boolean;
    isAuthRequired?: boolean;
    enableUrl?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  // Success modal
  const [successData, setSuccessData] = useState<{
    isOpen: boolean;
    formTitle: string;
    responderUri: string;
    editUri?: string;
    googleFormId: string;
  }>({
    isOpen: false,
    formTitle: "",
    responderUri: "",
    editUri: "",
    googleFormId: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const stored = getStoredGeminiKey();
    setGeminiKey(stored.key);
    setKeyRemembered(stored.remembered);
  }, []);

  // Initial welcome message, or load an existing saved form for editing
  useEffect(() => {
    if (editFormId) {
      setLoadingExistingForm(true);
      getFormById(editFormId)
        .then((record) => {
          if (record) {
            setFormDef(record.formDefinition);
            setCurrentFormId(record.id);
            setLinkedGoogleFormId(record.googleFormId || null);
            setMessages([
              {
                id: "msg_welcome",
                sender: "assistant",
                content: `Loaded your saved form "${record.title}". Ask me to make changes, or use the buttons on the preview to edit questions directly.`,
                timestamp: Date.now(),
              },
            ]);
          } else {
            setMessages([
              {
                id: "msg_welcome",
                sender: "assistant",
                content: "I couldn't find that saved form — it may have been deleted. Tell me what form you would like to create instead.",
                timestamp: Date.now(),
              },
            ]);
          }
        })
        .finally(() => setLoadingExistingForm(false));
      return;
    }

    const welcomeMsg: ChatMessage = {
      id: "msg_welcome",
      sender: "assistant",
      content:
        "Hello! I'm My AI Form Maker, your Google Forms assistant. Describe what information your form should collect (for example: a graded quiz, a thesis survey, a client intake form for a law firm, an NDA acknowledgement, or a student registration) and I will design it for you.",
      timestamp: Date.now(),
      suggestions: STARTER_PROMPTS,
    };
    setMessages([welcomeMsg]);

    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt.trim());
    }
  }, [initialPrompt, editFormId]);

  const handleSendMessage = async (userPrompt: string, file?: File) => {
    if ((!userPrompt.trim() && !file) || loading) return;

    const userMsg: ChatMessage = {
      id: generateId("msg"),
      sender: "user",
      content: userPrompt.trim() || "Create a form from this file.",
      timestamp: Date.now(),
      attachmentName: file?.name,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    // Snapshot the form exactly as it is before this request is applied,
    // so the resulting assistant message can be undone back to this state.
    const formSnapshotBefore = formDef;

    try {
      const showAssistantError = (content: string) =>
        setMessages((prev) => [
          ...prev,
          { id: generateId("msg"), sender: "assistant", content, timestamp: Date.now() },
        ]);

      let data: any;
      const ownKey = geminiKey || getStoredGeminiKey().key;

      if (ownKey) {
        // The user's own Gemini key is used here in the browser and goes only to Google.
        try {
          data = await generateWithOwnKey({
            apiKey: ownKey,
            prompt: userPrompt.trim() || "Create a Google Form based on the attached file.",
            chatHistory: newHistory,
            currentForm: formDef,
            file: file ? await downscaleImage(file) : undefined,
          });
        } catch (err) {
          if (err instanceof GeminiKeyError) {
            showAssistantError(err.message);
            if (err.problem === "invalid") setKeyModal({ open: true, notice: err.message });
            return;
          }
          if (err instanceof OwnKeyUserError) {
            showAssistantError(err.message);
            return;
          }
          throw err;
        }
      } else {
        let response: Response;
        if (file) {
          const body = new FormData();
          body.append("file", await downscaleImage(file));
          body.append("prompt", userPrompt);
          body.append("chatHistory", JSON.stringify(newHistory));
          body.append("currentForm", JSON.stringify(formDef));
          response = await fetch("/api/groq/generate", { method: "POST", body });
        } else {
          response = await fetch("/api/groq/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: userPrompt,
              chatHistory: newHistory,
              currentForm: formDef,
            }),
          });
        }

        data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (data.userFacing) {
            showAssistantError(data.error);
            return;
          }
          throw new Error(data.error || "Failed to process form request.");
        }
      }

      const assistantMsg: ChatMessage = {
        id: generateId("msg"),
        sender: "assistant",
        content: data.reply || "I have updated your form definition.",
        timestamp: Date.now(),
        suggestions: data.suggestions || [],
        isClarification: data.isClarification,
        formSnapshotBefore: data.formDefinition ? formSnapshotBefore : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (data.formDefinition) {
        setFormDef(data.formDefinition);
        setMobileTab("preview");
        if (user) {
          saveFormDraft(user.uid, data.formDefinition, currentFormId || undefined).then((rec) => {
            setCurrentFormId(rec.id);
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: generateId("msg"),
        sender: "assistant",
        content:
          "I ran into an issue understanding that specific request. I've preserved your current draft. You can try phrasing it simply (e.g. 'Add email field' or 'Make mobile mandatory').",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateForm = (updated: FormDefinition) => {
    setFormDef(updated);
    if (user) {
      saveFormDraft(user.uid, updated, currentFormId || undefined).then((rec) => {
        setCurrentFormId(rec.id);
      });
    }
  };

  const handleUndoMessage = (message: ChatMessage) => {
    if (message.formSnapshotBefore === undefined) return;
    const snapshot = message.formSnapshotBefore;

    setFormDef(snapshot);
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, undone: true } : m))
    );
    setMobileTab("preview");

    if (user && snapshot) {
      saveFormDraft(user.uid, snapshot, currentFormId || undefined).then((rec) => {
        setCurrentFormId(rec.id);
      });
    }

    showToast("Change undone. Form reverted.");
  };

  const handleOpenQuestionEditor = (q: FormQuestion) => {
    setEditingQuestion(q);
    setIsEditorOpen(true);
  };

  const handleSaveQuestionEdit = (updatedQ: FormQuestion) => {
    if (!formDef) return;
    const updated = JSON.parse(JSON.stringify(formDef)) as FormDefinition;
    updated.sections.forEach((sec) => {
      const idx = sec.questions.findIndex((q) => q.id === updatedQ.id);
      if (idx >= 0) {
        sec.questions[idx] = updatedQ;
      }
    });
    handleUpdateForm(updated);
    showToast("Question updated successfully.");
  };

  const handleSaveDraftManually = async () => {
    if (!formDef) return;
    if (!user) {
      showToast("Please sign in with Google to save drafts.");
      return;
    }
    const rec = await saveFormDraft(user.uid, formDef, currentFormId || undefined);
    setCurrentFormId(rec.id);
    showToast("Draft saved to Dashboard!");
  };

  const handlePublishConfirmed = async () => {
    if (!formDef) return;

    // Check if user has Google Auth token
    if (!user || user.isDemo || !googleAccessToken) {
      setShowConfirmModal(false);
      setErrorModal({
        isOpen: true,
        title: "Google Authentication Required",
        message: "To create the form directly in your Google Drive, please sign in with your Google account.",
        isAuthRequired: true,
      });
      return;
    }

    setIsPublishing(true);
    setShowConfirmModal(false);

    try {
      let recordId = currentFormId;
      if (user) {
        const rec = await saveFormDraft(user.uid, formDef, currentFormId || undefined);
        recordId = rec.id;
        setCurrentFormId(rec.id);
      }

      const res = await fetch("/api/google/create-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formDefinition: formDef,
          accessToken: googleAccessToken,
          googleFormId: linkedGoogleFormId,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.isApiDisabled) {
          setErrorModal({
            isOpen: true,
            title: "Enable Google Forms API in Google Cloud",
            message: "The Google Forms API is currently disabled on your Google Cloud project (gov-form-maker-mannu). Click the button below to enable it in 10 seconds, then try again.",
            isApiDisabled: true,
            enableUrl: result.enableUrl,
          });
          return;
        }

        if (result.isPermissionError) {
          setErrorModal({
            isOpen: true,
            title: "Google Permissions Required",
            message: "Your Google session requires permission to create Google Forms in your Drive. Please click below to reconnect your Google account.",
            isPermissionError: true,
          });
          return;
        }

        throw new Error(result.error || "Failed to create Google Form.");
      }

      if (recordId) {
        await updateFormPublication(
          recordId,
          result.googleFormId,
          result.responderUri,
          result.editUri
        );
      }
      setLinkedGoogleFormId(result.googleFormId);

      if (result.updated) {
        showToast("Your Google Form has been updated.");
        return;
      }

      setSuccessData({
        isOpen: true,
        formTitle: formDef.title,
        responderUri: result.responderUri,
        editUri: result.editUri,
        googleFormId: result.googleFormId,
      });
    } catch (err: any) {
      setErrorModal({
        isOpen: true,
        title: "Form Creation Notice",
        message: err.message || "An unexpected error occurred while communicating with Google Forms API. Your draft has been kept safe.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const executeReset = () => {
    setFormDef(null);
    setCurrentFormId(null);
    setLinkedGoogleFormId(null);
    setShowResetModal(false);
    setMessages([
      {
        id: "msg_welcome",
        sender: "assistant",
        content: "Ready! Tell me what form you would like to create.",
        timestamp: Date.now(),
        suggestions: STARTER_PROMPTS,
      },
    ]);
  };

  if (loadingExistingForm) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 app-shell-height">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gov-800 border-t-transparent" />
          <span>Loading your form…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col app-shell-height overflow-hidden bg-white relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:text-slate-900 font-medium text-slate-500 shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <span className="shrink-0">/</span>
          <span className="font-semibold text-slate-800 truncate">
            {formDef?.title || "Untitled form"}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            My AI Form Maker
          </span>
        </div>
      </div>

      {/* Mobile Tab Switcher: Chat <-> Preview */}
      <div className="flex md:hidden shrink-0 border-b border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => setMobileTab("chat")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            mobileTab === "chat"
              ? "border-gov-800 text-gov-800"
              : "border-transparent text-slate-500"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>AI Chat</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            mobileTab === "preview"
              ? "border-gov-800 text-gov-800"
              : "border-transparent text-slate-500"
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>Preview</span>
          {formDef && (
            <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-gov-100 text-gov-800 text-[10px] font-bold">
              {formDef.sections.reduce((acc, s) => acc + s.questions.length, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Main Dual-Pane Workspace */}
      <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-12 overflow-hidden">
        {/* Left Pane: AI Chat Assistant (5 cols) */}
        <div
          className={`${
            mobileTab === "chat" ? "flex" : "hidden"
          } md:flex flex-col flex-1 md:col-span-5 h-full min-h-0 overflow-hidden border-b md:border-b-0 md:border-r border-slate-200`}
        >
          <ChatPanel
            messages={messages}
            loading={loading}
            onSendMessage={handleSendMessage}
            onResetChat={() => setShowResetModal(true)}
            onUndoMessage={handleUndoMessage}
            hasOwnKey={Boolean(geminiKey)}
            onOpenApiKey={() => setKeyModal({ open: true })}
          />
        </div>

        {/* Right Pane: Live Interactive Preview (7 cols) */}
        <div
          className={`${
            mobileTab === "preview" ? "flex" : "hidden"
          } md:flex flex-col flex-1 md:col-span-7 h-full min-h-0 overflow-hidden`}
        >
          <FormPreview
            formDef={formDef}
            onUpdateForm={handleUpdateForm}
            onOpenQuestionEditor={handleOpenQuestionEditor}
            onPublishClick={() => setShowConfirmModal(true)}
            onSaveDraftClick={user ? handleSaveDraftManually : undefined}
            isPublishing={isPublishing}
            isPublished={Boolean(linkedGoogleFormId)}
          />
        </div>
      </div>

      {/* Question Edit Modal */}
      <QuestionEditorModal
        question={editingQuestion}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveQuestionEdit}
        isQuiz={!!formDef?.isQuiz}
      />

      {/* Confirmation Before Creation Modal (Section 17) */}
      {showConfirmModal && formDef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gov-800 uppercase tracking-wider">
                Review & Confirm
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                {linkedGoogleFormId ? "Update your Google Form?" : "Ready to create your Google Form?"}
              </h3>
              <p className="text-xs text-slate-500">
                {linkedGoogleFormId
                  ? "We will apply these changes to your existing Google Form — the same link stays valid for respondents."
                  : "We will generate this form directly in your Google account using the Google Forms API."}
              </p>
              {linkedGoogleFormId && (
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
                  Existing responses are kept. If the form already has responses, answers to edited
                  questions may show up as separate columns in your response sheet.
                </p>
              )}
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Title:</span>
                <span className="font-semibold text-slate-900">{formDef.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sections:</span>
                <span className="font-semibold text-slate-900">{formDef.sections.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Questions:</span>
                <span className="font-semibold text-slate-900">
                  {formDef.sections.reduce((acc, s) => acc + s.questions.length, 0)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ← Keep Editing
              </button>
              <button
                onClick={handlePublishConfirmed}
                className="inline-flex items-center gap-2 rounded-xl bg-gov-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-gov-900 transition-colors"
              >
                <Sparkles className="h-4 w-4 text-gov-200" />
                <span>{linkedGoogleFormId ? "Confirm & Update Google Form" : "Confirm & Create Google Form"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {keyModal.open && (
        <ApiKeyModal
          currentKey={geminiKey}
          remembered={keyRemembered}
          notice={keyModal.notice}
          onClose={() => setKeyModal({ open: false })}
          onSave={(key, remember) => {
            storeGeminiKey(key, remember);
            setGeminiKey(key);
            setKeyRemembered(remember);
            setKeyModal({ open: false });
            showToast("Gemini key saved. Your requests now use your own quota.");
          }}
          onRemove={() => {
            clearStoredGeminiKey();
            setGeminiKey("");
            setKeyRemembered(false);
            setKeyModal({ open: false });
            showToast("Key removed. Using the shared AI again.");
          }}
        />
      )}

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Start a New Form?</h3>
            <p className="text-xs text-slate-500">
              This will clear your current conversation and draft so you can design a new form.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={executeReset}
                className="rounded-lg bg-gov-800 px-4 py-2 text-xs font-semibold text-white hover:bg-gov-900"
              >
                Start New Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error / API Configuration Modal */}
      {errorModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">{errorModal.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{errorModal.message}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {errorModal.isApiDisabled && errorModal.enableUrl && (
                <a
                  href={errorModal.enableUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gov-800 py-2.5 px-4 text-xs font-semibold text-white hover:bg-gov-900 transition-colors"
                >
                  <span>1. Click to Enable Google Forms API</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              {(errorModal.isAuthRequired || errorModal.isPermissionError) && (
                <button
                  onClick={async () => {
                    setErrorModal({ ...errorModal, isOpen: false });
                    await signInWithGoogle();
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gov-800 py-2.5 px-4 text-xs font-semibold text-white hover:bg-gov-900 transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In with Google with Forms Permission</span>
                </button>
              )}

              <button
                onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
                className="rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close (Draft Preserved)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creation Success Modal */}
      <CreateSuccessModal
        isOpen={successData.isOpen}
        onClose={() => setSuccessData({ ...successData, isOpen: false })}
        formTitle={successData.formTitle}
        responderUri={successData.responderUri}
        editUri={successData.editUri}
        googleFormId={successData.googleFormId}
      />
    </div>
  );
}

export default function CreateFormPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
          <div className="flex items-center gap-3 text-slate-500 text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-gov-800" />
            <span>Loading My AI Form Maker…</span>
          </div>
        </div>
      }
    >
      <CreateFormContent />
    </Suspense>
  );
}
