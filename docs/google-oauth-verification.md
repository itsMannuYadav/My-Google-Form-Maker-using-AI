# Google OAuth verification: submission notes

App: My AI Form Maker, https://gform.mannuyadav.me
Developer / support contact: yadavmannunsy@gmail.com
Privacy policy: https://gform.mannuyadav.me/privacy
Terms of service: https://gform.mannuyadav.me/terms

Use the same email in Cloud Console -> Auth Platform -> Branding (user support
email) and the developer contact email, so everything matches.

## Scope justifications (paste into the Data Access / verification form)

### https://www.googleapis.com/auth/forms.body  (sensitive)
My AI Form Maker lets a user describe a form in plain language (or attach a
document) and turns it into a Google Form. We need forms.body to create the
form in the signed-in user's own Google account through the Google Forms API
(forms.create and forms.batchUpdate, which add the questions, sections and
settings). We also use it to read the structure of a form that this app
previously created for the user (forms.get), so that when the user edits their
draft and republishes, we can replace that form's questions with the updated
version instead of creating a duplicate. We only act on forms the user asks us
to create or update from inside the app. We do not read or modify any other
forms, and we never read responses submitted to forms. A narrower scope is not
sufficient because creating and editing form content is only permitted by
forms.body.

### https://www.googleapis.com/auth/drive.file  (non-sensitive)
We use drive.file so that the Google Forms the app creates are saved to the
user's Google Drive and can be opened by the user. This scope limits our access
to files the app itself creates or that the user explicitly opens with it. We
cannot see or access any other file in the user's Drive.

### Why not broader scopes
We do not request drive, drive.readonly, or forms.responses.readonly. The app
never needs the user's other Drive files or the answers people submit to their
forms. Those stay in the user's own Google account.

### How user data is handled (short answer for the "data use" questions)
- The OAuth access token is kept in the user's browser and sent to our server
  only for the single create/update request. It is not stored or logged on the
  server.
- Google user data is used only to provide the form-creation features and is
  not used for ads, not sold, not transferred except as needed to provide the
  feature, and not used to train AI models.
- Users can revoke access at https://myaccount.google.com/permissions and can
  request data deletion by email (see the privacy policy).

## Demo video script (YouTube, unlisted, about 3 to 4 minutes)

Recording tips: record the whole screen in a single take, with the browser
address bar always visible. Use a brand-new test Google account that has never
approved the app, so the consent screen appears. Speak clearly or add captions.
Make sure the video is set to Unlisted (not Private) and paste the link into the
verification form. Record in English.

1. **Intro (0:00)**
   Show the address bar at https://gform.mannuyadav.me. Say: "This is My AI
   Form Maker. It turns a plain-language description into a Google Form in the
   user's own account. I'll show the full sign-in flow and how we use the
   requested Google permissions."

2. **Sign in and consent screen (0:20)**
   Go to /login and click "Sign in with Google". Pause on the consent screen
   long enough for the app name, the app's client ID or URL, and the list of
   requested permissions to be readable. Say: "The app asks to create and edit
   Google Forms (forms.body) and to save files it creates in Drive
   (drive.file). It does not ask for access to other Drive files." Click Allow.

3. **Create a form (1:00)**
   In the builder, type a prompt such as "Event registration form with name,
   email, phone number and a dropdown for session." Show the AI-generated
   preview. Say: "The prompt goes to the AI provider only to generate the
   structure. No Google data is sent there."

4. **Publish to Google Forms (1:45)**
   Click the publish / create-in-Google-Forms button. Show the success message
   and open the resulting link. Show that the form now exists in the user's
   Google Forms and in Google Drive, with the right title and questions. Say:
   "This is forms.body (create) and drive.file (save to Drive) in action."

5. **Update an existing form (2:30)**
   Back in the app, open the form from the dashboard, change a question (for
   example add a field), and republish. Show the same Google Form now has the
   updated questions with no duplicate created. Say: "Here we read the
   structure of a form this app created and replace its questions, which is
   why we need forms.body."

6. **Data handling and revocation (3:15)**
   Open https://gform.mannuyadav.me/privacy and scroll to "Google User Data &
   Permissions". Say: "We only use Google data to provide these features, we
   don't use it for ads, we don't sell it, and we don't train AI on it." Then
   open https://myaccount.google.com/permissions to show the app listed and
   the Remove access option.

7. **Close (3:40)**
   Say: "That is the complete flow and use of every Google permission the app
   requests."

## Pre-submission checklist
- [ ] mannuyadav.me verified in Google Search Console (Domain property)
- [ ] mannuyadav.me added under Authorized domains in Branding
- [ ] Homepage, privacy policy and terms URLs set in Branding and reachable
- [ ] gform.mannuyadav.me added to Firebase -> Authentication -> Authorized domains
- [ ] Google Forms API enabled in the Cloud project
- [ ] forms.body and drive.file added under Data Access, with justifications
- [ ] App set to "In production" under Audience
- [ ] Demo video link ready (unlisted)
- [ ] developer / support email is yadavmannunsy@gmail.com everywhere
