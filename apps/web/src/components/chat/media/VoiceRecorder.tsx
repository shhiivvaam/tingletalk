'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send } from 'lucide-react';
import { UploadService } from '@/services/uploadService';
import { useToastStore } from '@/store/useToastStore';

interface VoiceRecorderProps {
    onSend: (fileUrl: string, metadata: { duration: number }) => void;
    onCancel: () => void;
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const MAX_DURATION = 12; // 12 seconds per requirement
    const { addToast } = useToastStore();

    useEffect(() => {
        startRecording();
        return () => {
            stopRecordingInternal();
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

            mediaRecorder.start();
            setIsRecording(true);

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

        } catch (error) {
            console.error('Error accessing microphone:', error);
            onCancel();
        }
    };

    const stopRecordingInternal = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const handleSend = async () => {
        stopRecordingInternal();

        // Ensure we process chunks
        const processAndUpload = async () => {
            if (audioChunksRef.current.length > 0) {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], 'voice_message.webm', { type: 'audio/webm' });
                try {
                    const url = await UploadService.uploadFile(audioFile);
                    onSend(url, { duration });
                } catch (err) {
                    console.error('Upload failed', err);
                    addToast('Failed to upload audio', 'error');
                }
            }
        };

        if (mediaRecorderRef.current) {
            // Give a tiny delay for the last 'ondataavailable' event to fire if it was just stopped
            setTimeout(() => {
                processAndUpload();
            }, 200);
        } else {
            processAndUpload();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-4 bg-slate-900/90 p-3 rounded-full border border-white/10 animate-fade-in">
            <div className="flex items-center gap-2 px-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-white font-mono min-w-[50px]">{formatTime(duration)}</span>
            </div>

            <button
                onClick={onCancel}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
                <Trash2 size={20} />
            </button>

            <button
                onClick={handleSend}
                className="p-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white transition-colors shadow-lg shadow-pink-500/20"
            >
                <Send size={20} />
            </button>
        </div>
    );
}
