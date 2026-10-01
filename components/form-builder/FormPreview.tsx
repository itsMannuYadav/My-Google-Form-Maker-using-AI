"use client";

import React, { useState } from "react";
import { FormDefinition, FormQuestion, FormSection, QuestionType } from "@/types/form";
import {
  Sparkles,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Edit2,
  CheckCircle2,
  HelpCircle,
  Layers,
  Calendar,
  Clock,
  CircleDot,
  CheckSquare,
  ListFilter,
  AlignLeft,
  Sliders,
  Type,
  FolderPlus,
  ExternalLink,
  ShieldCheck,
  Save,
} from "lucide-react";
import { generateId } from "@/lib/utils";

interface FormPreviewProps {
  formDef: FormDefinition | null;
  onUpdateForm: (updated: FormDefinition) => void;
  onOpenQuestionEditor: (question: FormQuestion) => void;
  onPublishClick: () => void;
  onSaveDraftClick?: () => void;
  isPublishing?: boolean;
  isPublished?: boolean;
}

export default function FormPreview({
  formDef,
  onUpdateForm,
  onOpenQuestionEditor,
  onPublishClick,
  onSaveDraftClick,
  isPublishing,
  isPublished,
}: FormPreviewProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [editingConfirmation, setEditingConfirmation] = useState(false);

  if (!formDef || formDef.sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-full min-h-0 p-8 text-center bg-slate-50">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200 text-slate-400 mb-4">
          <Layers className="h-8 w-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">Your Form Preview Will Appear Here</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1.5 leading-relaxed">
          Type what kind of form you need in the AI chat on the left (e.g., &ldquo;Create a student registration form&rdquo;).
        </p>
      </div>
    );
  }

  const totalQuestions = formDef.sections.reduce((acc, s) => acc + s.questions.length, 0);

  // Reordering helpers
  const handleMoveQuestion = (sectionIdx: number, questionIdx: number, direction: "up" | "down") => {
    const updated = JSON.parse(JSON.stringify(formDef)) as FormDefinition;
    const questions = updated.sections[sectionIdx].questions;
    const targetIdx = direction === "up" ? questionIdx - 1 : questionIdx + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const [moved] = questions.splice(questionIdx, 1);
    questions.splice(targetIdx, 0, moved);
    onUpdateForm(updated);
  };

  const handleDuplicateQuestion = (sectionIdx: number, questionIdx: number) => {
    const updated = JSON.parse(JSON.stringify(formDef)) as FormDefinition;
    const original = updated.sections[sectionIdx].questions[questionIdx];
    const duplicate: FormQuestion = {
      ...JSON.parse(JSON.stringify(original)),
      id: generateId("q"),
      title: `${original.title} (Copy)`,
    };
    updated.sections[sectionIdx].questions.splice(questionIdx + 1, 0, duplicate);
    onUpdateForm(updated);
  };

  const handleDeleteQuestion = (sectionIdx: number, questionIdx: number) => {
    const updated = JSON.parse(JSON.stringify(formDef)) as FormDefinition;
    updated.sections[sectionIdx].questions.splice(questionIdx, 1);
    onUpdateForm(updated);
  };

  const handleToggleRequired = (sectionIdx: number, questionIdx: number) => {
    const updated = JSON.parse(JSON.stringify(formDef)) as FormDefinition;
    const q = updated.sections[sectionIdx].questions[questionIdx];
    q.required = !q.required;
    onUpdateForm(updated);
  };

  const handleAddQuestion = (sectionIdx: number) => {
    const updated = JSON.parse(JSON.stringify(formDef)) as FormDefinition;
    const count = updated.sections[sectionIdx].questions.length + 1;
    const newQ: FormQuestion = {
      id: generateId("q"),
      title: `New Question ${count}`,
      type: "SHORT_ANSWER",
      required: false,
    };
    updated.sections[sectionIdx].questions.push(newQ);
    onUpdateForm(updated);
  };

  const handleAddSection = () => {
    const updated = JSON.parse(JSON.stringify(formDef)) as FormDefinition;
    const secCount = updated.sections.length + 1;
    const newSec: FormSection = {
      id: generateId("sec"),
      title: `Section ${secCount}: Additional Details`,
      description: "Instructions for this section",
      questions: [
        {
          id: generateId("q"),
          title: "Question 1",
          type: "SHORT_ANSWER",
          required: false,
        },
      ],
    };
    updated.sections.push(newSec);
    onUpdateForm(updated);
  };

  const handleDeleteSection = (sectionIdx: number) => {
    if (formDef.sections.length <= 1) return;
    const updated = JSON.parse(JSON.stringify(formDef)) as FormDefinition;
    updated.sections.splice(sectionIdx, 1);
    onUpdateForm(updated);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-slate-100/70 overflow-y-auto">
      {/* Top Action Bar (scrolls with the page, not sticky) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 sm:px-6 py-3 bg-white border-b border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200 shrink-0">
            {isPublished ? "Published" : "Google Form Ready"}
          </span>
          <span className="text-xs text-slate-500 truncate">
            {totalQuestions} {totalQuestions === 1 ? "Question" : "Questions"} • {formDef.sections.length}{" "}
            {formDef.sections.length === 1 ? "Section" : "Sections"}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {onSaveDraftClick && (
            <button
              onClick={onSaveDraftClick}
              className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Save className="h-3.5 w-3.5 text-slate-500" />
              <span>Save Draft</span>
            </button>
          )}

          <button
            onClick={onPublishClick}
            disabled={isPublishing}
            className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-lg bg-gov-800 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-gov-900 disabled:opacity-50 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-gov-200 shrink-0" />
            <span className="truncate">{isPublishing
                ? isPublished ? "Updating..." : "Publishing..."
                : isPublished ? "Update Google Form →" : "Create Google Form →"}</span>
          </button>
        </div>
      </div>

      {/* Main Form Body Container */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto w-full">
        {/* Form Title & Description Card (Google Form Header Card) */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 gform-accent-border relative">
          <div className="space-y-3">
            {editingTitle ? (
              <input
                type="text"
                autoFocus
                value={formDef.title}
                onChange={(e) => onUpdateForm({ ...formDef, title: e.target.value })}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                className="w-full text-2xl font-bold text-slate-900 border-b border-gov-600 focus:outline-none bg-transparent pb-1"
              />
            ) : (
              <div
                onClick={() => setEditingTitle(true)}
                className="group flex items-center justify-between cursor-pointer"
                title="Click to edit title"
              >
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {formDef.title || "Untitled Form"}
                </h1>
                <Edit2 className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            {editingDesc ? (
              <textarea
                autoFocus
                rows={2}
                value={formDef.description}
                onChange={(e) => onUpdateForm({ ...formDef, description: e.target.value })}
                onBlur={() => setEditingDesc(false)}
                className="w-full text-sm text-slate-600 border border-slate-300 rounded-md p-2 focus:border-gov-700 focus:outline-none"
              />
            ) : (
              <div
                onClick={() => setEditingDesc(true)}
                className="group flex items-start justify-between cursor-pointer"
                title="Click to edit description"
              >
                <p className="text-sm text-slate-600 leading-relaxed">
                  {formDef.description || "Click to add a helpful description or instructions for respondents."}
                </p>
                <Edit2 className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2 mt-0.5" />
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-red-600 font-medium">
              <span>* Indicates required question</span>
              <label className="inline-flex items-center gap-1.5 text-slate-600 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formDef.isQuiz}
                  onChange={(e) => onUpdateForm({ ...formDef, isQuiz: e.target.checked })}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                />
                <span>Quiz mode (auto-graded)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Sections & Questions */}
        {formDef.sections.map((section, sIdx) => (
          <div key={section.id || sIdx} className="space-y-4">
            {/* Section Header Card (for section > 0 or custom named) */}
            <div className="rounded-xl bg-purple-50/70 border border-purple-200/80 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 px-2 items-center justify-center rounded bg-purple-700 text-white text-xs font-semibold">
                    Section {sIdx + 1} of {formDef.sections.length}
                  </span>
                  <h2 className="text-base font-semibold text-purple-950">
                    {section.title}
                  </h2>
                </div>

                {formDef.sections.length > 1 && (
                  <button
                    onClick={() => handleDeleteSection(sIdx)}
                    title="Delete Section"
                    className="p-1 text-purple-600 hover:text-red-600 hover:bg-purple-100 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              {section.description && (
                <p className="text-xs text-purple-900/80 mt-1 pl-1">{section.description}</p>
              )}
            </div>

            {/* Question Items in this Section */}
            {section.questions.map((q, qIdx) => (
              <div
                key={q.id || qIdx}
                className="rounded-xl bg-white p-5 shadow-xs border border-slate-200 hover:border-slate-300 transition-all space-y-3"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">
                        Q{qIdx + 1}.
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {q.title}
                        {q.required && <span className="text-red-500 ml-1 font-bold">*</span>}
                      </h3>
                    </div>
                    {q.description && (
                      <p className="text-xs text-slate-500 mt-0.5 pl-6">{q.description}</p>
                    )}
                    {formDef.isQuiz && q.correctAnswers && q.correctAnswers.length > 0 && (
                      <p className="text-xs text-emerald-700 mt-1 pl-6">
                        Answer: {q.correctAnswers.join(", ")} · {q.points ?? 1} {(q.points ?? 1) === 1 ? "point" : "points"}
                      </p>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 border border-slate-200/60 shrink-0">
                    {getQuestionTypeIcon(q.type)}
                    {getQuestionTypeLabel(q.type)}
                  </span>
                </div>

                {/* Question Response Mock Preview */}
                <div className="pt-2 pb-1 pl-6">
                  {renderQuestionPreview(q)}
                </div>

                {/* Bottom Card Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleRequired(sIdx, qIdx)}
                      className={`inline-flex items-center gap-1.5 font-medium px-2 py-1 rounded transition-colors ${
                        q.required
                          ? "bg-red-50 text-red-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{q.required ? "Required" : "Optional"}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveQuestion(sIdx, qIdx, "up")}
                      disabled={qIdx === 0}
                      title="Move Up"
                      className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMoveQuestion(sIdx, qIdx, "down")}
                      disabled={qIdx === section.questions.length - 1}
                      title="Move Down"
                      className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateQuestion(sIdx, qIdx)}
                      title="Duplicate Question"
                      className="p-1 rounded hover:bg-slate-100 text-slate-500"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onOpenQuestionEditor(q)}
                      title="Edit Question"
                      className="p-1 rounded hover:bg-slate-100 text-gov-800"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(sIdx, qIdx)}
                      title="Delete Question"
                      className="p-1 rounded hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Question Button in Section */}
            <div className="flex justify-center pt-1">
              <button
                onClick={() => handleAddQuestion(sIdx)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white/60 px-4 py-2 text-xs font-medium text-slate-700 hover:border-gov-400 hover:bg-white hover:text-gov-800 shadow-2xs transition-all"
              >
                <Plus className="h-3.5 w-3.5 text-gov-700" />
                <span>Add Question to Section {sIdx + 1}</span>
              </button>
            </div>
          </div>
        ))}

        {/* Add Section Button */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={handleAddSection}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-xs transition-all"
          >
            <FolderPlus className="h-4 w-4 text-purple-700" />
            <span>Add New Section / Page Break</span>
          </button>
        </div>

        {/* Confirmation Message Card (editable) */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 space-y-1.5">
          <span className="font-semibold text-slate-800 uppercase tracking-wider text-[10px]">
            Submission Confirmation Message
          </span>
          {editingConfirmation ? (
            <textarea
              autoFocus
              rows={2}
              value={formDef.confirmationMessage || ""}
              onChange={(e) => onUpdateForm({ ...formDef, confirmationMessage: e.target.value })}
              onBlur={() => setEditingConfirmation(false)}
              className="w-full text-xs text-slate-700 border border-slate-300 rounded-md p-2 bg-white focus:border-gov-700 focus:outline-none"
            />
          ) : (
            <div
              onClick={() => setEditingConfirmation(true)}
              className="group flex items-start justify-between cursor-pointer"
              title="Click to edit confirmation message"
            >
              <p>
                {formDef.confirmationMessage ||
                  "Click to write what respondents see after they submit the form."}
              </p>
              <Edit2 className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2 mt-0.5" />
            </div>
          )}
          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
            Note: Google Forms&apos; API doesn&apos;t support setting this message automatically. After creating
            the form, open it in Google Forms → Settings → Presentation → Confirmation message to paste this in.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helpers for icons and labels
function getQuestionTypeLabel(type: QuestionType): string {
  switch (type) {
    case "SHORT_ANSWER":
      return "Short Answer";
    case "PARAGRAPH":
      return "Paragraph";
    case "MULTIPLE_CHOICE":
      return "Multiple Choice";
    case "CHECKBOXES":
      return "Checkboxes";
    case "DROPDOWN":
      return "Dropdown";
    case "LINEAR_SCALE":
      return "Linear Scale";
    case "DATE":
      return "Date";
    case "TIME":
      return "Time";
    default:
      return type;
  }
}

function getQuestionTypeIcon(type: QuestionType) {
  switch (type) {
    case "SHORT_ANSWER":
      return <Type className="h-3.5 w-3.5 text-slate-500" />;
    case "PARAGRAPH":
      return <AlignLeft className="h-3.5 w-3.5 text-slate-500" />;
    case "MULTIPLE_CHOICE":
      return <CircleDot className="h-3.5 w-3.5 text-blue-600" />;
    case "CHECKBOXES":
      return <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />;
    case "DROPDOWN":
      return <ListFilter className="h-3.5 w-3.5 text-amber-600" />;
    case "LINEAR_SCALE":
      return <Sliders className="h-3.5 w-3.5 text-indigo-600" />;
    case "DATE":
      return <Calendar className="h-3.5 w-3.5 text-rose-600" />;
    case "TIME":
      return <Clock className="h-3.5 w-3.5 text-cyan-600" />;
  }
}

function renderQuestionPreview(q: FormQuestion) {
  switch (q.type) {
    case "SHORT_ANSWER":
      return (
        <div className="w-full max-w-sm rounded-md border-b-2 border-slate-300 py-1.5 text-xs text-slate-400 italic">
          Short-answer text
        </div>
      );

    case "PARAGRAPH":
      return (
        <div className="w-full max-w-md rounded-md border-b-2 border-slate-300 py-3 text-xs text-slate-400 italic">
          Long-answer text
        </div>
      );

    case "MULTIPLE_CHOICE":
      return (
        <div className="space-y-2">
          {q.options?.map((opt, i) => (
            <div key={opt.id || i} className="flex items-center gap-2.5 text-xs text-slate-700">
              <div className="h-4 w-4 rounded-full border border-slate-400 flex items-center justify-center bg-white" />
              <span>{opt.value}</span>
            </div>
          ))}
        </div>
      );

    case "CHECKBOXES":
      return (
        <div className="space-y-2">
          {q.options?.map((opt, i) => (
            <div key={opt.id || i} className="flex items-center gap-2.5 text-xs text-slate-700">
              <div className="h-4 w-4 rounded-xs border border-slate-400 bg-white" />
              <span>{opt.value}</span>
            </div>
          ))}
        </div>
      );

    case "DROPDOWN":
      return (
        <div className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-600 flex items-center justify-between">
          <span>Choose an option</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>
      );

    case "LINEAR_SCALE":
      const low = q.scaleConfig?.low ?? 1;
      const high = q.scaleConfig?.high ?? 5;
      const points = [];
      for (let i = low; i <= high; i++) points.push(i);
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-xs text-slate-600">
            {q.scaleConfig?.lowLabel && <span className="text-slate-500 font-medium">{q.scaleConfig.lowLabel}</span>}
            <div className="flex items-center gap-4">
              {points.map((p) => (
                <div key={p} className="flex flex-col items-center gap-1">
                  <span className="text-[11px] text-slate-500 font-medium">{p}</span>
                  <div className="h-4 w-4 rounded-full border border-slate-400 bg-white" />
                </div>
              ))}
            </div>
            {q.scaleConfig?.highLabel && <span className="text-slate-500 font-medium">{q.scaleConfig.highLabel}</span>}
          </div>
        </div>
      );

    case "DATE":
      return (
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>DD / MM / YYYY</span>
        </div>
      );

    case "TIME":
      return (
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>Time (HH : MM)</span>
        </div>
      );
  }
}
