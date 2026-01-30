'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Webcam from 'react-webcam';
import { X, RefreshCw, Send, Loader2, Video, Camera as CameraIcon, Zap, ZapOff } from 'lucide-react';
import { UploadService } from '@/services/uploadService';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraModalProps {
    onClose: () => void;
    onSend: (url: string, type?: 'image' | 'video') => void;
}

export default function CameraModal({ onClose, onSend }: CameraModalProps) {
    const webcamRef = useRef<Webcam>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    // Portal mount state
    const [mounted, setMounted] = useState(false);

    // States
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [mode, setMode] = useState<'photo' | 'video'>('photo');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Refs
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const MAX_VIDEO_DURATION = 60; // 60 seconds

    // Mount check for Portal
    useEffect(() => {
        setMounted(true);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            setMounted(false);
        };
    }, []);

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                // Flash effect
                const flash = document.createElement('div');
                flash.className = 'fixed inset-0 bg-white z-[99999] animate-flash pointer-events-none opacity-0';
                document.body.appendChild(flash);
                flash.animate([
                    { opacity: 0.8 },
                    { opacity: 0 }
                ], {
                    duration: 300,
                    easing: 'ease-out'
                }).onfinish = () => flash.remove();

                setImgSrc(imageSrc);
            }
        }
    }, [webcamRef]);

    const startRecording = useCallback(async () => {
        setIsRecording(true);
        chunksRef.current = [];
        setRecordingTime(0);

        if (webcamRef.current) {
            let stream = webcamRef.current.stream;

            // Ensure audio track
            if (stream && stream.getAudioTracks().length === 0) {
                try {
                    const newStream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode },
                        audio: true
                    });
                    stream = newStream;
                } catch (err) {
                    console.error("Failed to get audio stream", err);
                }
            }

            if (stream) {
                const mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunksRef.current.push(e.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                    setVideoBlob(blob);
                    setIsRecording(false);
                    if (timerRef.current) clearInterval(timerRef.current);

                    // cleanup temporary stream tracks if created
                    if (stream !== webcamRef.current?.stream) {
                        stream.getTracks().forEach(track => track.stop());
                    }
                };

                mediaRecorderRef.current = mediaRecorder;
                mediaRecorder.start();

                timerRef.current = setInterval(() => {
                    setRecordingTime(prev => {
                        if (prev >= MAX_VIDEO_DURATION) {
                            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                                mediaRecorderRef.current.stop();
                            }
                            return prev;
                        }
                        return prev + 1;
                    });
                }, 1000);
            }
        }
    }, [webcamRef, facingMode]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
    }, [isRecording]);

    const retake = () => {
        setImgSrc(null);
        setVideoBlob(null);
        setIsRecording(false);
        setRecordingTime(0);
    };

    const toggleCamera = () => {
        setIsCameraReady(false);
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    const handleSend = async () => {
        setIsUploading(true);
        try {
            if (imgSrc) {
                const res = await fetch(imgSrc);
                const blob = await res.blob();
                const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
                const url = await UploadService.uploadFile(file);
                onSend(url, 'image');
                onClose();
            } else if (videoBlob) {
                const file = new File([videoBlob], 'camera-video.webm', { type: 'video/webm' });
                const url = await UploadService.uploadFile(file);
                onSend(url, 'video');
                onClose();
            }
        } catch (err) {
            console.error('Upload failed', err);
            alert('Failed to upload media. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!mounted) return null;

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black flex flex-col overflow-hidden text-white font-sans touch-none"
        >
            {/* Main Camera/Preview Area */}
            <div className="relative flex-1 w-full h-full overflow-hidden bg-black">

                {/* 1. Image Preview */}
                {imgSrc && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
                        <img src={imgSrc} alt="captured" className="w-full h-full object-contain" />
                    </div>
                )}

                {/* 2. Video Preview */}
                {videoBlob && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
                        <video
                            src={URL.createObjectURL(videoBlob)}
                            controls
                            autoPlay
                            className="w-full h-full object-contain"
                        />
                    </div>
                )}

                {/* 3. Live Camera Feed */}
                {!imgSrc && !videoBlob && (
                    <>
                        {!isCameraReady && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950 text-zinc-500">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="animate-spin w-8 h-8 text-pink-500" />
                                    <p className="text-xs font-medium tracking-wide">INITIALIZING CAMERA</p>
                                </div>
                            </div>
                        )}
                        <Webcam
                            audio={mode === 'video'}
                            muted={true}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                                facingMode,
                                // Use ideal instead of exact to prevent constraints errors
                                width: { ideal: 1920 },
                                height: { ideal: 1080 }
                            }}
                            className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-700 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}
                            onUserMedia={() => setIsCameraReady(true)}
                            onUserMediaError={(err) => {
                                console.error('Webcam error:', err);
                            }}
                            mirrored={facingMode === 'user'}
                        />
                    </>
                )}

                {/* 4. Controls Overlay (Gradient) - Only visible when not previewing or if we want controls over preview */}
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-30" />
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-30" />

                {/* Top Controls */}
                <div className="absolute top-0 left-0 right-0 z-40 p-4 pt-8 md:pt-6 flex justify-between items-start safe-area-top">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="p-3 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors border border-white/5 shadow-lg"
                    >
                        <X size={24} />
                    </button>

                    {/* Recording Timer */}
                    <AnimatePresence>
                        {isRecording && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="px-4 py-1.5 rounded-full bg-red-500/90 backdrop-blur text-white font-mono font-medium flex items-center gap-2 shadow-lg shadow-red-500/20"
                            >
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                {formatTime(recordingTime)}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Utility Controls (Flip) - Hide when previewing */}
                    {!imgSrc && !videoBlob && (
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={toggleCamera}
                                className="p-3 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors border border-white/5 shadow-lg"
                            >
                                <RefreshCw size={24} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 z-40 p-6 pb-12 md:pb-16 flex flex-col items-center gap-8 safe-area-bottom">

                    {/* Review Mode Controls */}
                    {imgSrc || videoBlob ? (
                        <div className="flex w-full items-center justify-between max-w-xs px-4">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={retake}
                                className="flex flex-col items-center gap-2 text-white/80 hover:text-white group"
                            >
                                <div className="p-4 bg-white/10 backdrop-blur-md rounded-full group-hover:bg-white/20 transition-colors">
                                    <RefreshCw size={24} />
                                </div>
                                <span className="text-xs font-medium tracking-wide uppercase shadow-black/50 text-glow">Retake</span>
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleSend}
                                disabled={isUploading}
                                className="flex flex-col items-center gap-2 text-white"
                            >
                                <div className="p-5 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-full shadow-xl shadow-pink-500/30 ring-4 ring-pink-500/20 group-disabled:opacity-50">
                                    {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} fill="currentColor" />}
                                </div>
                                <span className="text-xs font-medium tracking-wide uppercase shadow-black/50 text-glow">Send</span>
                            </motion.button>
                        </div>
                    ) : (
                        /* Capture Mode Controls */
                        <>
                            {/* Mode Selector */}
                            {!isRecording && (
                                <div className="flex items-center gap-1 p-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                                    <button
                                        onClick={() => setMode('photo')}
                                        className={`px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded-full transition-all duration-300 ${mode === 'photo' ? 'bg-white text-black shadow-lg scale-100' : 'text-slate-400 hover:text-white scale-95'}`}
                                    >
                                        Photo
                                    </button>
                                    <button
                                        onClick={() => setMode('video')}
                                        className={`px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded-full transition-all duration-300 ${mode === 'video' ? 'bg-white text-black shadow-lg scale-100' : 'text-slate-400 hover:text-white scale-95'}`}
                                    >
                                        Video
                                    </button>
                                </div>
                            )}

                            {/* Shutter Button */}
                            <div className="flex items-center justify-center pt-2">
                                <motion.button
                                    onTap={mode === 'photo' ? capture : (isRecording ? stopRecording : startRecording)}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative group cursor-pointer"
                                >
                                    {/* Outer Ring */}
                                    <div className={`w-20 h-20 rounded-full border-[4px] transition-all duration-300 ${isRecording ? 'border-red-500/50 scale-110' : 'border-white group-hover:border-slate-200 shadow-[0_0_15px_rgba(0,0,0,0.3)]'}`}></div>

                                    {/* Inner Circle */}
                                    <div
                                        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 shadow-lg 
                                            ${mode === 'photo'
                                                ? 'w-16 h-16 bg-white group-active:scale-90 group-active:bg-slate-200'
                                                : isRecording
                                                    ? 'w-8 h-8 bg-red-500 rounded-md scale-100'
                                                    : 'w-16 h-16 bg-red-500 group-hover:bg-red-400'
                                            }
                                        `}
                                    />
                                </motion.button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </motion.div>,
        document.body
    );
}
