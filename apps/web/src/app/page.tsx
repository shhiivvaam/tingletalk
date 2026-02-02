import { Metadata } from 'next';
import AnimatedHero from '@/components/home/AnimatedHero';
import AnimatedFeatures from '@/components/home/AnimatedFeatures';
import QuickEntryForm from '@/components/home/QuickEntryForm';
import StructuredData from '@/components/SEO/StructuredData';
import Footer from '@/components/layout/Footer';
import LandingInfo from '@/components/home/LandingInfo';
import AdUnit from '@/components/ads/AdUnit';

export const metadata: Metadata = {
  title: "Tingle Talk | #1 Anonymous Dating & Random Chat Platform",
  description: "Experience the thrill of anonymous dating and random chats with Tingle Talk. Connect instantly with strangers worldwide. No sign-up, 100% private, and safe.",
  alternates: {
    canonical: 'https://tingletalk.com',
  },
};

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-x-hidden">
      <StructuredData />

      {/* Top Banner Ad */}
      <div className="w-full max-w-6xl mx-auto pt-4 px-4">
        <AdUnit
          // Default slot used (Native Banner)
          format="horizontal"
          label="Homepage Top Banner"
          style={{ minHeight: '90px' }}
        />
      </div>

      <div className="flex flex-col items-center justify-center p-4 w-full min-h-screen">
        {/* Background blobs - move to static for better LCP */}
        <div className="absolute top-[10%] left-[15%] w-72 h-72 bg-pink-600/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-[10%] right-[15%] w-72 h-72 bg-indigo-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] right-[25%] w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] animate-blob animation-delay-4000" />

        <div className="w-full max-w-6xl z-10 grid lg:grid-cols-2 gap-12 items-center py-20">

          {/* Left Column: Semantic Content */}
          <section className="text-center lg:text-left space-y-8">
            <AnimatedHero />
            <AnimatedFeatures />
          </section>

          {/* Right Column: Interactive Form */}
          <section className="w-full max-w-md mx-auto space-y-8">
            {/* Ad above form for visibility */}
            <AdUnit
              // Default slot
              format="rectangle"
              label="Form Top Ad"
              style={{ minHeight: '250px' }}
            />
            <QuickEntryForm />
          </section>
        </div>
      </div>

      {/* Mid Page Ad */}
      <div className="w-full max-w-4xl mx-auto py-8 px-4">
        <AdUnit
          // Default slot
          format="auto"
          label="Homepage Mid Banner"
          style={{ minHeight: '160px', maxHeight: '250px' }}
        />
      </div>

      <LandingInfo />

      {/* Bottom Page Ad */}
      <div className="w-full max-w-6xl mx-auto py-8">
        <AdUnit
          // Default slot
          format="auto"
          label="Homepage Bottom Banner"
          style={{ minHeight: '160px', maxHeight: '250px' }}
        />
      </div>

      <Footer />
    </main>
  );
}
