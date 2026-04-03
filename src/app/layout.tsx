import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eredivisie.tv — Wedstrijden & TV Gids | Eredivisie op TV",
  description: "Bekijk alle Eredivisie wedstrijden en ontdek waar je ze live kunt zien op TV en online. Compleet programma, uitslagen, stand en TV gids voor de Nederlandse Eredivisie.",
  keywords: "eredivisie, eredivisie tv, eredivisie op tv, voetbal op tv, eredivisie programma, eredivisie stand, eredivisie uitslagen, espn eredivisie",
  openGraph: {
    title: "Eredivisie.tv — Wedstrijden & TV Gids",
    description: "Alle Eredivisie wedstrijden, uitslagen, stand en waar je ze kunt kijken op TV en online.",
    type: "website",
    locale: "nl_NL",
    url: "https://eredivisie.tv",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">{children}</body>
    </html>
  );
}
