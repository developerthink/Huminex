import type { Metadata } from "next";
import { Syne, Work_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/components/global-cmp/providers/query-provider";
import { GoogleAnalytics } from "@next/third-parties/google";

const primary = Syne({
  subsets: ["latin"],
  variable: "--font-primary",
  display: 'swap',
});

const secondary = Work_Sans({  
  subsets: ["latin"],
  variable: "--font-secondary",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Huminex",
  description: "Transform your hiring process with AI-driven interviews that identify top talent efficiently and fairly.",
  keywords: ["AI interviews", "hiring platform", "recruitment solution", "automated interviews", "AI talent screening", "huminex", "huminex ai", "huminex ai interviews", "huminex ai hiring", "huminex ai recruitment", "huminex ai talent screening"],
  authors: [{ name: "Huminex" }],
  metadataBase: new URL('https://huminex.co'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Huminex - Next-gen Human-like Interviews",
    description: "Transform your hiring process with AI-driven interviews that identify top talent efficiently and fairly.",
    url: 'https://huminex.co',
    siteName: 'Huminex',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Huminex - AI-Powered Interview Platform',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Huminex - Next-gen Human-like Interviews',
    description: 'Transform your hiring process with AI-driven interviews that identify top talent efficiently and fairly.',
    creator: '@huminex',
    images: {
      url: '/og-image.png',
      alt: 'Huminex - AI-Powered Interview Platform',
      width: 1200,
      height: 630,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">    
      <body
        className={`${primary.variable} ${secondary.variable} font-primary antialiased`}
      >
       <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster richColors/>
      </body>
      <GoogleAnalytics gaId={process.env.GA_ID as string} />
    </html>
  );
}
