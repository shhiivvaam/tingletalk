'use client';

import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { X, Camera, RefreshCw, Send, Check } from 'lucide-react';
import { UploadService } from '@/services/uploadService';

interface CameraModalProps {
    onClose: () => void;
    onSend: (url: string) => void;
}

export default function CameraModal({ onClose, onSend }: CameraModalProps) {
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setImgSrc(imageSrc);
        }
    }, [webcamRef]);

    const retake = () => {
        setImgSrc(null);
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    const handleSend = async () => {
        if (!imgSrc) return;

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
                    ) : (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode }}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                <div className="p-8 bg-black/80 backdrop-blur-xl flex items-center justify-around pb-12">
                    {imgSrc ? (
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
                            <button onClick={capture} className="p-1 border-4 border-white rounded-full">
                                <div className="w-16 h-16 bg-white rounded-full"></div>
                            </button>
                            <div className="w-12"></div> {/* Spacer */}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
