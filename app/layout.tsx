import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { data, siteName } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = data.profile ? `Contribution Skyline · ${siteName}` : "Contribution Skyline";
const description = `A year of GitHub contributions${data.profile ? ` by ${data.profile.login}` : ""}, as a heat map and an interactive 3D skyline.`;
// The deploy workflow sets PAGES_BASE_URL, so search engines get one canonical address.
const siteUrl = process.env.PAGES_BASE_URL ? `${process.env.PAGES_BASE_URL.replace(/\/$/, "")}/` : undefined;

export const metadata: Metadata = {
  title,
  description,
  ...(siteUrl && { metadataBase: new URL(siteUrl), alternates: { canonical: siteUrl } }),
  openGraph: { type: "website", title, description, url: siteUrl, siteName },
  twitter: { card: "summary", title, description },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
