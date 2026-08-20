import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://naavos.radoss.agency'),
  title: "NAAvOS | Neuro AI - Avatar OS System — Give Every AI Your Brain",
  description: "Open-source system that makes AI agents instantly understand your cognitive profile, working style, and project history. One install. Every AI tool. Zero re-explanation.",
  keywords: ["AI avatar", "cognitive profile", "AI agent customization", "context management", "MCP", "Model Context Protocol", "AI productivity", "personal AI assistant", "AI tools integration", "Claude Code", "Gemini CLI", "Cursor AI"],
  authors: [{ name: "NAAvOS Contributors" }],
  openGraph: {
    title: "NAAvOS | Give Every AI Your Brain",
    description: "Stop re-explaining your work style to every AI agent. NAAvOS installs your cognitive profile across Claude Code, Gemini, Cursor, and every other AI tool you use — instantly.",
    type: "website",
    locale: "en_US",
    siteName: "NAAvOS",
    images: [{
      url: "/opengraph-image",
      width: 1200,
      height: 630,
      alt: "NAAvOS - Neuro AI Avatar OS System"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "NAAvOS | Give Every AI Your Brain",
    description: "Stop re-explaining your work style to every AI agent. One install. Every AI knows you.",
    images: ["/opengraph-image"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  alternates: {
    canonical: "https://naavos.radoss.agency"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "NAAvOS",
              "description": "Open-source compiler and conformance platform that makes AI agents reliably understand your cognitive profile, working style, and project history.",
              "url": "https://naavos.radoss.agency",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Windows, macOS, Linux",
              "license": "https://opensource.org/licenses/MIT",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} bg-[#09090b] text-zinc-100 antialiased overflow-x-hidden font-sans`}>
        {children}
      </body>
    </html>
  );
}