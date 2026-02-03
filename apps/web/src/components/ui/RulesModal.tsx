'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Shield, AlertCircle, Handshake, Info } from 'lucide-react';

interface RulesModalProps {
    isOpen: boolean;
    onAgree: () => void;
    onDisagree: () => void;
}

export default function RulesModal({ isOpen, onAgree, onDisagree }: RulesModalProps) {
    const rules = [
        {
            icon: <Shield className="text-emerald-400" size={20} />,
            text: "You are over the age of 18",
            description: "This platform is for adults only. Minor access is strictly prohibited."
        },
        {
            icon: <Handshake className="text-blue-400" size={20} />,
            text: "Terms of Use & Code of Conduct",
            description: "Be respectful. No harassment, hate speech, or illegal activities."
        },
        {
            icon: <AlertCircle className="text-pink-400" size={20} />,
            text: "Privacy & Data Policy",
            description: "Your session is anonymous, but we expect genuine interactions."
        },
        {
            icon: <Info className="text-amber-400" size={20} />,
            text: "Safety Guidelines",
            description: "Never share personal contact info with strangers immediately."
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 md:p-8">
                    {/* Backdrop - Click to Close Disabled to prevent accidental logouts */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
                    />

                    {/* Modal Content Wrapper */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header Decoration */}
                        <div className="absolute top-0 inset-x-0 h-1 md:h-1.5 bg-gradient-to-r from-pink-500 via-violet-600 to-cyan-500 shrink-0 z-20" />

                        {/* Fixed Header */}
                        <div className="p-6 md:p-8 border-b border-white/5 bg-slate-900/50 backdrop-blur-md z-10 shrink-0">
                            <div className="text-center">
                                <h2 className="text-xl md:text-3xl font-black text-white mb-2 md:mb-3">
                                    Before we <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">Mingle...</span>
                                </h2>
                                <p className="text-slate-400 text-xs md:text-sm font-medium">
                                    To keep our community safe and fun, please confirm:
                                </p>
                            </div>
                        </div>

                        {/* Scrollable Rules List */}
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-950/20">
                            <div className="space-y-6">
                                {rules.map((rule, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * idx }}
                                        className="flex gap-4 group"
                                    >
                                        <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                            {rule.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white font-bold text-sm md:text-base mb-0.5 md:mb-1">{rule.text}</h3>
                                            <p className="text-slate-500 text-[10px] md:text-sm leading-relaxed">{rule.description}</p>
                                        </div>
                                        <div className="shrink-0 pt-1">
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Fixed Sticky Footer for Actions - Guaranteed Visibility */}
                        <div className="p-6 md:p-8 border-t border-white/5 bg-slate-900/80 backdrop-blur-md shrink-0">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={onAgree}
                                    className="flex-2 py-3.5 md:py-4 px-8 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-black rounded-xl shadow-lg shadow-pink-500/20 active:scale-[0.98] transition-all uppercase tracking-widest text-xs md:text-sm"
                                >
                                    I Agree & Proceed
                                </button>
                                <button
                                    onClick={onDisagree}
                                    className="flex-1 py-3.5 md:py-4 bg-white/5 hover:bg-white/10 text-slate-400 font-bold rounded-xl active:scale-[0.98] transition-all border border-white/5 text-xs md:text-sm"
                                >
                                    Disagree
                                </button>
                            </div>

                            <p className="text-center text-[9px] md:text-[10px] text-slate-600 mt-4 uppercase font-bold tracking-widest leading-relaxed">
                                By clicking agree, you enter the anonymous lobby
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
