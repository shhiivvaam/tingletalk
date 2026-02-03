'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Hash, Globe, MapPin, Calendar } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { Country, State } from 'country-state-city';
import CustomSelect from '@/components/ui/CustomSelect';
import CustomInput from '@/components/ui/CustomInput';

export default function QuickEntryForm() {
    const router = useRouter();
    const setAnonymousUser = useUserStore((state) => state.setAnonymousUser);

    // Use individual selectors to avoid infinite loop
    const storedUsername = useUserStore((state) => state.username);
    const storedAge = useUserStore((state) => state.age);
    const storedGender = useUserStore((state) => state.gender);
    const storedCountry = useUserStore((state) => state.country);
    const storedState = useUserStore((state) => state.state);

    const [formData, setFormData] = useState({
        username: '',
        age: '',
        gender: '' as 'male' | 'female' | 'other' | '',
        country: '',
        state: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-fill form with last used credentials
    useEffect(() => {
        if (storedUsername) {
            const countries = Country.getAllCountries();
            const countryCode = countries.find(c => c.name === storedCountry)?.isoCode || '';
            const states = countryCode ? State.getStatesOfCountry(countryCode) : [];
            const stateCode = states.find(s => s.name === storedState)?.isoCode || '';

            setFormData({
                username: storedUsername || '',
                age: storedAge?.toString() || '',
                gender: storedGender || '',
                country: countryCode,
                state: stateCode
            });
        }
    }, []); // Run once on mount

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
                        <div className="flex items-center gap-2">
                            {storedUsername && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-xs font-semibold text-green-400 flex items-center gap-1"
                                >
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                    Welcome back!
                                </motion.div>
                            )}
                            <Sparkles className="text-pink-500 animate-spin-slow" />
                        </div>
                    </div>

                    <form onSubmit={handleStartChatting} className="space-y-6">
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
    );
}
