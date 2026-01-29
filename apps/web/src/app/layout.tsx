import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Tingle Talk | Instant Anonymous Chat",
  description: "Connect with anyone, anywhere, instantly. No registration, 100% private, 100% anonymous.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-9299390652489427"></meta>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9299390652489427"
          crossOrigin="anonymous">
        </script>
      </head>
      <body className="font-sans">
        <div className="mesh-gradient" />
        {children}
      </body>
    </html>
  );
}
