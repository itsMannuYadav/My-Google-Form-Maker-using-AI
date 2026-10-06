import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { FormDefinitionSchema } from "@/lib/validation/formSchema";
import { buildGoogleFormsRequests, buildGoogleFormsUpdateRequests } from "@/lib/google/formsConverter";
import { FormDefinition } from "@/types/form";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { formDefinition, accessToken, googleFormId: existingGoogleFormId } = body;

    // 1. Strict Schema Validation
    const validation = FormDefinitionSchema.safeParse(formDefinition);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid form specification.",
          details: validation.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const validatedForm: FormDefinition = validation.data;
    const { initialInfo, batchRequests } = buildGoogleFormsRequests(validatedForm);

    // 2. Validate Google OAuth Access Token
    if (!accessToken || accessToken.trim() === "") {
      return NextResponse.json(
        {
          error: "Please sign in with your Google account to create this form in your Google Drive.",
          isAuthRequired: true,
        },
        { status: 401 }
      );
    }

    // 3. Real Google Forms API Execution
    try {
      const authClient = new google.auth.OAuth2();
      authClient.setCredentials({ access_token: accessToken });

      const forms = google.forms({ version: "v1", auth: authClient });

      // Already published: update the existing Google Form in place
      if (typeof existingGoogleFormId === "string" && existingGoogleFormId.trim() !== "") {
        let existing;
        try {
          existing = await forms.forms.get({ formId: existingGoogleFormId });
        } catch (getError: any) {
          // Original form was deleted from Drive — fall through and create a fresh one
          if (getError?.response?.status !== 404) throw getError;
        }

        if (existing) {
          const itemCount = existing.data.items?.length || 0;
          await forms.forms.batchUpdate({
            formId: existingGoogleFormId,
            requestBody: {
              requests: buildGoogleFormsUpdateRequests(validatedForm, itemCount) as any,
            },
          });

          return NextResponse.json({
            success: true,
            updated: true,
            googleFormId: existingGoogleFormId,
            responderUri:
              existing.data.responderUri ||
              `https://docs.google.com/forms/d/e/${existingGoogleFormId}/viewform`,
            editUri: `https://docs.google.com/forms/d/${existingGoogleFormId}/edit`,
            title: validatedForm.title,
          });
        }
      }

      // Step 1: Create the base Google Form
      const createRes = await forms.forms.create({
        requestBody: {
          info: {
            title: initialInfo.title,
            documentTitle: initialInfo.documentTitle,
          },
        },
      });

      const formId = createRes.data.formId;
      const responderUri = createRes.data.responderUri || `https://docs.google.com/forms/d/e/${formId}/viewform`;
      const editUri = `https://docs.google.com/forms/d/${formId}/edit`;

      if (!formId) {
        throw new Error("Google Forms API did not return a valid Form ID.");
      }

      // Step 2: Batch insert questions, sections, and descriptions
      if (batchRequests.length > 0) {
        await forms.forms.batchUpdate({
          formId,
          requestBody: {
            requests: batchRequests as any,
          },
        });
      }

      return NextResponse.json({
        success: true,
        googleFormId: formId,
        responderUri,
        editUri,
        title: validatedForm.title,
      });
    } catch (googleError: any) {
      // Log only status/message: the full error object carries request config, including the Authorization header.
      console.error(
        "Google Forms API execution error:",
        googleError?.response?.status,
        googleError?.response?.data?.error?.message || googleError?.message
      );

      const errorData = googleError?.response?.data?.error || {};
      const errorMessage = errorData.message || googleError?.message || "Could not connect to Google Forms service.";

      const isApiDisabled =
        errorMessage.includes("has not been used in project") ||
        errorMessage.includes("disabled") ||
        errorMessage.includes("SERVICE_DISABLED") ||
        errorMessage.includes("accessNotConfigured");

      const isPermissionError =
        errorMessage.includes("insufficientPermissions") ||
        errorMessage.includes("PERMISSION_DENIED") ||
        errorMessage.includes("forms.body") ||
        errorMessage.includes("invalid_grant");

      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const enableUrl = projectId
        ? `https://console.cloud.google.com/apis/library/forms.googleapis.com?project=${projectId}`
        : "https://console.cloud.google.com/apis/library/forms.googleapis.com";

      let userFriendlyMsg = "We could not create the Google Form in your Google Drive.";
      if (isApiDisabled) {
        userFriendlyMsg = `The Google Forms API is not yet enabled on your Google Cloud Project${projectId ? ` (${projectId})` : ""}.`;
      } else if (isPermissionError) {
        userFriendlyMsg = "Your Google account session has expired or requires Google Forms permissions. Please sign out and sign in with Google again.";
      }

      return NextResponse.json(
        {
          error: userFriendlyMsg,
          isApiDisabled,
          isPermissionError,
          enableUrl,
          technicalDetails: errorMessage,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("API /api/google/create-form error:", error?.message);
    return NextResponse.json(
      {
        error: "An unexpected error occurred while creating the form. Your draft has been kept safe.",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
