// Accepts "https://example.com", "example.com", or "example.com/" and always
// returns an absolute origin without a trailing slash.
function resolveSiteUrl(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return "http://localhost:3000";
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export const siteConfig = {
  name: "My AI Form Maker",
  shortName: "Form Maker",
  tagline: "Google Forms Assistant",
  description:
    "Describe the form you need in plain language and publish it straight to Google Forms. Built for students, teachers, lawyers and legal teams, government officers, and administrative staff.",
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_APP_URL),
  themeColor: "#1a365d",
  backgroundColor: "#f8fafc",
};
