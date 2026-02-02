'use client';

import React, { useEffect } from 'react';

interface AdUnitProps {
    type?: 'adsense' | 'custom' | 'adsterra-native';
    slot?: string; // Google AdSense Slot ID
    client?: string; // Google AdSense Client ID (e.g., ca-pub-XXXX)
    format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
    responsive?: boolean;
    style?: React.CSSProperties;
    className?: string;
    label?: string; // Internal label for debugging/placeholder
}

export default function AdUnit({
    type = 'adsterra-native', // Defaulting to Adsterra now per user request
    slot,
    client = 'ca-pub-9299390652489427',
    format = 'auto',
    responsive = true,
    style,
    className,
    label = 'Advertisement'
}: AdUnitProps) {

    const hasPushedRef = React.useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // AdSense Logic
        if (type === 'adsense' && !hasPushedRef.current) {
            try {
                // @ts-ignore
                if (window.adsbygoogle) {
                    // @ts-ignore
                    window.adsbygoogle.push({});
                    hasPushedRef.current = true;
                }
            } catch (err: any) {
                if (err.message && err.message.includes('already have ads')) {
                    console.warn('AdSense: Slot already has ad, skipping push.');
                    hasPushedRef.current = true;
                } else {
                    console.error('AdSense error:', err);
                }
            }
        }

        // Adsterra Native Logic
        else if (type === 'adsterra-native' && !hasPushedRef.current) {
            // We use iframe isolation now, so no global script injection needed.
            hasPushedRef.current = true;
        }

    }, [type, slot]);

    // Condition updated to allow seeing ads in Dev mode per user request
    if (process.env.NODE_ENV === 'development' && false) {
        return (
            <div
                className={`flex flex-col items-center justify-center bg-slate-800/50 border border-dashed border-slate-600 text-slate-500 text-xs font-mono p-4 mx-auto my-2 overflow-hidden ${className}`}
                style={{ minHeight: '100px', width: '100%', ...style }}
            >
                <span className="font-bold text-slate-400">AD SPACE: {label}</span>
                <span>Type: {type}</span>
                <span className="text-[10px] text-slate-600 truncate max-w-full px-2">ID: {slot || 'Default'}</span>
                <span className="mt-1 opacity-50 text-[10px]">Actual ads will appear here in production</span>
            </div>
        );
    }

    if (type === 'adsense') {
        return (
            <div className={`w-full overflow-hidden my-2 flex justify-center ${className}`} style={style}>
                <ins className="adsbygoogle"
                    style={{ display: 'block', width: '100%', ...style }}
                    data-ad-client={client}
                    data-ad-slot={slot || '1234567890'}
                    data-ad-format={format}
                    data-full-width-responsive={responsive ? "true" : "false"}
                />
            </div>
        );
    }

    if (type === 'adsterra-native') {
        const adHash = slot || 'f1ecdc5056db3521ecee075d39c94dca';

        // Logic to generate random ID only on the client
        const [uid, setUid] = React.useState<string>('');
        const [mounted, setMounted] = React.useState(false);

        React.useEffect(() => {
            setUid(Math.random().toString(36).substring(7));
            setMounted(true);
        }, []);

        const containerStyle: React.CSSProperties = {
            minHeight: '300px',
            ...style,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            overflow: 'hidden'
        };

        // Server/Hydration Mismatch protection:
        // Render a specialized placeholder structure that matches the container logic
        if (!mounted) {
            return (
                <div
                    className={`my-2 ${className || ''}`}
                    style={containerStyle}
                />
            );
        }

        const iframeSrc = uid ? `/ad-frame.html?hash=${adHash}&uid=${uid}` : '';

        return (
            <div
                className={`my-2 ${className || ''}`}
                style={containerStyle}
            >
                {uid && (
                    <iframe
                        // content key only
                        title={`Ad-${adHash}`}
                        src={iframeSrc}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        scrolling="no"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    />
                )}
            </div>
        );
    }

    // Placeholder for custom
    return (
        <div className={`w-full overflow-hidden my-2 ${className}`}>
            {/* Custom Ad Script Here */}
        </div>
    );
}
