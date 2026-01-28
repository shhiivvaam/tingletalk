'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Zap, Globe, Shield, Users, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

const ADJECTIVES = ['Sleek', 'Neon', 'Rapid', 'Silent', 'Vibrant', 'Epic', 'Cosmic', 'Cool', 'Alpha', 'Ghost'];
const NOUNS = ['Wave', 'Shadow', 'Bolt', 'Ninja', 'Rider', 'Pulse', 'Star', 'Flow', 'Nova', 'Storm'];

export default function Home() {
  const router = useRouter();
  const setAnonymousUser = useUserStore((state) => state.setAnonymousUser);

  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(null);

  // Generate random nickname on mount
  useEffect(() => {
    const randAdj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const randNoun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const randNum = Math.floor(100 + Math.random() * 899);
    setNickname(`${randAdj}${randNoun}${randNum}`);
  }, []);

  const generateNewName = () => {
    const randAdj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const randNoun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const randNum = Math.floor(100 + Math.random() * 899);
    setNickname(`${randAdj}${randNoun}${randNum}`);
  };

  const handleStartChatting = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Instant validation/storage
    setAnonymousUser({
      username: nickname || 'AnonymousUser',
      gender: gender || 'other',
    });

    // Split-second delay for premium feel
    setTimeout(() => {
      router.push('/chat');
    }, 800);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-20">
      {/* Background Decorations */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-pink-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-violet-600/20 rounded-full blur-[120px] animate-pulse-slow" />

      <div className="relative z-10 w-full max-w-3xl text-center space-y-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-pink-400 text-sm font-medium mb-4">
            <Sparkles size={16} />
            <span>Instant Global Connections</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-6">
            Tingle<span className="text-gradient">Talk</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            The world is waiting. Connect with a stranger <span className="text-white font-medium underline decoration-pink-500 decoration-2 underline-offset-4">instantly</span>. No signups. No friction.
          </p>
        </motion.div>

        {/* Quick Onboarding Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="glass-card max-w-lg mx-auto p-1 rounded-[2.5rem]"
        >
          <div className="bg-slate-900/50 backdrop-blur-3xl rounded-[2.4rem] p-8 space-y-8">
            <form onSubmit={handleStartChatting} className="space-y-8">
              <div className="space-y-4">
                <label className="flex items-center justify-between text-sm font-medium text-slate-400 px-2">
                  <span>Who are you today?</span>
                  <button
                    type="button"
                    onClick={generateNewName}
                    className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 transition-colors"
                  >
                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    <span>Shuffle</span>
                  </button>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-pink-500 transition-colors">
                    <Hash size={20} />
                  </div>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter nickname..."
                    className="w-full glass-input pl-14 text-xl font-semibold"
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(['male', 'female', 'other'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${gender === g
                      ? 'bg-pink-500/10 border-pink-500 text-white'
                      : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
                      }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-widest">{g}</span>
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-6 text-xl flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <RefreshCw className="animate-spin" />
                ) : (
                  <>
                    <span>Start Chatting</span>
                    <ArrowRight size={24} />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Stats / Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto pt-8 border-t border-white/5"
        >
          <Stat icon={<Users size={18} />} label="1.2M+" desc="Active" />
          <Stat icon={<Globe size={18} />} label="200+" desc="Countries" />
          <Stat icon={<Zap size={18} />} label="&lt;50ms" desc="Latency" />
          <Stat icon={<Shield size={18} />} label="100%" desc="Encrypted" />
        </motion.div>
      </div>

      {/* Bottom Branding */}
      <div className="absolute bottom-8 text-slate-500 text-sm flex items-center gap-4">
        <span className="hover:text-slate-300 cursor-pointer transition-colors hover:underline">Privacy</span>
        <span className="w-1 h-1 bg-slate-800 rounded-full" />
        <span className="hover:text-slate-300 cursor-pointer transition-colors hover:underline">Terms</span>
        <span className="w-1 h-1 bg-slate-800 rounded-full" />
        <span className="text-slate-600">© 2026 TingleTalk</span>
      </div>
    </main>
  );
}

function Stat({ icon, label, desc }: { icon: any, label: string, desc: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-slate-500 mb-1">{icon}</div>
      <div className="text-lg font-bold text-slate-200 leading-none">{label}</div>
      <div className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{desc}</div>
    </div>
  );
}
