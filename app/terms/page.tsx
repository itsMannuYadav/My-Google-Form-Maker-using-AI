import { FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of My AI Form Maker.",
};

const SUPPORT_EMAIL = "yadavmannunsy@gmail.com";
const EFFECTIVE_DATE = "October 6, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="text-sm text-slate-600 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function TermsOfServicePage() {
  return (
    <div className="flex-1 bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-gov-200 bg-gov-50 px-3.5 py-1 text-xs font-semibold text-gov-800">
            <FileText className="h-3.5 w-3.5" />
            <span>Terms of Service</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My AI Form Maker Terms of Service
          </h1>
          <p className="text-xs text-slate-500">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-8">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using My AI Form Maker (&quot;the service&quot;), you agree to these
              Terms of Service and our{" "}
              <a href="/privacy" className="text-gov-700 underline hover:text-gov-900">
                Privacy Policy
              </a>
              . If you do not agree, please do not use the service. My AI Form Maker is operated by
              Mannu Yadav at gform.mannuyadav.me. You must be at least 18 years old, or have the
              consent of a parent, guardian, or your institution, to use it.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              My AI Form Maker lets you describe a form in natural language and uses AI to generate a
              structured Google Form, which is created directly in your own Google Drive using
              your authorized Google Account. You can edit the form in a live preview, save drafts,
              and later update forms you published through the service.
            </p>
            <p>
              A guest mode lets you try the builder without a Google Account. Guest drafts are
              stored only in your browser, and creating a Google Form requires signing in with
              Google.
            </p>
            <p>
              Form generation is done by third-party AI services: our default provider (Groq), or
              Google Gemini if you add your own API key. If you use your own key, you are
              responsible for any usage limits or charges on that key.
            </p>
          </Section>

          <Section title="3. Your Google Account &amp; Permissions">
            <p>
              To create forms, you must sign in with Google and grant permission to create and
              manage Google Forms and Drive files created by My AI Form Maker. You may revoke this
              permission at any time from your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gov-700 underline hover:text-gov-900"
              >
                Google Account permissions page
              </a>
              . Revoking access will prevent the service from creating or editing forms until you
              sign in again.
            </p>
            <p>
              We request only the permissions needed to create and edit the forms you ask for and
              to save them in your Drive. How we handle Google user data is described in our{" "}
              <a href="/privacy" className="text-gov-700 underline hover:text-gov-900">
                Privacy Policy
              </a>
              . You must also follow the{" "}
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gov-700 underline hover:text-gov-900"
              >
                Google Terms of Service
              </a>{" "}
              when using Google Forms and Drive.
            </p>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to use the service to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create forms for unlawful, fraudulent, or deceptive purposes, including phishing, or any form that asks respondents for passwords, one-time codes, or payment card details.</li>
              <li>Send spam or bulk unsolicited messages using forms created with the service.</li>
              <li>Collect sensitive personal data (health records, financial credentials, government IDs) without a lawful basis and appropriate consent from respondents.</li>
              <li>Attempt to disrupt, reverse-engineer, or abuse the service, its APIs, or rate limits.</li>
              <li>Impersonate any person or organization, or misrepresent your affiliation.</li>
            </ul>
          </Section>

          <Section title="5. Your Content">
            <p>
              You retain full ownership of the forms, questions, and responses you create. Google
              Forms created through My AI Form Maker live in your own Google Drive, and respondent
              answers are delivered directly to your Google account &mdash; we do not access or
              store them.
            </p>
            <p>
              As the owner of a form, you are responsible for how you collect, use, and protect the
              responses you receive, including giving respondents any privacy notice and obtaining
              any consent that applicable law requires.
            </p>
          </Section>

          <Section title="6. AI-Generated Content Disclaimer">
            <p>
              Form structures are generated by an AI model based on your instructions. While we
              aim for accuracy, AI output can occasionally be incomplete or misinterpret a request.
              Always review the live preview before publishing a form, especially for official,
              legal, or government use cases.
            </p>
          </Section>

          <Section title="7. Updating Published Forms">
            <p>
              When you update a form you published through the service, its questions and sections
              are replaced with the version in the builder. Responses already collected are kept
              in your Google account, but answers to edited questions may be stored separately from
              answers to the new version. Review changes carefully before updating a form that is
              already collecting responses.
            </p>
            <p>
              Some Google Forms settings, such as the confirmation message shown after submission,
              cannot be set through Google&apos;s API. You are responsible for configuring those
              settings in Google Forms.
            </p>
          </Section>

          <Section title="8. Service Availability">
            <p>
              The service is provided &quot;as is&quot; and &quot;as available&quot;, without
              warranties of any kind, express or implied. We do not guarantee uninterrupted or
              error-free operation, and features may change as the product evolves.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, My AI Form Maker and its developer are not
              liable for any indirect, incidental, or consequential damages arising from your use
              of the service, including issues with forms created, data submitted by respondents,
              or third-party services (Google, Groq, Google Gemini) the app depends on.
            </p>
          </Section>

          <Section title="10. Termination">
            <p>
              You may stop using the service at any time and revoke its Google Account access. We
              may suspend or terminate access for accounts that violate these terms.
            </p>
          </Section>

          <Section title="11. Changes to These Terms">
            <p>
              We may update these terms as the service evolves. Continued use of the service after
              changes take effect constitutes acceptance of the updated terms.
            </p>
          </Section>

          <Section title="12. Governing Law">
            <p>
              These terms are governed by the laws of India, without regard to conflict-of-law
              principles, unless otherwise required by applicable local law.
            </p>
          </Section>

          <Section title="13. Contact Us">
            <p>
              Questions about these terms? Email{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-gov-700 underline hover:text-gov-900">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
