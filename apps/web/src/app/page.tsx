import { Metadata } from 'next';
import AnimatedHero from '@/components/home/AnimatedHero';
import AnimatedFeatures from '@/components/home/AnimatedFeatures';
import QuickEntryForm from '@/components/home/QuickEntryForm';
import StructuredData from '@/components/SEO/StructuredData';

export const metadata: Metadata = {
  title: "Tingle Talk | #1 Anonymous Dating & Random Chat Platform",
  description: "Experience the thrill of anonymous dating and random chats with Tingle Talk. Connect instantly with strangers worldwide. No sign-up, 100% private, and safe.",
  alternates: {
    canonical: 'https://tingletalk.com',
  },
};

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      <StructuredData />

      {/* Background blobs - move to static for better LCP */}
      <div className="absolute top-[10%] left-[15%] w-72 h-72 bg-pink-600/20 rounded-full blur-[100px] animate-blob" />
      <div className="absolute bottom-[10%] right-[15%] w-72 h-72 bg-indigo-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      <div className="absolute top-[40%] right-[25%] w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] animate-blob animation-delay-4000" />

      <div className="w-full max-w-6xl z-10 grid lg:grid-cols-2 gap-12 items-center">

        {/* Left Column: Semantic Content */}
        <section className="text-center lg:text-left space-y-8">
          <AnimatedHero />
          <AnimatedFeatures />

          {/* SEO Optimized hidden/subtle text for crawlers */}
          <div className="sr-only">
            <h2>Why Tingle Talk?</h2>
            <p>
              Tingle Talk is the leading platform for anonymous chat and random dating.
              Our mission is to provide a safe space for people to connect without the pressure of social profiles.
              Whether you're looking for a serious relationship, a casual date, or just someone to talk to,
              Tingle Talk makes it easy and fun. Join thousands of users online right now!
            </p>
            <ul>
              <li>Free online dating</li>
              <li>Best random chat app</li>
              <li>Secure anonymous messaging</li>
              <li>Connect with strangers safely</li>
            </ul>
          </div>
        </section>

        {/* Right Column: Interactive Form */}
        <section className="w-full max-w-md mx-auto">
          <QuickEntryForm />
        </section>
      </div>

      {/* Footer / Extra SEO content */}
      <footer className="mt-16 text-slate-500 text-sm z-10">
        <p>&copy; {new Date().getFullYear()} Tingle Talk. All rights reserved.</p>
      </footer>
    </main>
  );
}
