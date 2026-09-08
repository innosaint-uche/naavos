import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://naavos.radoss.agency'),
  title: 'NAAvOS | User-owned Avatar OS',
  description:
    'An open-source local-first Avatar OS. Download the desktop MVP, follow the personal setup guide, and connect supported AI hosts without NAAvOS-managed hosting.',
  keywords: [
    'AI avatar',
    'cognitive profile',
    'AI agent customization',
    'context management',
    'MCP',
    'Model Context Protocol',
    'AI productivity',
    'personal AI assistant',
    'AI tools integration',
    'Claude Code',
    'Gemini CLI',
    'Cursor AI',
  ],
  authors: [{ name: 'NAAvOS Contributors' }],
  openGraph: {
    title: 'NAAvOS | User-owned Avatar OS',
    description:
      'Download the open-source local desktop MVP, configure your personal Avatar, and connect supported AI hosts with reversible setup.',
    type: 'website',
    locale: 'en_US',
    siteName: 'NAAvOS',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'NAAvOS - Neuro AI Avatar OS System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NAAvOS | User-owned Avatar OS',
    description:
      'Open-source local Avatar context with explicit privacy, scope, adapters, and evidence gates.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://naavos.radoss.agency',
  },
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
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'NAAvOS',
              description:
                'Local-first Avatar OS for inspectable context, reversible host adapters, privacy controls and evidence-gated integrations.',
              url: 'https://naavos.radoss.agency',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Windows, macOS, Linux',
              license: 'https://opensource.org/licenses/MIT',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} bg-[#09090b] text-zinc-100 antialiased overflow-x-hidden font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
