import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import Navbar from "@/components/Navbar";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Create Google Forms with AI`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "Google Forms",
    "My AI Form Maker",
    "AI form builder",
    "form generator",
    "survey maker",
    "quiz maker",
    "government forms",
    "education forms",
    "student quiz maker",
    "research survey",
    "client intake form",
    "law firm forms",
  ],
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Create Google Forms with AI`,
    description: siteConfig.description,
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${siteConfig.name} — create Google Forms with AI` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Create Google Forms with AI`,
    description: siteConfig.description,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: { capable: true, title: siteConfig.shortName, statusBarStyle: "default" },
  formatDetection: { telephone: false, email: false, address: false },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the layout viewport shrink when the on-screen keyboard opens
  // (supported in Chrome/Android) so the chat composer stays above the
  // keyboard instead of being covered by it.
  interactiveWidget: "resizes-content",
  themeColor: siteConfig.themeColor,
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/globals.css" />
      </head>
      <body className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900 font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
