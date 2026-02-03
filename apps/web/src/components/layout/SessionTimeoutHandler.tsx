'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useUserStore } from '@/store/useUserStore';
import SessionTimeoutModal from '@/components/ui/SessionTimeoutModal';

// Configuration based on requirements:
// Modal visible after 2 minutes of inactivity.
// Counts down for 5 minutes.
// Total inactivity before logout = 7 minutes.
const INACTIVITY_WARNING_MS = 2 * 60 * 1000; // 2 minutes
const LOGOUT_COUNTDOWN_SECONDS = 5 * 60; // 5 minutes

export default function SessionTimeoutHandler() {
    // Check for username or userId to determine if user is "logged in"
    // (Anonymous users have a username set but might not have userId initially)
    const { username, userId, logout } = useUserStore();
    const isLoggedIn = !!username || !!userId;

    const [isIdle, setIsIdle] = useState(false);
    const [timeLeft, setTimeLeft] = useState(LOGOUT_COUNTDOWN_SECONDS);

    // Use ref to track last activity without triggering re-renders
    const lastActivityRef = useRef<number>(Date.now());

    const handleActivity = useCallback(() => {
        // Only update activity timestamp if the modal is NOT currently open
        // If modal is open, strictly button interaction is required
        if (!isIdle) {
            lastActivityRef.current = Date.now();
        }
    }, [isIdle]);

    // Setup global event listeners for activity tracking
    useEffect(() => {
        if (!isLoggedIn) return;

        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

        // Simple wrapper to throttle if needed, but direct call is fine for these
        const activityHandler = () => {
            handleActivity();
        };

        events.forEach(event => window.addEventListener(event, activityHandler));

        // Initialize timer on mount/login
        lastActivityRef.current = Date.now();

        return () => {
            events.forEach(event => window.removeEventListener(event, activityHandler));
        };
    }, [isLoggedIn, handleActivity]);

    // Check for inactivity interval
    useEffect(() => {
        if (!isLoggedIn) return;

        const checkInterval = setInterval(() => {
            const now = Date.now();
            const timeSinceLastActivity = now - lastActivityRef.current;

            if (timeSinceLastActivity > INACTIVITY_WARNING_MS && !isIdle) {
                setIsIdle(true);
                setTimeLeft(LOGOUT_COUNTDOWN_SECONDS); // Start countdown
            }
        }, 1000);

        return () => clearInterval(checkInterval);
    }, [isLoggedIn, isIdle]);

    // Countdown logic when idle
    useEffect(() => {
        let countdownInterval: NodeJS.Timeout;

        if (isIdle && isLoggedIn && timeLeft > 0) {
            countdownInterval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }

        return () => {
            if (countdownInterval) clearInterval(countdownInterval);
        };
    }, [isIdle, isLoggedIn, timeLeft]);

    // Cleanup or action when timer hits 0
    useEffect(() => {
        if (timeLeft === 0 && isIdle && isLoggedIn) {
            handleLogout();
        }
    }, [timeLeft, isIdle, isLoggedIn]);

    const handleLogout = () => {
        logout(); // Clear session but keep profile
        setIsIdle(false);
        // Force redirect to ensure full logout state is reflected
        window.location.href = '/';
    };

    const handleContinue = () => {
        setIsIdle(false);
        lastActivityRef.current = Date.now();
        setTimeLeft(LOGOUT_COUNTDOWN_SECONDS);
    };

    // Don't render anything if not logged in or not idle
    if (!isLoggedIn || !isIdle) return null;

    return (
        <SessionTimeoutModal
            isOpen={isIdle}
            timeLeft={timeLeft}
            onContinue={handleContinue}
            onSignOut={handleLogout}
        />
    );
}
