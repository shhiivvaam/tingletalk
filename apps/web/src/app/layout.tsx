import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: '#ec4899',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
import { Outfit } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: "Tingle Talk | Anonymous Dating & Fun Chats",
    template: "%s | Tingle Talk"
  },
  description: "Meet new people, find a date, or just have fun. 100% anonymous, safe, and instant random chatting platform.",
  keywords: ["anonymous dating", "random chat", "chat with strangers", "anonymous messaging", "dating app", "instant connection", "group chat", "private chat"],
  authors: [{ name: "Tingle Talk Team" }],
  creator: "Tingle Talk",
  publisher: "Tingle Talk",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://tingletalk.com'),
  alternates: {
    canonical: '/',
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
  openGraph: {
    title: "Tingle Talk | Anonymous Dating & Fun Chats",
    description: "Meet new people, find a date, or just have fun. 100% anonymous, safe, and instant.",
    url: 'https://tingletalk.com',
    siteName: 'Tingle Talk',
    images: [
      {
        url: '/assets/logo.png',
        width: 800,
        height: 800,
        alt: 'Tingle Talk Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Tingle Talk | Anonymous Dating & Fun Chats",
    description: "Meet new people, find a date, or just have fun. 100% anonymous, safe, and instant.",
    images: ['/assets/logo.png'],
    creator: '@tingletalk',
  },
  icons: {
    icon: [
      { url: '/assets/favicon.ico', sizes: 'any' },
      { url: '/assets/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/logo.png' },
    ],
  },
  manifest: '/assets/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tingle Talk',
  },
};

import ToastContainer from "@/components/ui/ToastContainer";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} antialiased`}>
      <head>
        {/* Google Adsense */}
        <meta name="google-adsense-account" content="ca-pub-9299390652489427"></meta>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9299390652489427"
          crossOrigin="anonymous">
        </script>
        {/* AdsTerra - EffectiveGate */}
        {/* <Script
          src="https://pl28597008.effectivegatecpm.com/f6/ec/2f/f6ec2f262184e8f9a191cb7befad4db0.js"
          strategy="afterInteractive"
        /> */}
      </head>
      <body className="font-sans min-h-screen selection:bg-pink-500/30">
        <div className="aurora-bg" />
        {/* Main layout wrapper */}
        <div className="relative z-10">
          <ToastContainer />
          <PWAInstallPrompt />
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
