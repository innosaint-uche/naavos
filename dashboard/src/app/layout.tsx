import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "N-A-A-S — Give Every AI Your Brain",
  description: "Open-source system that makes AI agents instantly understand your cognitive profile, working style, and project history.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0f] text-gray-200 antialiased">
        {children}
      </body>
    </html>
  );
}