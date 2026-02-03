'use client';

import { motion } from 'framer-motion';

interface HeartLoaderProps {
    size?: number;
    className?: string;
}

export default function HeartLoader({ size = 120, className = "" }: HeartLoaderProps) {
    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            {/* Outer Glow / Aura */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.15, 0.3, 0.15],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute inset-[10%] bg-pink-500 rounded-full blur-[35px] pointer-events-none"
            />

            {/* Ripple Effects */}
            {[1, 2].map((i) => (
                <motion.div
                    key={i}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.7,
                        ease: "easeOut"
                    }}
                    className="absolute inset-0 border border-pink-500/20 rounded-full pointer-events-none"
                />
            ))}

            {/* The Heart SVG */}
            <motion.svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[70%] h-[70%] relative z-10 drop-shadow-[0_0_20px_rgba(236,72,153,0.5)] overflow-visible"
                animate={{
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <defs>
                    <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ff4b91" />
                        <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    {/* Increased filter region to ensure no box clipping */}
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill="url(#heartGradient)"
                    filter="url(#glow)"
                />

                {/* Glossy Overlay */}
                <path
                    d="M7.5 5c-0.5 0-1 0.2-1.4 0.6C5.5 6.2 5.3 7 5.5 7.8c0.2 1.2 1 2.5 2.5 4 1.5 1.5 3 2.5 4 3 0.5-0.2 1-0.5 1.5-1-1.5-1.5-3-3.2-3.5-5C9.5 7.5 8.7 5 7.5 5z"
                    fill="white"
                    fillOpacity="0.2"
                />
            </motion.svg>

            {/* Micro Particles */}
            <motion.div
                animate={{
                    rotate: 360,
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute inset-[-20%] pointer-events-none"
            >
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.4,
                        }}
                        className="absolute w-1.5 h-1.5 bg-pink-400 rounded-full blur-[1px]"
                        style={{
                            top: `${Math.round(50 + 40 * Math.cos(2 * Math.PI * i / 6))}%`,
                            left: `${Math.round(50 + 40 * Math.sin(2 * Math.PI * i / 6))}%`,
                        }}
                    />
                ))}
            </motion.div>
        </div>
    );
}
