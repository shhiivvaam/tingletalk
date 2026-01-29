import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Tingle Talk | Anonymous Dating & Fun Chats",
  description: "Meet new people, find a date, or just have fun. 100% anonymous, safe, and instant.",
  icons: {
    icon: '/favicon.png',
  },
};

import ToastContainer from "@/components/ui/ToastContainer";

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
        <Script
          src="https://pl28597008.effectivegatecpm.com/f6/ec/2f/f6ec2f262184e8f9a191cb7befad4db0.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="font-sans min-h-screen selection:bg-pink-500/30">
        <div className="aurora-bg" />
        <div className="relative z-10">
          <ToastContainer />
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
