'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Zap, Shield, ArrowRight, Flame, Ghost, MessageCircle, Hash, Globe, MapPin, Calendar } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { Country, State } from 'country-state-city';
import CustomSelect from '@/components/ui/CustomSelect';
import CustomInput from '@/components/ui/CustomInput';

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
    if (!formData.username.trim()) newErrors.username = 'Required';
    if (!formData.age || parseInt(formData.age) < 18) newErrors.age = '18+';
    if (!formData.gender) newErrors.gender = 'Required';
    if (!formData.country) newErrors.country = 'Required';
    if (states.length > 0 && !formData.state) newErrors.state = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartChatting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    const selectedCountry = countries.find(c => c.isoCode === formData.country);
    const selectedState = states.find(s => s.isoCode === formData.state);

    setAnonymousUser({
      username: formData.username,
      gender: formData.gender as string,
      age: parseInt(formData.age),
      country: selectedCountry?.name || 'Unknown',
      state: selectedState?.name || 'Unknown'
    });

    setTimeout(() => {
      router.push('/chat');
    }, 1000);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">

      {/* Animated Elements */}
      <div className="absolute top-[10%] left-[15%] w-72 h-72 bg-pink-600/20 rounded-full blur-[100px] animate-blob" />
      <div className="absolute bottom-[10%] right-[15%] w-72 h-72 bg-indigo-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      <div className="absolute top-[40%] right-[25%] w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] animate-blob animation-delay-4000" />

      <div className="w-full max-w-6xl z-10 grid lg:grid-cols-2 gap-12 items-center">

        {/* Left Column: Text & Hero */}
        <div className="text-center lg:text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300 text-sm font-semibold backdrop-blur-md">
              <Flame size={16} className="text-pink-500 animate-pulse" />
              <span>#1 Anonymous Dating App</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              Tingle<span className="gradient-text">Talk</span>
            </h1>

            <p className="text-xl text-slate-400 font-light max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Skip the signup. Skip the profile. Just pure, anonymous connection. Find your match, share a secret, or just have fun.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0"
          >
            <FeatureBox icon={<Ghost size={20} />} title="100% Anonymous" desc="No Real Identity" />
            <FeatureBox icon={<Heart size={20} />} title="Smart Match" desc="Find Dates Fast" />
            <FeatureBox icon={<Zap size={20} />} title="Instant Chat" desc="No Waiting" />
            <FeatureBox icon={<Shield size={20} />} title="Safe & Secure" desc="End-to-End Encrypted" />
          </motion.div>
        </div>

        {/* Right Column: Interactive Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="glass-panel p-1 rounded-[2.5rem]">
            <div className="bg-slate-950/80 backdrop-blur-3xl rounded-[2.4rem] p-8 border border-white/5">

              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <span className="w-2 h-8 bg-pink-500 rounded-full" />
                  Quick Entry
                </h3>
                <Sparkles className="text-pink-500 animate-spin-slow" />
              </div>

              <form onSubmit={handleStartChatting} className="space-y-6">

                {/* Username */}
                <CustomInput
                  label="Username"
                  icon={<Hash size={18} />}
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder=""
                  maxLength={15}
                  error={errors.username}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Age */}
                  <CustomInput
                    label="Age"
                    icon={<Calendar size={18} />}
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="18+"
                    type="number"
                    min={18}
                    max={99}
                    error={errors.age}
                    className="text-center"
                  />

                  {/* Gender Radio Group */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">I am</label>
                    <div className="flex gap-2">
                      {['Male', 'Female'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleInputChange('gender', option.toLowerCase())}
                          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border ${formData.gender === option.toLowerCase()
                              ? 'bg-gradient-to-r from-pink-500/20 to-violet-600/20 border-pink-500/50 text-white shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                              : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {errors.gender && <p className="text-pink-500 text-xs mt-1 ml-1">{errors.gender}</p>}
                  </div>
                </div>

                {/* LOC */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Location</label>
                  <div className="grid grid-cols-2 gap-4">
                    <CustomSelect
                      options={countries.map(c => ({ label: c.name, value: c.isoCode }))}
                      value={formData.country}
                      onChange={(val) => handleInputChange('country', val)}
                      placeholder="Country"
                      searchable
                      icon={<Globe size={16} />}
                      error={errors.country}
                    />
                    <CustomSelect
                      options={states.map(s => ({ label: s.name, value: s.isoCode }))}
                      value={formData.state}
                      onChange={(val) => handleInputChange('state', val)}
                      disabled={!formData.country || states.length === 0}
                      placeholder={states.length === 0 && formData.country ? "No states" : "State"}
                      searchable
                      icon={<MapPin size={16} />}
                      error={errors.state}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary-glow py-5 text-xl flex items-center justify-center gap-3 mt-8 group"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Find a Match</span>
                      <Heart className="group-hover:text-pink-200 transition-colors fill-current" size={24} />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-500 pt-2">
                  By connecting, you agree to our Terms & Privacy. 18+ only.
                </p>

              </form>
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
}

function FeatureBox({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm flex flex-col gap-2 hover:bg-white/10 transition-colors cursor-default">
      <div className="text-pink-500 mb-1">{icon}</div>
      <div>
        <h4 className="font-bold text-slate-200">{title}</h4>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  );
}
