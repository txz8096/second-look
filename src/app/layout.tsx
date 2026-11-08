import type { Metadata } from "next";
import { Familjen_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const familjen = Familjen_Grotesk({
  variable: "--font-familjen",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: "400",
});

const title = "Second Look";
const description =
  "Reviews how you work with AI across Claude Code, Codex, Cursor, Antigravity, claude.ai, ChatGPT and Gemini, and keeps your skills current.";

// Link previews in Slack, iMessage and LinkedIn read these; there is no share image yet.
export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, siteName: title, type: "website" },
  twitter: { card: "summary", title, description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${familjen.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
