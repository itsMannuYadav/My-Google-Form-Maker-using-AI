import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description: "How My AI Form Maker collects, uses, and protects your data.",
};

const SUPPORT_EMAIL = "homeofirstt@gmail.com";
const EFFECTIVE_DATE = "September 23, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="text-sm text-slate-600 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="flex-1 bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-gov-200 bg-gov-50 px-3.5 py-1 text-xs font-semibold text-gov-800">
            <Shield className="h-3.5 w-3.5" />
            <span>Privacy Policy</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My AI Form Maker Privacy Policy
          </h1>
          <p className="text-xs text-slate-500">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-8">
          <Section title="1. Overview">
            <p>
              My AI Form Maker (&quot;we&quot;, &quot;us&quot;, &quot;the application&quot;) helps you create Google
              Forms by describing what you need in plain language. This policy explains what
              information we collect, how we use it, and how it relates to your Google Account.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>
              <span className="font-semibold text-slate-800">Account information.</span> When you
              sign in with Google, we receive your name, email address, and profile photo via
              Firebase Authentication so we can identify your account and show it in the app.
            </p>
            <p>
              <span className="font-semibold text-slate-800">Google OAuth access token.</span> When
              you grant permission, Google issues a short-lived access token scoped to{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-[12px]">forms.body</code> and{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-[12px]">drive.file</code>. The
              token is kept in your browser&apos;s storage so you stay connected between visits, and
              it is removed when you sign out. When you create or update a form, the token is sent to
              our server only for that request, so it can call the Google Forms API on your behalf.
              We do not store or log it on our servers.
            </p>
            <p>
              <span className="font-semibold text-slate-800">Form content you create.</span> The
              titles, descriptions, questions, confirmation message, and structure of forms you
              build are saved to your account (in Firebase Cloud Firestore) so you can view, resume,
              and manage your forms from the dashboard. For published forms we also save the Google
              Form ID and its links, so you can update the same form later.
            </p>
            <p>
              <span className="font-semibold text-slate-800">Guest mode.</span> If you choose
              &quot;Continue as Administrative Guest&quot;, we do not create an account for you. Your
              drafts are saved only in your browser&apos;s local storage on that device and are not
              sent to our database. Clearing your browser data removes them.
            </p>
            <p>
              <span className="font-semibold text-slate-800">Prompts you type.</span> The natural
              language descriptions and edit requests you type (e.g. &quot;add a phone number
              field&quot;) are sent to our AI provider, Groq, solely to generate or modify the form
              structure. Prompts are processed to produce a response and are not used to build
              advertising profiles.
            </p>
            <p>
              <span className="font-semibold text-slate-800">Files you upload.</span> If you attach
              an image, PDF, or Word document so the AI can build a form from it, the image or the
              text extracted from the document is sent to Groq for that single request. Uploaded
              files are processed in memory and are not saved by My AI Form Maker. Avoid uploading
              documents that contain personal or sensitive information you do not want processed.
            </p>
            <p>
              <span className="font-semibold text-slate-800">Your own Gemini API key (optional).</span>{" "}
              If you add a Google Gemini API key, it stays in your browser (for the current session,
              or on your device if you choose &quot;remember&quot;) and your browser sends your
              requests straight to Google. The key never reaches our servers. Your prompts then go to
              Google (Gemini API) instead of Groq and are governed by Google&apos;s terms; on
              Google&apos;s free tier, Google may use them to improve its products. If you attach a
              file, we read it on our server (without your key) and return its content to your browser.
              You can remove the key at any time from the builder.
            </p>
          </Section>

          <Section title="3. Information We Do Not Collect">
            <p>
              We never access, read, or store: responses submitted by the public to forms you
              create (these go directly to your own Google account), files in your Google Drive
              other than the ones My AI Form Maker creates on your behalf, or your email inbox.
            </p>
          </Section>

          <Section title="4. How We Use Information">
            <ul className="list-disc pl-5 space-y-1">
              <li>To authenticate you and keep you signed in.</li>
              <li>To create, update, and manage Google Forms and Drive files that you request.</li>
              <li>
                When you update a form you published through My AI Form Maker, to read that form&apos;s
                current structure so its questions can be replaced with your new version.
              </li>
              <li>To save and display your draft and published form history.</li>
              <li>To generate and modify form structure using AI based on your instructions.</li>
              <li>To diagnose errors and keep the service reliable and secure.</li>
            </ul>
          </Section>

          <Section title="5. Google API Services User Data Policy">
            <p>
              My AI Form Maker&apos;s use and transfer of information received from Google APIs to
              any other app adheres to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gov-700 underline hover:text-gov-900"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements. We only use Google user data to provide
              and improve the form-creation features described in this policy.
            </p>
          </Section>

          <Section title="6. Third Parties We Work With">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="font-semibold text-slate-800">Google (Firebase &amp; Google APIs).</span>{" "}
                Authentication, database storage, and creation of Forms/Drive files.
              </li>
              <li>
                <span className="font-semibold text-slate-800">Groq.</span> Processes your typed
                prompts and any files you attach to generate form structure.
              </li>
              <li>
                <span className="font-semibold text-slate-800">Google Gemini API.</span> Only if you
                add your own API key: processes your prompts and files for that request instead of Groq.
              </li>
            </ul>
            <p>We do not sell or rent your personal information to anyone.</p>
          </Section>

          <Section title="7. Data Retention &amp; Deletion">
            <p>
              Form drafts and metadata remain in your account until you delete them from the
              dashboard or request deletion. Deleting a form from the dashboard removes our record
              of it; the Google Form itself stays in your Google Drive until you delete it there. You can revoke My AI Form Maker&apos;s access to your Google
              Account at any time from your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gov-700 underline hover:text-gov-900"
              >
                Google Account permissions page
              </a>
              . To request deletion of your account data, contact us at the email below.
            </p>
          </Section>

          <Section title="8. Security">
            <p>
              All traffic is encrypted with HTTPS/TLS. Google sign-in and API access use the
              standard OAuth 2.0 protocol. Access tokens are never written to server storage or
              server logs.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              My AI Form Maker is intended for administrative, educational, and official use by
              adults. It is not directed at children, and we do not knowingly collect information
              from children.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this policy as the application evolves. Material changes will be
              reflected by updating the effective date above.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              Questions about this policy or your data? Email{" "}
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
