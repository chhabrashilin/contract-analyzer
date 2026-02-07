import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ContractIQ - Intelligent Contract Analysis",
    template: "%s | ContractIQ",
  },
  description:
    "Enterprise-grade AI-powered contract analysis. Upload documents, extract key terms, identify risks, and get instant answers with RAG technology.",
  keywords: [
    "contract analysis",
    "AI",
    "legal tech",
    "document analysis",
    "RAG",
    "enterprise",
  ],
  authors: [{ name: "ContractIQ" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContractIQ",
    title: "ContractIQ - Intelligent Contract Analysis",
    description:
      "Enterprise-grade AI-powered contract analysis platform",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
