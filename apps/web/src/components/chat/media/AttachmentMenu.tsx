'use client';

import { Image as ImageIcon, Camera, Mic, Film, Sticker, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AttachmentMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: 'image' | 'video' | 'camera' | 'audio' | 'gif') => void;
}

export default function AttachmentMenu({ isOpen, onClose, onSelect }: AttachmentMenuProps) {
    const items = [
        { id: 'image', icon: ImageIcon, label: 'Photo', color: 'bg-blue-500' },
        { id: 'video', icon: Film, label: 'Video', color: 'bg-purple-500' },
        { id: 'camera', icon: Camera, label: 'Camera', color: 'bg-red-500' },
        { id: 'audio', icon: Mic, label: 'Audio', color: 'bg-orange-500' },
        { id: 'gif', icon: Sticker, label: 'GIF', color: 'bg-green-500' },
    ] as const;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="absolute bottom-16 left-4 z-50 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 w-64 grid grid-cols-3 gap-4"
                    >
                        {items.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onSelect(item.id);
                                    onClose();
                                }}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                    <item.icon size={20} />
                                </div>
                                <span className="text-xs text-slate-300 font-medium">{item.label}</span>
                            </button>
                        ))}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
