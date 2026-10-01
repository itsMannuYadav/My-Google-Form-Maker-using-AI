export type QuestionType =
  | 'SHORT_ANSWER'
  | 'PARAGRAPH'
  | 'MULTIPLE_CHOICE'
  | 'CHECKBOXES'
  | 'DROPDOWN'
  | 'LINEAR_SCALE'
  | 'DATE'
  | 'TIME';

export type BranchAction = 'NEXT_SECTION' | 'SUBMIT_FORM' | 'RESTART_FORM';

export interface OptionBranch {
  action?: BranchAction;
  targetSectionId?: string; // ID of the target section within the form
}

export interface QuestionOption {
  id: string;
  value: string;
  branch?: OptionBranch;
}

export interface FormQuestion {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  options?: QuestionOption[];
  scaleConfig?: {
    low: number;
    high: number;
    lowLabel?: string;
    highLabel?: string;
  };
  dateConfig?: {
    includeYear: boolean;
    includeTime: boolean;
  };
  // Quiz grading (only used when the form's isQuiz is true). correctAnswers hold
  // option values (choice questions) or accepted answers (short answer).
  points?: number;
  correctAnswers?: string[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  questions: FormQuestion[];
  nextAction?: 'NEXT_SECTION' | 'SUBMIT_FORM';
}

export interface FormDefinition {
  title: string;
  description: string;
  confirmationMessage?: string;
  // Makes the Google Form a graded quiz (exams, practice tests, knowledge checks).
  isQuiz?: boolean;
  sections: FormSection[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  suggestions?: string[]; // Quick chips for non-technical users
  isClarification?: boolean;
  // Snapshot of the form as it was immediately before this message's change
  // was applied. Present only on assistant messages that changed the form;
  // lets the user undo just that one change.
  formSnapshotBefore?: FormDefinition | null;
  undone?: boolean;
  // Name of a file the user attached to this message (the file itself is not kept).
  attachmentName?: string;
}

export interface SavedFormRecord {
  id: string;
  userId: string;
  title: string;
  description: string;
  googleFormId?: string;
  responderUri?: string;
  editUri?: string;
  status: 'draft' | 'published' | 'error';
  createdAt: number;
  updatedAt: number;
  formDefinition: FormDefinition;
  errorMessage?: string;
}
