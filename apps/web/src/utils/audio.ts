export const playNotificationSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();

        // Create oscillator (Source)
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Connect nodes
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Sound Design: "Glassy Ping"
        // High pitch sine wave with clean decay
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);

        // Envelope: Instant Attack, Exponential Decay
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime); // Start silent (to avoid pop)
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8); // Decay

        // Play
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);

        // Optional: Add a second harmonic for richness
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1760, ctx.currentTime); // A6 (Octave up)
        gain2.gain.setValueAtTime(0.05, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.6);

    } catch (error) {
        console.error("Failed to play notification sound", error);
    }
};

export const playMessageSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Sound Design: "Soft Pop"
        // Lower pitch, very short decay aimed for message arrival
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);

    } catch (error) {
        console.error("Failed to play message sound", error);
    }
};
