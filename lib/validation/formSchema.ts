import { z } from "zod";

export const QuestionTypeSchema = z.enum([
  'SHORT_ANSWER',
  'PARAGRAPH',
  'MULTIPLE_CHOICE',
  'CHECKBOXES',
  'DROPDOWN',
  'LINEAR_SCALE',
  'DATE',
  'TIME'
]);

export const BranchActionSchema = z.enum(['NEXT_SECTION', 'SUBMIT_FORM', 'RESTART_FORM']);

export const OptionBranchSchema = z.object({
  action: BranchActionSchema.optional(),
  targetSectionId: z.string().optional(),
});

export const QuestionOptionSchema = z.object({
  id: z.string().default(() => `opt_${Math.random().toString(36).substring(2, 7)}`),
  value: z.string().min(1, "Option text cannot be empty"),
  branch: OptionBranchSchema.optional(),
});

export const ScaleConfigSchema = z.object({
  low: z.number().int().min(0).max(1).default(1),
  high: z.number().int().min(2).max(10).default(5),
  lowLabel: z.string().optional(),
  highLabel: z.string().optional(),
});

export const DateConfigSchema = z.object({
  includeYear: z.boolean().default(true),
  includeTime: z.boolean().default(false),
});

export const FormQuestionSchema = z.object({
  id: z.string().default(() => `q_${Math.random().toString(36).substring(2, 7)}`),
  title: z.string().min(1, "Question title is required"),
  description: z.string().optional(),
  type: QuestionTypeSchema,
  required: z.boolean().default(false),
  options: z.array(QuestionOptionSchema).optional(),
  scaleConfig: ScaleConfigSchema.optional(),
  dateConfig: DateConfigSchema.optional(),
  points: z.number().int().min(0).max(100).optional(),
  correctAnswers: z.array(z.string()).optional(),
});

export const FormSectionSchema = z.object({
  id: z.string().default(() => `sec_${Math.random().toString(36).substring(2, 7)}`),
  title: z.string().min(1, "Section title is required"),
  description: z.string().optional(),
  questions: z.array(FormQuestionSchema).default([]),
  nextAction: z.enum(['NEXT_SECTION', 'SUBMIT_FORM']).optional(),
});

export const FormDefinitionSchema = z.object({
  title: z.string().min(1, "Form title is required"),
  description: z.string().default(""),
  confirmationMessage: z.string().optional(),
  isQuiz: z.boolean().optional(),
  sections: z.array(FormSectionSchema).min(1, "At least one section is required"),
});

export const AIFormResponseSchema = z.object({
  reply: z.string().min(1, "Assistant reply is required"),
  isClarification: z.boolean().default(false),
  suggestions: z.array(z.string()).optional(),
  formDefinition: FormDefinitionSchema.optional(),
});

export type FormDefinitionType = z.infer<typeof FormDefinitionSchema>;
export type FormSectionType = z.infer<typeof FormSectionSchema>;
export type FormQuestionType = z.infer<typeof FormQuestionSchema>;
export type AIFormResponseType = z.infer<typeof AIFormResponseSchema>;
