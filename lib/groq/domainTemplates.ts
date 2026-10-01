import { FormQuestion } from "@/types/form";
import { AIFormResponseType } from "@/lib/validation/formSchema";
import { generateId } from "@/lib/utils";

// Offline starting points for student, research and legal use cases. Used by the
// keyword fallback when the AI service is unavailable, for a brand-new form only.

const q = (
  title: string,
  type: FormQuestion["type"],
  required: boolean,
  extra: Partial<FormQuestion> = {}
): FormQuestion => ({ id: generateId("q"), title, type, required, ...extra });

const opts = (...values: string[]) => values.map((value) => ({ id: generateId("opt"), value }));

const dateQ = (title: string, required: boolean) =>
  q(title, "DATE", required, { dateConfig: { includeYear: true, includeTime: false } });

const NO_RELATIONSHIP =
  "Submitting this form does not create a lawyer-client relationship. Please do not include confidential or privileged details until an engagement is confirmed.";

export function matchDomainTemplate(lower: string): AIFormResponseType | null {
  const has = (...words: string[]) => words.some((w) => lower.includes(w));

  // Quizzes need a real answer key, which only the AI service can write reliably.
  if (has("quiz", "mcq", "exam", "test paper", "answer key")) {
    return {
      reply:
        "Quizzes with an auto-graded answer key need the AI service, which isn't available right now. Please try again in a moment.",
      isClarification: true,
      suggestions: ["Try the quiz again", "Create a plain question form"],
      formDefinition: undefined,
    };
  }

  if (has("client intake", "intake form", "new client", "consultation request", "law firm", "legal intake")) {
    return {
      reply:
        "I built a client intake form with contact details, matter details (including other parties for a conflict check) and a consent section. Adapt the practice areas and the notice to your firm and jurisdiction.",
      isClarification: false,
      suggestions: ["Add a document checklist", "Make all fields required", "Create Google Form"],
      formDefinition: {
        title: "Client Intake Form",
        description: NO_RELATIONSHIP,
        confirmationMessage: "Thank you. We have received your enquiry and will contact you shortly.",
        sections: [
          {
            id: generateId("sec"),
            title: "Contact Details",
            questions: [
              q("Full name", "SHORT_ANSWER", true),
              q("Email address", "SHORT_ANSWER", true),
              q("Phone number", "SHORT_ANSWER", true),
              q("Preferred way to be contacted", "MULTIPLE_CHOICE", true, {
                options: opts("Phone call", "Email", "WhatsApp / message"),
              }),
              q("Is it safe to leave a voicemail or message on this number?", "MULTIPLE_CHOICE", false, {
                options: opts("Yes", "No"),
              }),
            ],
          },
          {
            id: generateId("sec"),
            title: "About Your Matter",
            questions: [
              q("Area of law", "DROPDOWN", true, {
                options: opts(
                  "Family",
                  "Criminal",
                  "Property / Real estate",
                  "Corporate / Commercial",
                  "Employment",
                  "Consumer",
                  "Intellectual property",
                  "Civil dispute",
                  "Other"
                ),
              }),
              q("Briefly describe your issue", "PARAGRAPH", true, {
                description: "Stick to the key facts in date order. Avoid highly sensitive details at this stage.",
              }),
              q("Other people or organisations involved", "PARAGRAPH", true, {
                description: "Names help us run a conflict-of-interest check.",
              }),
              q("Court, authority or city involved (if any)", "SHORT_ANSWER", false),
              dateQ("Any upcoming deadline or hearing date?", false),
              q("How urgent is this?", "MULTIPLE_CHOICE", true, {
                options: opts("Within days", "Within weeks", "Not urgent"),
              }),
            ],
          },
          {
            id: generateId("sec"),
            title: "Consent",
            questions: [
              q("Confirmations", "CHECKBOXES", true, {
                options: opts(
                  "The information I have given is accurate to the best of my knowledge",
                  "I understand that submitting this form does not create a lawyer-client relationship",
                  "I consent to my details being used to assess this enquiry"
                ),
              }),
            ],
          },
        ],
      },
    };
  }

  if (has("nda", "confidentiality", "acknowledgement", "acknowledgment", "policy acceptance")) {
    return {
      reply:
        "I built an acknowledgement form with required confirmation checkboxes. A tick-box record is not a substitute for a signed agreement where the law requires a signature.",
      isClarification: false,
      suggestions: ["Add employee ID", "Add department", "Create Google Form"],
      formDefinition: {
        title: "Confidentiality Acknowledgement",
        description: "Please read the document shared with you, then confirm below.",
        confirmationMessage: "Thank you. Your acknowledgement has been recorded.",
        sections: [
          {
            id: generateId("sec"),
            title: "Acknowledgement",
            questions: [
              q("Full name", "SHORT_ANSWER", true),
              q("Designation / role", "SHORT_ANSWER", true),
              q("Email address", "SHORT_ANSWER", true),
              dateQ("Date of acknowledgement", true),
              q("Confirmations", "CHECKBOXES", true, {
                options: opts(
                  "I have read and understood the confidentiality terms",
                  "I agree to comply with them",
                  "I understand that a breach may have legal consequences"
                ),
              }),
            ],
          },
        ],
      },
    };
  }

  if (has("witness statement", "incident report", "statement form")) {
    return {
      reply: "I built a witness statement form with a date-ordered account and a truthfulness declaration.",
      isClarification: false,
      suggestions: ["Add a Drive link for photos or documents", "Create Google Form"],
      formDefinition: {
        title: "Witness Statement",
        description: "Please give your account in your own words and in the order events happened.",
        confirmationMessage: "Thank you. Your statement has been recorded.",
        sections: [
          {
            id: generateId("sec"),
            title: "Witness Details",
            questions: [
              q("Full name", "SHORT_ANSWER", true),
              q("Contact number", "SHORT_ANSWER", true),
              q("Relationship to the people involved", "SHORT_ANSWER", false),
            ],
          },
          {
            id: generateId("sec"),
            title: "Your Account",
            questions: [
              dateQ("Date of the incident", true),
              q("Place of the incident", "SHORT_ANSWER", true),
              q("What did you see or hear? (in date and time order)", "PARAGRAPH", true),
              q("Other people who were present", "PARAGRAPH", false),
              q("Declaration", "CHECKBOXES", true, {
                options: opts("I confirm this statement is true to the best of my knowledge"),
              }),
            ],
          },
        ],
      },
    };
  }

  if (has("research", "thesis", "questionnaire", "likert", "dissertation")) {
    const likert = (title: string) =>
      q(title, "LINEAR_SCALE", true, {
        scaleConfig: { low: 1, high: 5, lowLabel: "Strongly disagree", highLabel: "Strongly agree" },
      });
    return {
      reply:
        "I built a research questionnaire with a consent note, Likert-scale statements and optional demographics placed last. Replace the sample statements with your own.",
      isClarification: false,
      suggestions: ["Add 5 more Likert statements", "Add an open-ended question", "Create Google Form"],
      formDefinition: {
        title: "Research Questionnaire",
        description:
          "This survey is for academic research. Participation is voluntary, responses are anonymous and used only for this study. You may stop at any time.",
        confirmationMessage: "Thank you for taking part in this study.",
        sections: [
          {
            id: generateId("sec"),
            title: "Consent",
            questions: [
              q("I have read the above and agree to participate", "CHECKBOXES", true, { options: opts("I agree") }),
            ],
          },
          {
            id: generateId("sec"),
            title: "Your Views",
            description: "Rate how much you agree with each statement.",
            questions: [
              likert("Statement 1"),
              likert("Statement 2"),
              likert("Statement 3"),
              q("Anything else you would like to add?", "PARAGRAPH", false),
            ],
          },
          {
            id: generateId("sec"),
            title: "About You (optional)",
            questions: [
              q("Age group", "MULTIPLE_CHOICE", false, {
                options: opts("Under 18", "18-21", "22-25", "26-30", "Above 30", "Prefer not to say"),
              }),
              q("Year of study", "DROPDOWN", false, {
                options: opts("1st", "2nd", "3rd", "4th", "Postgraduate", "Other"),
              }),
            ],
          },
        ],
      },
    };
  }

  if (has("peer evaluation", "peer review", "peer rating", "group project")) {
    const rate = (title: string) =>
      q(title, "LINEAR_SCALE", true, { scaleConfig: { low: 1, high: 5, lowLabel: "Poor", highLabel: "Excellent" } });
    return {
      reply: "I built a peer evaluation form with rating scales for contribution, communication and reliability.",
      isClarification: false,
      suggestions: ["Add a criterion", "Make comments required", "Create Google Form"],
      formDefinition: {
        title: "Group Project Peer Evaluation",
        description: "Rate one teammate per submission. Your answers are shared only with the instructor.",
        confirmationMessage: "Thank you. Your evaluation has been recorded.",
        sections: [
          {
            id: generateId("sec"),
            title: "Team Details",
            questions: [
              q("Your name", "SHORT_ANSWER", true),
              q("Team name / number", "SHORT_ANSWER", true),
              q("Teammate you are rating", "SHORT_ANSWER", true),
            ],
          },
          {
            id: generateId("sec"),
            title: "Ratings",
            questions: [
              rate("Quality of contribution"),
              rate("Communication"),
              rate("Reliability and meeting deadlines"),
              q("Comments", "PARAGRAPH", false),
            ],
          },
        ],
      },
    };
  }

  return null;
}
