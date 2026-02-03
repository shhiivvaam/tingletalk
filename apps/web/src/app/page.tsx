import { Metadata } from 'next';
import AnimatedHero from '@/components/home/AnimatedHero';
import AnimatedFeatures from '@/components/home/AnimatedFeatures';
import QuickEntryForm from '@/components/home/QuickEntryForm';
import { FAQStructuredData } from '@/components/SEO/StructuredData';
import Footer from '@/components/layout/Footer';
import LandingInfo from '@/components/home/LandingInfo';
import AdUnit from '@/components/ads/AdUnit';
import { AD_CONFIG } from '@/constants/ads';

export const metadata: Metadata = {
  title: "Tingle Talk | The Best Anonymous Dating Site & Private Chatting Platform",
  description: "Experience the thrill of anonymous dating and private chatting with Tingle Talk. The #1 anonymous dating site to connect instantly with strangers worldwide. 100% private, safe, and secure.",
  alternates: {
    canonical: 'https://tingletalk.com',
  },
  keywords: ["anonymous dating site", "private chatting site", "tingletalk", "tingle talk", "free dating site", "anonymous chat"],
};

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-x-hidden">
      <FAQStructuredData />

      {/* Top Banner Ad */}
      {AD_CONFIG.ENABLE_ADS && (
        <div className="w-full max-w-6xl mx-auto pt-28 px-4">
          <AdUnit
            type="adsterra-native"
            format="horizontal"
            label="Top Homepage Banner"
          />
        </div>
      )}

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
          <section id="start" className="w-full max-w-md mx-auto space-y-8 scroll-mt-32">
            <AdUnit
              type="adsterra-native"
              format="rectangle"
              label="Interactive Form Ad"
            />
            <QuickEntryForm />
          </section>
        </div>
      </div>

      {/* Mid Page Ad */}
      {AD_CONFIG.ENABLE_ADS && (
        <div className="w-full max-w-4xl mx-auto py-4 md:py-8 px-4">
          <AdUnit
            type="adsterra-native"
            format="auto"
            label="Mid Homepage Banner"
          />
        </div>
      )}

      <LandingInfo />

      {/* Bottom Page Ad */}
      {AD_CONFIG.ENABLE_ADS && (
        <div className="w-full max-w-6xl mx-auto py-4 md:py-8">
          <AdUnit
            type="adsterra-native"
            format="auto"
            label="Bottom Homepage Banner"
          />
        </div>
      )}

      <Footer />
    </main>
  );
}
