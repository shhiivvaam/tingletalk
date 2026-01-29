'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Hash, Zap, Globe, Shield, Users, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { Country, State } from 'country-state-city';

// ... (keep constants if needed, or remove them)

export default function Home() {
  const router = useRouter();
  const setAnonymousUser = useUserStore((state) => state.setAnonymousUser);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    country: '',
    state: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derived Data
  const countries = Country.getAllCountries();
  const states = formData.country ? State.getStatesOfCountry(formData.country) : [];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'country') {
        newData.state = '';
      }
      return newData;
    });

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.age || parseInt(formData.age) < 18) newErrors.age = 'Must be 18+';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.country) newErrors.country = 'Country is required';
    // Only require state if the country has states
    if (states.length > 0 && !formData.state) newErrors.state = 'State is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartChatting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    const selectedCountry = countries.find(c => c.isoCode === formData.country);
    const selectedState = states.find(s => s.isoCode === formData.state);

    // Instant validation/storage
    setAnonymousUser({
      username: formData.username,
      gender: formData.gender as string,
      age: parseInt(formData.age),
      country: selectedCountry?.name || 'Unknown',
      state: selectedState?.name || 'Unknown'
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

      <div className="relative z-10 w-full max-w-3xl text-center space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-pink-400 text-sm font-medium mb-4">
            <Sparkles size={16} />
            <span>Instant Global Connections</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
            Tingle<span className="text-gradient">Talk</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
            Join the conversation. Be yourself. Connect instantly.
          </p>
        </motion.div>

        {/* Quick Onboarding Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="glass-card max-w-lg mx-auto p-1 rounded-[2.5rem]"
        >
          <div className="bg-slate-900/50 backdrop-blur-3xl rounded-[2.4rem] p-8 space-y-6">
            <form onSubmit={handleStartChatting} className="space-y-5 text-left">

              {/* Username & Age Row */}
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Username</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                      <Hash size={16} />
                    </div>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Your Name"
                      className={`w-full glass-input pl-10 py-3 text-base ${errors.username ? 'border-red-500/50' : ''}`}
                      maxLength={20}
                    />
                  </div>
                </div>

                <div className="w-24 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="18+"
                    className={`w-full glass-input text-center py-3 text-base ${errors.age ? 'border-red-500/50' : ''}`}
                    min="18"
                    max="99"
                  />
                </div>
              </div>

              {/* Gender Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Gender</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleInputChange('gender', g)}
                      className={`flex items-center justify-center py-3 rounded-xl border-2 transition-all duration-300 text-sm font-bold uppercase ${formData.gender === g
                        ? 'bg-pink-500/10 border-pink-500 text-white'
                        : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
                        } ${errors.gender && !formData.gender ? 'border-red-500/30' : ''}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className={`w-full glass-input py-3 px-4 appearance-none text-sm bg-slate-900 ${errors.country ? 'border-red-500/50' : ''}`}
                  >
                    <option value="">Select...</option>
                    {countries.map((c) => (
                      <option key={c.isoCode} value={c.isoCode}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    disabled={!formData.country || states.length === 0}
                    className={`w-full glass-input py-3 px-4 appearance-none text-sm bg-slate-900 disabled:opacity-50 ${errors.state ? 'border-red-500/50' : ''}`}
                  >
                    <option value="">Select...</option>
                    {states.map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(Object.keys(errors).length > 0) && (
                <div className="text-red-400 text-xs text-center font-medium bg-red-500/10 py-2 rounded-lg">
                  Please fill in all required fields
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 mt-4"
              >
                {isLoading ? (
                  <RefreshCw className="animate-spin" />
                ) : (
                  <>
                    <span>Start Chatting</span>
                    <ArrowRight size={20} />
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
