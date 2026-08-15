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
  metadataBase: new URL("https://big5-friends.uriva.deno.net"),
  title: {
    default: "Big 5 Friends - Discover How Friends Perceive You",
    template: "%s | Big 5 Friends",
  },
  description:
    "Compare Big 5 personality traits in your friend group. Discover how others perceive you and see who you are most similar to through pairwise comparisons!",
  keywords: [
    "Big 5 Personality Traits",
    "OCEAN Model",
    "Personality Assessment",
    "Friend Groups",
    "Social Perception",
    "Pairwise Comparisons",
  ],
  authors: [{ name: "Uri Valevski" }],
  openGraph: {
    title: "Big 5 Friends - Discover How Friends Perceive You",
    description:
      "Compare Big 5 personality traits in your friend group. See how others perceive you and discover who you are similar to through pairwise comparisons!",
    url: "https://big5-friends.uriva.deno.net",
    siteName: "Big 5 Friends",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Big 5 Friends - Discover How Friends Perceive You",
    description:
      "Compare Big 5 personality traits in your friend group. See how others perceive you and discover who you are similar to!",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
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
