'use client';

import { useToastStore } from '@/store/useToastStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        className="pointer-events-auto min-w-[300px] max-w-md p-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/10 flex items-start gap-3"
                        style={{
                            backgroundColor:
                                toast.type === 'error' ? 'rgba(239, 68, 68, 0.9)' :
                                    toast.type === 'success' ? 'rgba(34, 197, 94, 0.9)' :
                                        'rgba(30, 41, 59, 0.9)'
                        }}
                    >
                        <div className="mt-0.5 text-white">
                            {toast.type === 'success' && <CheckCircle size={18} />}
                            {toast.type === 'error' && <AlertCircle size={18} />}
                            {toast.type === 'info' && <Info size={18} />}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-white/70 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
