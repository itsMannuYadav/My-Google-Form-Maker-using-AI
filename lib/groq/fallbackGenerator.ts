import { FormDefinition, FormQuestion, FormSection } from "@/types/form";
import { AIFormResponseType } from "@/lib/validation/formSchema";
import { generateId } from "@/lib/utils";
import { matchDomainTemplate } from "./domainTemplates";

/**
 * Intelligent Conversational Assistant & Form Generation Engine.
 * Accurately detects intent: Small talk, Help/Inquiry, Form Creation, Form Modification.
 */
export function generateSmartFallbackForm(
  prompt: string,
  currentForm?: FormDefinition | null
): AIFormResponseType {
  const lower = prompt.toLowerCase().trim();
  const clean = lower.replace(/[!?,.]/g, "").trim();

  // =========================================================================
  // 1. SMALL TALK & GREETINGS (Never generate or overwrite forms on small-talk)
  // =========================================================================
  const greetings = ["hi", "hii", "hiii", "hello", "helo", "hey", "heyy", "namaste", "good morning", "good afternoon", "good evening", "greetings", "pranam"];
  if (greetings.includes(clean)) {
    return {
      reply: "Hello! I'm My AI Form Maker, your AI Google Forms assistant. I can help you create and structure any Google Form from plain English. What kind of form would you like to build today?",
      isClarification: false,
      suggestions: [
        "Registration form for students and teachers",
        "Scholarship application form",
        "Citizen feedback survey with 1-5 ratings",
        "Employee project evaluation form",
      ],
      formDefinition: currentForm || undefined,
    };
  }

  const howAreYou = ["how are you", "how r u", "how are you doing", "how do you do", "hows it going", "how is it going", "whats up", "what's up", "kya haal chal", "kya haal", "kya hal chal", "kaise ho", "kese ho", "sab badhiya", "sab theek"];
  if (howAreYou.some((h) => clean.includes(h))) {
    return {
      reply: "मैं बिल्कुल ठीक हूँ! (I'm doing well, thank you!) I'm ready to help you build or refine a Google Form. Describe what information your form should collect (for example: student registration, scholarship application, or feedback survey).",
      isClarification: false,
      suggestions: [
        "Student and teacher registration",
        "Scholarship application form",
        "Citizen feedback survey",
      ],
      formDefinition: currentForm || undefined,
    };
  }

  if (clean.includes("where do you live") || clean.includes("kaha rehte ho") || clean.includes("kaha rehta")) {
    return {
      reply: "I am an AI assistant hosted in the cloud, ready to help you create Google Forms anytime! Tell me what kind of form you would like to build.",
      isClarification: false,
      suggestions: [
        "Create student registration form",
        "Create workshop feedback survey",
        "Create job application form",
      ],
      formDefinition: currentForm || undefined,
    };
  }

  const gratitude = ["thank you", "thanks", "thx", "thank u", "great", "awesome", "perfect", "cool", "nice", "ok", "okay", "got it", "understood"];
  if (gratitude.includes(clean) || clean.startsWith("thanks") || clean.startsWith("thank you")) {
    return {
      reply: "You're very welcome! Let me know if you would like to make any adjustments (like making fields mandatory or adding more questions), or click 'Create Google Form' whenever you're ready to publish.",
      isClarification: false,
      suggestions: [
        "Make all fields mandatory",
        "Add department question",
        "Change title",
        "Create Google Form",
      ],
      formDefinition: currentForm || undefined,
    };
  }

  // =========================================================================
  // 2. HELP & CAPABILITY INQUIRIES
  // =========================================================================
  const isQuestionAboutCapabilities =
    clean.includes("what can you do") ||
    clean.includes("who are you") ||
    clean.includes("how does this work") ||
    clean.includes("how to use") ||
    clean.includes("what question types") ||
    clean.includes("help me");

  if (isQuestionAboutCapabilities) {
    return {
      reply: "I can generate and publish real Google Forms directly into your Google Drive! You can describe any requirement in plain English (e.g., 'Create a school registration form with roll number and student details') or tell me to edit existing fields ('Make mobile required', 'Add district question', 'Remove gender').",
      isClarification: false,
      suggestions: [
        "Create a registration form for students",
        "Create a feedback survey with ratings",
        "Create a scholarship application",
      ],
      formDefinition: currentForm || undefined,
    };
  }

  // =========================================================================
  // 3. FORM MODIFICATIONS (When a form draft already exists)
  // =========================================================================
  if (currentForm && currentForm.sections && currentForm.sections.length > 0) {
    const updatedForm = JSON.parse(JSON.stringify(currentForm)) as FormDefinition;

    // A. Make mandatory / required
    if (lower.includes("mandatory") || lower.includes("required")) {
      const targetNames: string[] = [];
      updatedForm.sections.forEach((sec) => {
        sec.questions.forEach((q) => {
          const qLower = q.title.toLowerCase();
          const match =
            (lower.includes("all") && (lower.includes("question") || lower.includes("field") || lower.includes("mandatory") || lower.includes("required"))) ||
            (lower.includes("mobile") && (qLower.includes("mobile") || qLower.includes("phone"))) ||
            (lower.includes("email") && qLower.includes("email")) ||
            (lower.includes("name") && qLower.includes("name")) ||
            (lower.includes("roll") && qLower.includes("roll")) ||
            (lower.includes("employee") && qLower.includes("employee")) ||
            (lower.includes("feedback") && qLower.includes("feedback")) ||
            lower.includes(qLower);

          if (match) {
            q.required = true;
            targetNames.push(q.title);
          }
        });
      });

      if (targetNames.length > 0) {
        return {
          reply: `I have updated your form and marked ${targetNames.map((n) => `"${n}"`).join(", ")} as mandatory (*).`,
          isClarification: false,
          suggestions: ["Add another question", "Change title", "Create Google Form"],
          formDefinition: updatedForm,
        };
      }
    }

    // B. Remove / delete question
    if (lower.includes("remove") || lower.includes("delete")) {
      const removedList: string[] = [];
      updatedForm.sections.forEach((sec) => {
        sec.questions = sec.questions.filter((q) => {
          const qLower = q.title.toLowerCase();
          const match =
            (lower.includes("gender") && qLower.includes("gender")) ||
            (lower.includes("district") && qLower.includes("district")) ||
            (lower.includes("email") && qLower.includes("email")) ||
            (lower.includes("employee") && (qLower.includes("employee") || qLower.includes("staff"))) ||
            (lower.includes("mobile") && qLower.includes("mobile")) ||
            lower.includes(qLower);
          if (match) removedList.push(q.title);
          return !match;
        });
      });

      if (removedList.length > 0) {
        return {
          reply: `I have removed ${removedList.map((n) => `"${n}"`).join(", ")} from your form.`,
          isClarification: false,
          suggestions: ["Add a new question", "Change title", "Create Google Form"],
          formDefinition: updatedForm,
        };
      }
    }

    // C. Add specific question to existing form
    if (lower.includes("add") || lower.includes("include") || lower.includes("insert")) {
      const addedQuestions: FormQuestion[] = [];

      if (lower.includes("department")) {
        addedQuestions.push({
          id: generateId("q"),
          title: "Department / Wing",
          type: "SHORT_ANSWER",
          required: false,
        });
      }
      if (lower.includes("district")) {
        addedQuestions.push({
          id: generateId("q"),
          title: "District / Region",
          type: "SHORT_ANSWER",
          required: true,
        });
      }
      if (lower.includes("emergency") || (lower.includes("contact") && lower.includes("number"))) {
        addedQuestions.push({
          id: generateId("q"),
          title: "Emergency Contact Number",
          type: "SHORT_ANSWER",
          required: false,
        });
      }
      if (lower.includes("rating") || lower.includes("scale")) {
        addedQuestions.push({
          id: generateId("q"),
          title: "Overall Satisfaction Rating",
          type: "LINEAR_SCALE",
          required: true,
          scaleConfig: { low: 1, high: 5, lowLabel: "Poor", highLabel: "Excellent" },
        });
      }

      if (addedQuestions.length === 0) {
        const cleanTitle = prompt
          .replace(/add\s*(a\s*)?(question\s*)?(for\s*)?(asking\s*)?/i, "")
          .trim();
        addedQuestions.push({
          id: generateId("q"),
          title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) || "Additional Information",
          type: "SHORT_ANSWER",
          required: false,
        });
      }

      updatedForm.sections[0].questions.push(...addedQuestions);
      return {
        reply: `I have added ${addedQuestions.map((q) => `"${q.title}"`).join(", ")} to your form.`,
        isClarification: false,
        suggestions: ["Make it required", "Add another question", "Create Google Form"],
        formDefinition: updatedForm,
      };
    }

    // D. Change title
    if (lower.includes("title") || lower.includes("rename")) {
      const cleanTitle = prompt.replace(/(change|set|update)\s*(the\s*)?title\s*(to\s*)?/i, "").trim();
      if (cleanTitle) {
        updatedForm.title = cleanTitle;
        return {
          reply: `I have updated the form title to "${cleanTitle}".`,
          isClarification: false,
          suggestions: ["Looks good, create Google Form"],
          formDefinition: updatedForm,
        };
      }
    }
  }

  // Student, research and legal templates (fresh forms only, never overwrite a draft)
  if (!currentForm) {
    const domain = matchDomainTemplate(lower);
    if (domain) return domain;
  }

  // =========================================================================
  // 4. NEW FORM GENERATION (Only when the prompt specifies requirements)
  // =========================================================================
  const sections: FormSection[] = [];
  const notes: string[] = [];

  // Check if file upload was requested
  const hasFileUpload = lower.includes("file") || lower.includes("upload") || lower.includes("document") || lower.includes("attachment") || lower.includes("resume") || lower.includes("pdf");
  if (hasFileUpload) {
    notes.push("Note: Google Forms API restricts creating direct file-upload questions via public API. I have added a secure 'Submission / Google Drive Link (URL)' question for file submission.");
  }

  // Detect key entities mentioned by the user
  const hasStudent = lower.includes("student") || lower.includes("pupil");
  const hasTeacher = lower.includes("teacher") || lower.includes("faculty") || lower.includes("staff");
  const hasEmployee = lower.includes("employee") || lower.includes("worker");
  const hasSchool = lower.includes("school") || lower.includes("college") || lower.includes("university") || lower.includes("institute");
  const hasRoll = lower.includes("roll") || lower.includes("student id") || lower.includes("enrollment");
  const hasEmpId = lower.includes("employee id") || lower.includes("emp id") || lower.includes("staff id");
  const hasFeedback = lower.includes("feedback") || lower.includes("survey") || lower.includes("review") || lower.includes("opinion") || lower.includes("rating");
  const hasProject = lower.includes("project") || lower.includes("assignment") || lower.includes("task");
  const hasDate = lower.includes("date") || lower.includes("dob") || lower.includes("birth");
  const hasMobile = lower.includes("mobile") || lower.includes("phone") || lower.includes("contact");
  const hasEmail = lower.includes("email");
  const hasDistrict = lower.includes("district") || lower.includes("city") || lower.includes("address");
  const isScholarship = lower.includes("scholarship");

  // If prompt is too vague and has no recognizable form requirements, ask clarifying question
  const isFormPrompt =
    hasStudent ||
    hasTeacher ||
    hasEmployee ||
    hasSchool ||
    hasRoll ||
    hasEmpId ||
    hasFeedback ||
    hasProject ||
    hasDate ||
    hasMobile ||
    hasEmail ||
    hasDistrict ||
    isScholarship ||
    lower.includes("create") ||
    lower.includes("form") ||
    lower.includes("registration") ||
    lower.includes("application") ||
    lower.includes("survey") ||
    lower.includes("collect");

  if (!isFormPrompt && !currentForm) {
    return {
      reply: `I understand you said: "${prompt}". What specific details or fields would you like this form to collect? You can choose one of the templates below or type your requirements.`,
      isClarification: true,
      suggestions: [
        "Registration form for students and teachers",
        "Scholarship application form",
        "Project feedback survey",
      ],
      formDefinition: undefined,
    };
  }

  // Determine Title
  let title = "Official Information & Registration Form";
  if (hasStudent && hasProject && hasFeedback) {
    title = "Student Project Feedback & Registration Form";
  } else if (hasStudent && hasTeacher) {
    title = "Student & Teacher Registration Form";
  } else if (hasProject && hasFeedback) {
    title = "Project Feedback & Progress Evaluation Form";
  } else if (hasStudent || hasSchool) {
    title = "School Student Registration Form";
  } else if (hasFeedback) {
    title = "Feedback & Evaluation Survey";
  } else if (isScholarship) {
    title = "Scholarship Application Form";
  } else if (prompt.length < 50 && (lower.includes("form") || lower.includes("survey") || lower.includes("registration"))) {
    title = prompt.charAt(0).toUpperCase() + prompt.slice(1);
  }

  // Section 1: Basic Information
  const basicQuestions: FormQuestion[] = [];

  if (hasSchool) {
    basicQuestions.push({
      id: generateId("q"),
      title: "School / Institution Name",
      type: "SHORT_ANSWER",
      required: true,
    });
  }

  if (hasStudent) {
    basicQuestions.push({
      id: generateId("q"),
      title: "Student Full Name",
      type: "SHORT_ANSWER",
      required: true,
    });
  } else {
    basicQuestions.push({
      id: generateId("q"),
      title: "Full Name",
      type: "SHORT_ANSWER",
      required: true,
    });
  }

  if (hasRoll) {
    basicQuestions.push({
      id: generateId("q"),
      title: "Roll Number / Student ID",
      type: "SHORT_ANSWER",
      required: true,
    });
  }

  if (hasEmpId || hasEmployee || hasTeacher) {
    basicQuestions.push({
      id: generateId("q"),
      title: "Employee ID / Staff Number",
      type: "SHORT_ANSWER",
      required: true,
    });
  }

  if (hasMobile || (!hasStudent && !hasTeacher)) {
    basicQuestions.push({
      id: generateId("q"),
      title: "Mobile Number",
      description: "10-digit contact number",
      type: "SHORT_ANSWER",
      required: true,
    });
  }

  if (hasEmail) {
    basicQuestions.push({
      id: generateId("q"),
      title: "Email Address",
      type: "SHORT_ANSWER",
      required: false,
    });
  }

  if (hasDistrict) {
    basicQuestions.push({
      id: generateId("q"),
      title: "District / City",
      type: "SHORT_ANSWER",
      required: true,
    });
  }

  if (hasDate) {
    basicQuestions.push({
      id: generateId("q"),
      title: "Date of Birth / Submission Date",
      type: "DATE",
      required: true,
      dateConfig: { includeYear: true, includeTime: false },
    });
  }

  sections.push({
    id: generateId("sec"),
    title: "Basic & Participant Details",
    description: "Please provide your identification and basic contact details.",
    questions: basicQuestions,
  });

  // Section 2: Project / Feedback / File Details (if requested)
  if (hasProject || hasFeedback || hasFileUpload) {
    const projectQuestions: FormQuestion[] = [];

    if (hasProject) {
      projectQuestions.push({
        id: generateId("q"),
        title: "Project Title & Topic",
        type: "SHORT_ANSWER",
        required: true,
      });
      projectQuestions.push({
        id: generateId("q"),
        title: "Project Description & Objectives",
        type: "PARAGRAPH",
        required: true,
      });
    }

    if (hasFileUpload) {
      projectQuestions.push({
        id: generateId("q"),
        title: "Project File / Google Drive Shareable Link (URL)",
        description: "Upload your document or file to Google Drive and paste the shareable link here.",
        type: "SHORT_ANSWER",
        required: true,
      });
    }

    if (hasFeedback) {
      projectQuestions.push({
        id: generateId("q"),
        title: "Project Quality & Execution Rating",
        description: "Rate from 1 (Needs Improvement) to 5 (Outstanding)",
        type: "LINEAR_SCALE",
        required: true,
        scaleConfig: { low: 1, high: 5, lowLabel: "Needs Work", highLabel: "Outstanding" },
      });
      projectQuestions.push({
        id: generateId("q"),
        title: "Detailed Project Feedback & Remarks",
        type: "PARAGRAPH",
        required: false,
      });
    }

    sections.push({
      id: generateId("sec"),
      title: hasProject ? "Project Details & Feedback" : "Feedback & Evaluation",
      description: "Provide details regarding your project progress, files, and assessment.",
      questions: projectQuestions,
    });
  }

  const formDef: FormDefinition = {
    title,
    description: "Please complete all required sections carefully. Responses will be recorded officially.",
    confirmationMessage: "Thank you. Your submission and feedback have been successfully recorded.",
    sections,
  };

  let replyText = `I have structured your form with all requested fields (${basicQuestions.map((q) => q.title).join(", ")}${sections.length > 1 ? ` and a dedicated "${sections[1].title}" section` : ""}).`;
  if (notes.length > 0) {
    replyText += ` ${notes.join(" ")}`;
  }

  return {
    reply: replyText,
    isClarification: false,
    suggestions: [
      "Make all fields mandatory",
      "Add department question",
      "Change title",
      "Looks great, create Google Form",
    ],
    formDefinition: formDef,
  };
}
