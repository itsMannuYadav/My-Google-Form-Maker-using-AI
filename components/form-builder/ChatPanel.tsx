"use client";

import { QUICK_EXAMPLES } from "@/lib/useCases";
import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/types/form";
import { Send, Sparkles, User, Bot, HelpCircle, ArrowRight, Loader2, RefreshCw, Copy, Check, Undo2, Paperclip, X, FileText, Image as ImageIcon, KeyRound } from "lucide-react";

const ACCEPTED_FILES = ".jpg,.jpeg,.png,.webp,.pdf,.docx";
const MAX_DOC_BYTES = 4 * 1024 * 1024;
// Images are downscaled in the browser before upload, so larger originals are fine.
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_DOC_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function validateFile(file: File): string | null {
  const name = file.name.toLowerCase();
  const isImage = /\.(jpe?g|png|webp)$/.test(name) || ACCEPTED_IMAGE_TYPES.includes(file.type);
  const isDoc = /\.(pdf|docx)$/.test(name) || ACCEPTED_DOC_TYPES.includes(file.type);
  if (!isImage && !isDoc) return "Please attach an image (JPG, PNG, WEBP), a PDF, or a Word (.docx) file.";
  if (isImage && file.size > MAX_IMAGE_BYTES) return "That image is too large (max 20 MB).";
  if (isDoc && file.size > MAX_DOC_BYTES) return "That document is too large (max 4 MB).";
  return null;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  loading: boolean;
  onSendMessage: (text: string, file?: File) => void;
  onResetChat?: () => void;
  onUndoMessage?: (message: ChatMessage) => void;
  hasOwnKey?: boolean;
  onOpenApiKey?: () => void;
}

export default function ChatPanel({
  messages,
  loading,
  onSendMessage,
  onResetChat,
  onUndoMessage,
  hasOwnKey,
  onOpenApiKey,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingUndo, setPendingUndo] = useState<ChatMessage | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragDepth = useRef(0);
  const dragIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideDropOverlay = () => {
    dragDepth.current = 0;
    setIsDragging(false);
    if (dragIdleTimer.current) clearTimeout(dragIdleTimer.current);
  };

  // Browsers fire dragover repeatedly during a drag. If it stops (drag cancelled,
  // cursor left the window), hide the overlay instead of leaving it stuck.
  const keepDropOverlayAlive = () => {
    if (dragIdleTimer.current) clearTimeout(dragIdleTimer.current);
    dragIdleTimer.current = setTimeout(hideDropOverlay, 1000);
  };

  const attachFile = (file: File) => {
    if (loading) return;
    // Pasted screenshots all arrive as "image.png"; give them a clearer name.
    if (/^image\.\w+$/i.test(file.name)) {
      const ext = file.type.split("/")[1] || "png";
      file = new File([file], `pasted-image-${Date.now()}.${ext}`, { type: file.type });
    }
    const error = validateFile(file);
    setFileError(error);
    setAttachedFile(error ? null : file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (file) attachFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const file = e.clipboardData.files?.[0];
    if (!file) return; // plain text paste — let the textarea handle it
    e.preventDefault();
    attachFile(file);
  };

  const isFileDrag = (e: React.DragEvent) => e.dataTransfer.types.includes("Files");

  const handleDragEnter = (e: React.DragEvent) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    dragDepth.current += 1;
    setIsDragging(true);
    keepDropOverlayAlive();
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    keepDropOverlayAlive();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!isFileDrag(e)) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) hideDropOverlay();
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    hideDropOverlay();
    const file = e.dataTransfer.files?.[0];
    if (file) attachFile(file);
  };

  // Stop the browser from opening a file that's dropped anywhere else on the
  // page, which would navigate away and lose the current draft.
  useEffect(() => {
    const block = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) e.preventDefault();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") hideDropOverlay();
    };
    window.addEventListener("dragover", block);
    window.addEventListener("drop", block);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("dragover", block);
      window.removeEventListener("drop", block);
      window.removeEventListener("keydown", onKeyDown);
      if (dragIdleTimer.current) clearTimeout(dragIdleTimer.current);
    };
  }, []);

  const handleCopy = async (msg: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId((current) => (current === msg.id ? null : current)), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fail silently.
    }
  };

  const handleConfirmUndo = () => {
    if (!pendingUndo) return;
    onUndoMessage?.(pendingUndo);
    setPendingUndo(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachedFile) || loading) return;
    onSendMessage(input.trim(), attachedFile ?? undefined);
    setInput("");
    setAttachedFile(null);
    setFileError(null);
  };

  const handleChipClick = (suggestion: string) => {
    if (loading) return;
    onSendMessage(suggestion);
  };

  return (
    <div
      className="relative flex flex-col flex-1 h-full min-h-0 bg-white border-r border-slate-200 overflow-hidden"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag-and-drop overlay */}
      {isDragging && (
        <div className="absolute inset-2 z-40 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gov-600 bg-gov-50/90 text-gov-900">
          <button
            type="button"
            onClick={hideDropOverlay}
            title="Close (Esc)"
            aria-label="Close drop area"
            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
          <Paperclip className="h-6 w-6" />
          <p className="text-sm font-semibold">Drop your file to attach it</p>
          <p className="text-xs text-slate-600">Image (JPG, PNG, WEBP), PDF, or Word (.docx)</p>
        </div>
      )}

      {/* Scrollable region: header scrolls away with the messages, not pinned */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gov-800 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">My AI Form Maker</h3>
              <p className="text-[11px] text-slate-500">Describe or modify your form in plain English</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
          {onOpenApiKey && (
            <button
              onClick={onOpenApiKey}
              title={hasOwnKey ? "Using your own Gemini key" : "Add your own free Gemini API key"}
              className={`flex items-center gap-1 whitespace-nowrap text-xs px-2 py-1 rounded transition-colors cursor-pointer ${
                hasOwnKey
                  ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
              }`}
            >
              <KeyRound className="h-3 w-3" />
              <span>{hasOwnKey ? "Own key" : "Own API key"}</span>
            </button>
          )}
          {onResetChat && (
            <button
              onClick={onResetChat}
              title="Start New Form"
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Restart</span>
            </button>
          )}
          </div>
        </div>

        {/* Messages List */}
        <div className="p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.sender === "user";
          // A user message doesn't carry its own form snapshot — the assistant's
          // reply right after it does, since that's the message that actually
          // applied the change. Undo on the user bubble reverts that same change.
          const undoTarget = isUser ? messages[idx + 1] : msg;
          const canUndo =
            undoTarget?.sender === "assistant" &&
            undoTarget.formSnapshotBefore !== undefined &&
            !undoTarget.undone;
          const wasUndone = undoTarget?.sender === "assistant" && undoTarget.undone;
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gov-100 text-gov-800 text-xs font-semibold">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-2`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser
                      ? "bg-gov-800 text-white rounded-br-xs"
                      : "bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/70"
                  }`}
                >
                  {msg.attachmentName && (
                    <div className="mb-1.5 inline-flex max-w-full items-center gap-1.5 rounded-md bg-white/15 px-2 py-1 text-xs">
                      <Paperclip className="h-3 w-3 shrink-0" />
                      <span className="truncate">{msg.attachmentName}</span>
                    </div>
                  )}
                  <div>{msg.content}</div>
                </div>

                {/* Copy / Undo actions (ChatGPT-style, on both user and assistant messages) */}
                <div
                  className={`flex items-center gap-0.5 ${isUser ? "justify-end pr-1" : "pl-1"}`}
                >
                  <button
                    type="button"
                    onClick={() => handleCopy(msg)}
                    title="Copy message"
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {canUndo && (
                    <button
                      type="button"
                      onClick={() => setPendingUndo(undoTarget!)}
                      title="Undo this change"
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {wasUndone && (
                    <span className="text-[10px] text-slate-400 italic px-1">Change undone</span>
                  )}
                </div>

                {/* Clarification or quick suggestions chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChipClick(suggestion)}
                        disabled={loading}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-xs hover:border-gov-400 hover:bg-gov-50 hover:text-gov-900 transition-colors disabled:opacity-50"
                      >
                        <span>{suggestion}</span>
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white text-xs">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading state indicator with friendly microcopy */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gov-100 text-gov-800">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-bl-xs bg-slate-100 px-4 py-2.5 text-sm text-slate-600 border border-slate-200/70 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-gov-700" />
              <span>Thinking and drafting your form questions…</span>
            </div>
          </div>
        )}

        {/* Suggested Starting Prompts when chat is empty — scrolls with the messages */}
        {messages.length <= 1 && (
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Quick Examples:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_EXAMPLES.map((eg, i) => (
                <button
                  key={i}
                  onClick={() => handleChipClick(eg)}
                  className="text-xs text-left bg-white border border-slate-200 hover:border-gov-300 hover:bg-gov-50 text-slate-700 rounded-md px-2.5 py-1 transition-colors cursor-pointer"
                >
                  {eg}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="shrink-0 p-3 border-t border-slate-200 bg-white">
        {(attachedFile || fileError) && (
          <div className="mb-2 flex items-center gap-2">
            {attachedFile ? (
              <div className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
                {attachedFile.type.startsWith("image/") ? (
                  <ImageIcon className="h-3.5 w-3.5 shrink-0 text-gov-700" />
                ) : (
                  <FileText className="h-3.5 w-3.5 shrink-0 text-gov-700" />
                )}
                <span className="truncate">{attachedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  title="Remove file"
                  className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-red-600">{fileError}</p>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILES}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            title="Attach an image, PDF, or Word document"
            className="absolute left-2 bottom-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-gov-800 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={
              attachedFile
                ? "Optional: tell AI what to do with this file..."
                : "Tell AI what to create or change, or attach a photo/PDF of a form..."
            }
            className="w-full resize-none rounded-xl border border-slate-300 py-2.5 pl-11 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:border-gov-700 focus:outline-none focus:ring-1 focus:ring-gov-700 leading-normal"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={(!input.trim() && !attachedFile) || loading}
            className="absolute right-2.5 bottom-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gov-800 text-white shadow-sm hover:bg-gov-900 disabled:opacity-40 transition-colors cursor-pointer"
            title="Send request"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 px-1 flex items-center justify-between">
          <span>Press Enter to send</span>
          <span>Google Forms v1 compatible</span>
        </p>
      </form>

      {/* Undo Confirmation Modal */}
      {pendingUndo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-200">
                <Undo2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Undo this change?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  This will revert your form back to how it was just before this message. Your chat history will stay, but the form change from this step will be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPendingUndo(null)}
                className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUndo}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Yes, Undo Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
