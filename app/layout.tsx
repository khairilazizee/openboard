import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { getBaseUrl } from "./lib/seo";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "OpenBoard",
    template: "%s | OpenBoard",
  },
  description: "Post your ads to the world and share it with your friends.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: baseUrl,
    title: "OpenBoard",
    description: "Post your ads to the world and share it with your friends.",
    siteName: "OpenBoard",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenBoard",
    description: "Post your ads to the world and share it with your friends.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={cn("font-sans", inter.variable)}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Header />
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
