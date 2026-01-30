import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Search, X, Sparkles, Clock } from 'lucide-react';

interface RandomMatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectStrategy: (strategy: 'optimal' | 'immediate') => void;
}

export default function RandomMatchModal({ isOpen, onClose, onSelectStrategy }: RandomMatchModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        ref={modalRef}
                        className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        {/* Content */}
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <div className="mx-auto w-12 h-12 bg-pink-500/10 rounded-full flex items-center justify-center mb-3">
                                    <Sparkles className="text-pink-400" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">How do you want to match?</h3>
                                <p className="text-slate-400 text-sm">Choose your preferred way to find a chat partner.</p>
                            </div>

                            <div className="space-y-3">
                                {/* Option 1: Perfect Match */}
                                <button
                                    onClick={() => onSelectStrategy('optimal')}
                                    className="w-full p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:bg-slate-800 hover:border-pink-500/30 transition-all group text-left relative overflow-hidden"
                                >
                                    <div className="flex items-start gap-4 reltive z-10">
                                        <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center group-hover:bg-pink-500/20 group-hover:text-pink-400 transition-colors">
                                            <Search size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-200 group-hover:text-pink-300 transition-colors">Wait for Perfect Match</h4>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                We'll search for someone who matches your specific preferences and location.
                                                <span className="flex items-center gap-1 mt-1 text-pink-400/80 font-medium">
                                                    <Clock size={10} /> May take a moment
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </button>

                                {/* Option 2: Immediate */}
                                <button
                                    onClick={() => onSelectStrategy('immediate')}
                                    className="w-full p-4 rounded-xl bg-gradient-to-r from-violet-600/10 to-pink-600/10 border border-white/5 hover:border-violet-500/30 hover:from-violet-600/20 hover:to-pink-600/20 transition-all group text-left relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex items-start gap-4 relative z-10">
                                        <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                                            <Zap size={20} className="fill-current" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-200 group-hover:text-violet-300 transition-colors">Connect Immediately</h4>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                Skip the queue! We'll instantly pair you with any available online user.
                                                <span className="block mt-1 text-violet-400/80 font-medium">
                                                    ⚡ Fastest way to chat
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
