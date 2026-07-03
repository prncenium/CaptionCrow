import React, { useState, useRef, useCallback } from 'react';
import { CloudUpload, MonitorPlay, Loader2, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEditorStore } from '../../store/useEditorStore';
import { useTranscription } from '../../hooks/useTranscription';

export default function VideoDropzone() {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    
    const { isProcessing, setVideo } = useEditorStore();
    const { uploadAndTranscribe } = useTranscription();

    const handleFile = async (file) => {
        if (!file) return;
        
        if (!file.type.startsWith('video/')) {
            alert('Please upload a valid video file (MP4, WebM, MOV).');
            return;
        }

        const localVideoUrl = URL.createObjectURL(file);

        const success = await uploadAndTranscribe(file);
        if (success !== true) {
            alert('Transcription failed. Make sure the local server is running:\n  cd server && npm run dev');
            return;
        }

        setVideo(file, localVideoUrl);
        navigate('/editor');
    };

    const onDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFile(droppedFile);
    }, []);

    return (
        <div className="w-full font-sans antialiased">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`mt-2 border-[1.5px] border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center text-center transition-all duration-300 ease-out cursor-pointer ${
                    isDragging 
                        ? "bg-white/50 backdrop-blur-3xl border-white shadow-[0_12px_40px_rgba(0,0,0,0.12),inset_0_1px_4px_rgba(255,255,255,1)] ring-2 ring-[#007AFF]/40 scale-[1.01]" 
                        : "bg-white/30 backdrop-blur-2xl border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_4px_rgba(255,255,255,0.8)] hover:bg-white/40 hover:border-white hover:shadow-xl"
                } ${isProcessing ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => !isProcessing && fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFile(e.target.files[0])}
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                />

                <AnimatePresence mode="wait">
                    {isProcessing ? (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center text-[#007AFF]"
                        >
                            <Loader2 className="w-12 h-12 mb-4 animate-spin" />
                            <h3 className="text-[20px] font-bold tracking-tight text-[#1D1D1F]">Initializing Editor...</h3>
                            <p className="mt-2 text-[13px] font-medium tracking-tight text-slate-600">Preparing workspace for transcription.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="w-14 h-14 bg-[#007AFF]/12 rounded-2xl flex items-center justify-center mb-3">
                                <CloudUpload size={26} strokeWidth={1.75} className="text-[#007AFF]" />
                            </div>
                            
                            <div className="text-[19px] font-bold tracking-tight text-[#1D1D1F]">
                                Drop video files to begin transcription
                            </div>
                            
                            <div className="text-[13px] font-medium tracking-tight text-slate-600 mt-1.5 max-w-[560px] leading-relaxed">
                                MP4, MOV, WebM, ProRes proxies, or audio-only references. We will automatically transcribe your audio and generate a default caption track.
                            </div>

                            <div className="flex gap-2 mt-5">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        alert('Demo project loading feature coming soon!');
                                    }}
                                    className="px-4 py-2 bg-white/70 border border-white/85 rounded-xl text-[12.5px] font-semibold text-slate-800 hover:bg-white/85 transition-colors flex items-center gap-1.5 shadow-sm"
                                >
                                    <MonitorPlay size={13} strokeWidth={2} fill="currentColor" />
                                    Open demo project
                                </button>
                                
                                <button className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-[12.5px] font-semibold hover:bg-[#0066d6] transition-colors flex items-center gap-1.5 shadow-[0_4px_14px_rgba(0,122,255,0.35)]">
                                    <FolderOpen size={13} strokeWidth={2} />
                                    Browse files
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}