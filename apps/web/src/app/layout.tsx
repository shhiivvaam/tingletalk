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
      <body className="font-sans">
        <div className="mesh-gradient" />
        {children}
      </body>
    </html>
  );
}
