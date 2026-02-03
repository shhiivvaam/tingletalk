'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface SessionTimeoutModalProps {
    isOpen: boolean;
    timeLeft: number;
    onContinue: () => void;
    onSignOut: () => void;
}

const OutIcon = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.0711 2.92893C13.8521 1.14786 16.2676 0.147217 18.7868 0.147217H21.2132C23.7324 0.147217 26.1479 1.14786 27.9289 2.92893L37.0711 12.0711C38.8521 13.8521 39.8528 16.2676 39.8528 18.7868V21.2132C39.8528 23.7324 38.8521 26.1479 37.0711 27.9289L27.9289 37.0711C26.1479 38.8521 23.7324 39.8528 21.2132 39.8528H18.7868C16.2676 39.8528 13.8521 38.8521 12.0711 37.0711L2.92893 27.9289C1.14786 26.1479 0.147217 23.7324 0.147217 21.2132V18.7868C0.147217 16.2676 1.14786 13.8521 2.92893 12.0711L12.0711 2.92893Z" fill="#C00000" stroke="#E60000" strokeWidth="2" />
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">OUT</text>
    </svg>
);

export default function SessionTimeoutModal({ isOpen, timeLeft, onContinue, onSignOut }: SessionTimeoutModalProps) {
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="relative bg-white rounded-2xl p-8 max-w-[500px] w-full shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-10 w-full">
                            <OutIcon />
                            <h2 className="text-3xl font-normal text-slate-900 mx-auto tracking-wide">
                                Session Timeout
                            </h2>
                            <OutIcon />
                        </div>

                        {/* Content */}
                        <div className="mb-10 text-center">
                            <p className="text-slate-700 text-lg font-light">
                                Due to inactivity, this session will time out
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 items-stretch">
                            <button
                                onClick={onContinue}
                                className="flex-[2] bg-[#3B82F6] hover:bg-blue-600 text-white text-base font-medium py-3 px-2 rounded-md transition-colors shadow-sm flex items-center justify-center whitespace-nowrap"
                            >
                                Click to stay Signed In ({formatTime(timeLeft)})
                            </button>
                            <button
                                onClick={onSignOut}
                                className="flex-1 bg-[#F1F1F1] hover:bg-gray-200 text-slate-800 text-lg font-normal py-3 px-4 rounded-md transition-colors"
                            >
                                Sign out
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
