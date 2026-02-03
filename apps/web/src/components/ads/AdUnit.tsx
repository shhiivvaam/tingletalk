'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AD_CONFIG, AD_DIMENSIONS, AdProvider, AdFormat } from '@/constants/ads';

interface AdUnitProps {
    type?: AdProvider;
    slot?: string;
    client?: string;
    format?: AdFormat;
    responsive?: boolean;
    style?: React.CSSProperties;
    className?: string;
    label?: string;
    delay?: number; // Optional delay before loading
}

export default function AdUnit({
    type = 'adsterra-native',
    slot,
    client = AD_CONFIG.ADSENSE_CLIENT,
    format = 'auto',
    responsive = true,
    style,
    className,
    label = 'Advertisement',
    delay = 0
}: AdUnitProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [uid, setUid] = useState<string>('');
    const containerRef = useRef<HTMLDivElement>(null);
    const hasPushedRef = useRef(false);

    // Setup viewport intersection observer for lazy loading
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // Start loading when ad is near viewport (200px threshold)
                    setTimeout(() => setIsVisible(true), delay);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [delay]);

    // Unique ID for iframe sync
    useEffect(() => {
        if (isVisible) {
            setUid(Math.random().toString(36).substring(7));
        }
    }, [isVisible]);

    // Handle AdSense script push
    useEffect(() => {
        if (isVisible && type === 'adsense' && !hasPushedRef.current) {
            try {
                // @ts-ignore
                if (window.adsbygoogle) {
                    // @ts-ignore
                    window.adsbygoogle.push({});
                    hasPushedRef.current = true;
                    setIsLoaded(true);
                }
            } catch (err: any) {
                console.error('AdSense push error:', err);
            }
        }
    }, [isVisible, type]);

    const dimensions = AD_DIMENSIONS[format] || AD_DIMENSIONS.auto;

    const containerStyle: React.CSSProperties = {
        minHeight: dimensions.minHeight,
        width: dimensions.width,
        maxWidth: '100%',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        margin: '1rem auto',
        ...style
    };

    return (
        <div
            ref={containerRef}
            className={`ad-container overflow-hidden rounded-xl transition-all duration-500 ${className || ''}`}
            style={containerStyle}
        >
            {/* Professional Skeleton Placeholder */}
            {!isLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 border border-white/5 animate-pulse overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    <div className="flex flex-col items-center gap-2 opacity-30">
                        <div className="w-8 h-8 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 tabular-nums">
                            {label}
                        </span>
                    </div>
                </div>
            )}

            {/* Adsterra Implementation */}
            {isVisible && type === 'adsterra-native' && uid && (
                <iframe
                    title={`Ad-${slot}`}
                    src={`/ad-frame.html?hash=${slot || AD_CONFIG.ADSTERRA.NATIVE_DEFAULT}&uid=${uid}`}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        opacity: isLoaded ? 1 : 0,
                        transition: 'opacity 0.5s ease-in'
                    }}
                    onLoad={() => setIsLoaded(true)}
                    scrolling="no"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
            )}

            {/* AdSense Implementation */}
            {isVisible && type === 'adsense' && (
                <ins
                    className="adsbygoogle"
                    style={{ display: 'block', width: '100%', height: '100%' }}
                    data-ad-client={client}
                    data-ad-slot={slot}
                    data-ad-format={format === 'auto' ? 'auto' : undefined}
                    data-full-width-responsive={responsive ? "true" : "false"}
                />
            )}
        </div>
    );
}
