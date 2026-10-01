// Single source of truth for starter prompts and templates, so the landing page,
// builder welcome chips and "Quick Examples" stay in sync across audiences.

export type Audience = "students" | "legal" | "work";

export interface FormTemplate {
  audience: Audience;
  icon: "GraduationCap" | "Scale" | "FileText" | "Users" | "Zap" | "Layers" | "Building" | "ClipboardCheck";
  title: string;
  prompt: string;
  desc: string;
}

export const AUDIENCE_LABELS: Record<Audience, string> = {
  students: "Students & Teachers",
  legal: "Lawyers & Legal Teams",
  work: "Offices & Government",
};

export const FORM_TEMPLATES: FormTemplate[] = [
  // Students & teachers
  {
    audience: "students",
    icon: "ClipboardCheck",
    title: "Auto-graded Quiz",
    prompt: "Create a 10 question multiple choice quiz on basic computer networks with answers and 1 point each",
    desc: "Turns on Google's quiz mode with an answer key and points, so responses are scored automatically.",
  },
  {
    audience: "students",
    icon: "Users",
    title: "Research Survey",
    prompt: "Create a research questionnaire for my thesis on social media use among college students with consent note, Likert scale questions and optional demographics",
    desc: "Consent note, anonymous demographics, Likert scales, and sensitive questions placed last.",
  },
  {
    audience: "students",
    icon: "GraduationCap",
    title: "Group Project Peer Evaluation",
    prompt: "Create a peer evaluation form for a group project where each member rates teammates on contribution, communication and reliability",
    desc: "Team and member details, rating scales per criterion, and a private comments box.",
  },
  {
    audience: "students",
    icon: "Zap",
    title: "Club, Fest & Hackathon Registration",
    prompt: "Create a registration form for our college tech fest with team details, event selection and t-shirt size",
    desc: "Participant and team info, event choices, dietary or size options, and confirmation message.",
  },
  // Lawyers & legal teams
  {
    audience: "legal",
    icon: "Scale",
    title: "Client Intake Form",
    prompt: "Create a new client intake form for a law firm with contact details, practice area, matter summary, opposing parties for conflict check, key dates and consent",
    desc: "Contact, matter details, conflict-check data, and a no-attorney-client-relationship notice.",
  },
  {
    audience: "legal",
    icon: "FileText",
    title: "Witness Statement / Incident Report",
    prompt: "Create a witness statement form with witness details, date and place of incident, a chronological account, other people present and a declaration that the statement is true",
    desc: "Structured, date-ordered account with a truthfulness declaration.",
  },
  {
    audience: "legal",
    icon: "ClipboardCheck",
    title: "Policy / NDA Acknowledgement",
    prompt: "Create a confidentiality and NDA acknowledgement form where signatories confirm they have read and agree, with name, designation, date and required consent checkboxes",
    desc: "Required consent checkboxes and name/date capture for compliance records.",
  },
  {
    audience: "legal",
    icon: "Layers",
    title: "Document Checklist for Clients",
    prompt: "Create a client document checklist form where clients tick which documents they can provide for their case, with a space for notes",
    desc: "Tick-box checklist of documents with notes, so nothing is missed at the first meeting.",
  },
  // Offices & government
  {
    audience: "work",
    icon: "Building",
    title: "Scholarship Applications",
    prompt: "Create a scholarship application form with personal and academic details",
    desc: "Includes date of birth, income brackets, institution name, and verification fields.",
  },
  {
    audience: "work",
    icon: "Users",
    title: "Citizen Feedback Surveys",
    prompt: "Create a feedback survey with 1 to 5 rating scales and comments",
    desc: "Captures satisfaction metrics, service feedback, and suggestions.",
  },
  {
    audience: "work",
    icon: "FileText",
    title: "Staff Leave & Duty Requisitions",
    prompt: "Create a staff leave application with dates, reason and designation",
    desc: "Organized fields for department, leave type, date range, and emergency contacts.",
  },
  {
    audience: "work",
    icon: "Layers",
    title: "Inspection & Audit Checklist",
    prompt: "Create an inspection form with checkboxes and ratings",
    desc: "Structured checklist format for official assessments and field reports.",
  },
];

// Shown as chips in the builder. A deliberate mix so every audience sees itself.
export const STARTER_PROMPTS = [
  "Multiple choice quiz with answers and points",
  "Client intake form for a law firm",
  "Research survey with consent and Likert scale",
  "Registration form for students and teachers",
];

export const QUICK_EXAMPLES = [
  "Quiz on photosynthesis with 10 MCQs and answer key",
  "New client intake form with conflict check",
  "Peer evaluation form for a group project",
  "NDA / confidentiality acknowledgement",
  "Feedback survey with ratings 1 to 5",
  "Scholarship application with personal & academic details",
];
