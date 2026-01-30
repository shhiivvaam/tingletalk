'use client';

import { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Register service worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((registration) => {
                        console.log('Service Worker registered:', registration);
                    })
                    .catch((error) => {
                        console.log('Service Worker registration failed:', error);
                    });
            });
        }

        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Show install prompt after a delay (3 seconds)
            setTimeout(() => {
                const dismissed = localStorage.getItem('pwa-install-dismissed');
                if (!dismissed) {
                    setShowInstallPrompt(true);
                }
            }, 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully');
            setIsInstalled(true);
            setShowInstallPrompt(false);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        console.log(`User response to install prompt: ${outcome}`);

        if (outcome === 'accepted') {
            setShowInstallPrompt(false);
        }

        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowInstallPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (isInstalled || !showInstallPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
            <div className="glass-card p-4 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10">
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4 text-white/60" />
                </button>

                <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
                        <Smartphone className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                            Install TingleTalk
                        </h3>
                        <p className="text-sm text-white/70 mb-3">
                            Get the app experience! Install TingleTalk on your device for quick access and offline support.
                        </p>

                        <button
                            onClick={handleInstallClick}
                            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Install Now
                        </button>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-1 -right-1 w-20 h-20 bg-pink-500/20 rounded-full blur-2xl -z-10" />
                <div className="absolute -bottom-1 -left-1 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl -z-10" />
            </div>
        </div>
    );
}
