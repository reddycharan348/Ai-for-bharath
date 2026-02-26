import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Super Agent AI — One Interface. Every AI. Perfect Answers.",
  description:
    "Super Agent AI is an intelligent orchestration platform that integrates multiple specialized AI systems into one unified interface. Ask once. Get the best intelligence automatically.",
  keywords: [
    "AI",
    "Artificial Intelligence",
    "AI Orchestration",
    "Multi-AI",
    "Super Agent",
    "Smart Routing",
    "AI Platform",
  ],
  openGraph: {
    title: "Super Agent AI — One Interface. Every AI. Perfect Answers.",
    description:
      "Ask once. Get the best intelligence automatically. One unified interface for every AI.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Super Agent AI",
    description:
      "One Interface. Every AI. Perfect Answers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
