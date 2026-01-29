'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send, Pause, Play, RotateCcw } from 'lucide-react';
import { UploadService } from '@/services/uploadService';
import { useToastStore } from '@/store/useToastStore';

interface VoiceRecorderProps {
    onSend: (fileUrl: string, metadata: { duration: number }) => void;
    onCancel: () => void;
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [duration, setDuration] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const previewAudioRef = useRef<HTMLAudioElement | null>(null);
    const MAX_DURATION = 12; // 12 seconds
    const { addToast } = useToastStore();

    useEffect(() => {
        startRecording();
        return () => {
            stopRecordingInternal();
            if (previewAudioRef.current) {
                previewAudioRef.current.pause();
                previewAudioRef.current = null;
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                setIsRecording(false);
                setIsPaused(false);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setIsPaused(false);
            startTimer();

        } catch (error) {
            console.error('Error accessing microphone:', error);
            onCancel();
        }
    };

    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setDuration(prev => {
                if (prev >= MAX_DURATION) {
                    stopRecordingInternal();
                    addToast('Maximum voice message duration reached (12s)', 'info');
                    return prev;
                }
                return prev + 1;
            });
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
    };

    const handlePauseResume = () => {
        if (!mediaRecorderRef.current) return;

        if (isPaused) {
            mediaRecorderRef.current.resume();
            startTimer();
            setIsPaused(false);
        } else {
            mediaRecorderRef.current.pause();
            stopTimer();
            setIsPaused(true);
        }
    };

    const stopRecordingInternal = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        stopTimer();
    };

    const togglePreviewPlay = () => {
        if (!previewAudioRef.current && audioUrl) {
            previewAudioRef.current = new Audio(audioUrl);
            previewAudioRef.current.onended = () => setIsPlayingPreview(false);
        }

        if (previewAudioRef.current) {
            if (isPlayingPreview) {
                previewAudioRef.current.pause();
                setIsPlayingPreview(false);
            } else {
                previewAudioRef.current.play();
                setIsPlayingPreview(true);
            }
        }
    };

    const handleSend = async () => {
        if (!audioBlob) return; // Should be in preview mode to send

        try {
            const audioFile = new File([audioBlob], 'voice_message.webm', { type: 'audio/webm' });
            const url = await UploadService.uploadFile(audioFile);
            onSend(url, { duration });
        } catch (err) {
            console.error('Upload failed', err);
            addToast('Failed to upload audio', 'error');
        }
    };

    const handleStopByUser = () => {
        stopRecordingInternal();
        // State transition to preview happens in onstop callback
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-4 bg-slate-900/90 p-3 rounded-full border border-white/10 animate-fade-in min-w-[300px] justify-between">
            {isRecording ? (
                <>
                    <div className="flex items-center gap-2 px-3">
                        <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div>
                        <span className="text-white font-mono min-w-[50px]">{formatTime(duration)}</span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handlePauseResume}
                            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                            title={isPaused ? "Resume" : "Pause"}
                        >
                            {isPaused ? <Play size={20} className="fill-current" /> : <Pause size={20} className="fill-current" />}
                        </button>

                        <button
                            onClick={handleStopByUser}
                            className="p-2 rounded-full hover:bg-white/10 text-red-400 hover:text-red-300 transition-colors"
                            title="Stop & Review"
                        >
                            <Square size={20} className="fill-current" />
                        </button>

                        <button
                            onClick={onCancel}
                            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/* Preview Mode */}
                    <div className="flex items-center gap-2 px-3">
                        <button
                            onClick={togglePreviewPlay}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            {isPlayingPreview ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current" />}
                        </button>
                        <span className="text-white font-mono text-sm">{formatTime(duration)}</span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={onCancel} // Or restart? OnCancel just closes it.
                            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={20} />
                        </button>

                        <button
                            onClick={handleSend}
                            className="p-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white transition-colors shadow-lg shadow-pink-500/20"
                            title="Send Voice Note"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
