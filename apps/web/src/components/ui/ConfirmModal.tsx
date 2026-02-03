'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'info';
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning'
}: ConfirmModalProps) {
    const typeStyles = {
        warning: {
            icon: 'text-yellow-500',
            iconBg: 'bg-yellow-500/10',
            border: 'border-yellow-500/30',
            button: 'from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500'
        },
        danger: {
            icon: 'text-red-500',
            iconBg: 'bg-red-500/10',
            border: 'border-red-500/30',
            button: 'from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500'
        },
        info: {
            icon: 'text-blue-500',
            iconBg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
            button: 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
        }
    };

    const style = typeStyles[type];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9998]"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="relative w-full max-w-md"
                        >
                            {/* Glass Panel */}
                            <div className="glass-panel rounded-3xl p-1">
                                <div className="bg-slate-900/90 backdrop-blur-xl rounded-[1.4rem] p-6 border border-white/5">
                                    {/* Close Button */}
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                    >
                                        <X size={18} />
                                    </button>

                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-2xl ${style.iconBg} border ${style.border} flex items-center justify-center mb-4`}>
                                        <AlertTriangle className={style.icon} size={32} />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-bold text-white mb-3">
                                        {title}
                                    </h3>

                                    {/* Message */}
                                    <p className="text-slate-400 leading-relaxed mb-6">
                                        {message}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 px-6 py-3 rounded-xl font-semibold bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                                        >
                                            {cancelText}
                                        </button>
                                        <button
                                            onClick={() => {
                                                onConfirm();
                                                onClose();
                                            }}
                                            className={`flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r ${style.button} text-white shadow-lg transition-all transform hover:scale-105 active:scale-95`}
                                        >
                                            {confirmText}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
