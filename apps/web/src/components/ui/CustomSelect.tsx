'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    label: string;
    value: string;
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    searchable?: boolean;
    error?: string;
}

export default function CustomSelect({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    label,
    icon,
    disabled = false,
    searchable = false,
    error
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = searchable
        ? options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
        : options;

    return (
        <div className="relative w-full space-y-2" ref={containerRef}>
            {label && (
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}

            <div className="relative">
                {/* Trigger Button */}
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`
                        w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-base text-left
                        outline-none transition-all duration-300 flex items-center justify-between
                        focus:ring-2 focus:ring-pink-500/20
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-900/80 cursor-pointer'}
                        ${isOpen ? 'border-pink-500/50 bg-slate-900/80 ring-2 ring-pink-500/20' : ''}
                        ${error ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}
                    `}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        {icon && <span className="text-pink-500">{icon}</span>}
                        <span className={`truncate ${selectedOption ? 'text-slate-100' : 'text-slate-500'}`}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                    </div>
                    <ChevronDown
                        size={18}
                        className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 flex flex-col"
                        >
                            {/* Search Bar */}
                            {searchable && (
                                <div className="p-2 border-b border-white/5 sticky top-0 bg-slate-900/95 z-10">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-pink-500/50"
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                    />
                                </div>
                            )}

                            {/* Options List */}
                            <div className="overflow-y-auto custom-scrollbar p-1">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => {
                                                onChange(option.value);
                                                setIsOpen(false);
                                                setSearchQuery('');
                                            }}
                                            className={`
                                                w-full text-left px-4 py-3 rounded-xl text-sm transition-colors flex items-center justify-between
                                                ${option.value === value
                                                    ? 'bg-pink-500/10 text-pink-400 font-medium'
                                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                                }
                                            `}
                                        >
                                            <span className="truncate mr-2">{option.label}</span>
                                            {option.value === value && <Check size={14} />}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-slate-500 text-center">
                                        No results found
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
