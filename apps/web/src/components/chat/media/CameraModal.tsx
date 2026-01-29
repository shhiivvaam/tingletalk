'use client';

import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { X, Camera, RefreshCw, Send, Check } from 'lucide-react';
import { UploadService } from '@/services/uploadService';

interface CameraModalProps {
    onClose: () => void;
    onSend: (url: string, type?: 'image' | 'video') => void;
}

export default function CameraModal({ onClose, onSend }: CameraModalProps) {
    const webcamRef = useRef<Webcam>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [mode, setMode] = useState<'photo' | 'video'>('photo');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const MAX_VIDEO_DURATION = 60; // 60 seconds

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setImgSrc(imageSrc);
        }
    }, [webcamRef]);

    const startRecording = useCallback(async () => {
        setIsRecording(true);
        chunksRef.current = [];
        setRecordingTime(0);

        if (webcamRef.current) {
            let stream = webcamRef.current.stream;

            // Should verify stream has audio track
            if (stream && stream.getAudioTracks().length === 0) {
                // Try to force get a stream with audio if missing (e.g. initial load was photo mode)
                try {
                    const newStream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode },
                        audio: true
                    });
                    stream = newStream;
                    // Note: this new stream isn't attached to the webcam view but we use it for recording
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

                    // cleanup if we created a temporary stream
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
                            // Cleanup stream if temporary
                            if (stream !== webcamRef.current?.stream) {
                                stream.getTracks().forEach(track => track.stop());
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
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    const handleSend = async () => {
        if (imgSrc) {
            try {
                // Convert base64 to blob/file
                const res = await fetch(imgSrc);
                const blob = await res.blob();
                const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });

                const url = await UploadService.uploadFile(file);
                onSend(url);
                onClose();
            } catch (err) {
                console.error('Upload failed', err);
            }
        } else if (videoBlob) {
            try {
                const file = new File([videoBlob], 'camera-video.webm', { type: 'video/webm' });
                const url = await UploadService.uploadFile(file);
                // We send it as 'video' type, handled by parent if it detects video extension or we pass type explicitly
                // But onSend only takes url. We might need to handle this?
                // Actually parent interprets file extension or we rely on it.
                // Re-reading ChatWindow: it sends 'image' hardcoded for camera!
                // We need to fix that props or how onSend works.
                // Assuming onSend is just (url) => void, we should update ChatWindow to handle video type or detect it.
                // Let's assume URL detection or update props later. For now, sending URL.

                // WAIT: ChatWindow handleCameraCapture sends 'image' type hardcoded.
                // We need to be able to tell it it's a video.
                // I will update onSend signature in next step or use a hack (append ?type=video)
                // Better: Just update the Parent component to accept type.

                // For now, let's just send usage. Parent will treat as image if we don't change it.
                // I will update parent in next step.
                // I will update parent in next step.
                onSend(url, 'video');
                onClose();
            } catch (err) {
                console.error('Upload failed', err);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center">
            <div className="w-full h-full relative flex flex-col">
                <div className="absolute top-4 right-4 z-10">
                    <button onClick={onClose} className="p-3 bg-black/50 rounded-full text-white backdrop-blur-md">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                    {imgSrc ? (
                        <img src={imgSrc} alt="captured" className="max-h-full max-w-full object-contain" />
                    ) : videoBlob ? (
                        <video src={URL.createObjectURL(videoBlob)} controls className="max-h-full max-w-full" />
                    ) : (
                        <>
                            <Webcam
                                audio={mode === 'video'}
                                muted={true}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{ facingMode }}
                                className="w-full h-full object-cover absolute inset-0"
                                onUserMedia={() => console.log('Webcam: User media loaded')}
                                onUserMediaError={(err) => console.error('Webcam: User media error', err)}
                            />
                            {isRecording && (
                                <div className="absolute top-4 left-0 right-0 flex justify-center">
                                    <div className="bg-red-500/80 px-4 py-1 rounded-full text-white text-xs font-bold animate-pulse flex items-center gap-2">
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                        {formatTime(recordingTime)}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="p-4 md:p-8 bg-black/80 backdrop-blur-xl flex flex-col gap-4">
                    {/* Mode Switcher */}
                    {!imgSrc && !videoBlob && !isRecording && (
                        <div className="flex justify-center gap-6 pb-4">
                            <button
                                onClick={() => setMode('photo')}
                                className={`text-xs font-bold tracking-widest uppercase transition-colors ${mode === 'photo' ? 'text-yellow-400' : 'text-slate-500'}`}
                            >
                                Photo
                            </button>
                            <button
                                onClick={() => setMode('video')}
                                className={`text-xs font-bold tracking-widest uppercase transition-colors ${mode === 'video' ? 'text-yellow-400' : 'text-slate-500'}`}
                            >
                                Video
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-around">
                        {imgSrc || videoBlob ? (
                            <>
                                <button onClick={retake} className="flex flex-col items-center gap-2 text-white">
                                    <div className="p-4 bg-slate-800 rounded-full"><RefreshCw size={24} /></div>
                                    <span className="text-xs">Retake</span>
                                </button>
                                <button onClick={handleSend} className="flex flex-col items-center gap-2 text-white">
                                    <div className="p-4 bg-pink-500 rounded-full shadow-lg shadow-pink-500/30"><Send size={24} /></div>
                                    <span className="text-xs">Send</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={toggleCamera} className="text-white p-4 rounded-full bg-white/10">
                                    <RefreshCw size={24} />
                                </button>

                                {mode === 'photo' ? (
                                    <button onClick={capture} className="p-1 border-4 border-white rounded-full">
                                        <div className="w-16 h-16 bg-white rounded-full hover:bg-slate-200 transition-colors"></div>
                                    </button>
                                ) : (
                                    <button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`p-1 border-4 ${isRecording ? 'border-red-500' : 'border-white'} rounded-full transition-colors`}
                                    >
                                        <div className={`w-16 h-16 ${isRecording ? 'bg-red-500 scale-75' : 'bg-red-600'} rounded-full transition-all duration-300`}></div>
                                    </button>
                                )}

                                <div className="w-12"></div> {/* Spacer */}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
