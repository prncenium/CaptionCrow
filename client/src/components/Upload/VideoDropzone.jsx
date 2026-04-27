import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileVideo, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '../../store/useEditorStore';
import { useTranscription } from '../../hooks/useTranscription';

export default function VideoDropzone() {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    
    // Bring in our global state and backend connection
    const { isProcessing, setVideo } = useEditorStore();
    const { uploadAndTranscribe } = useTranscription();

    // Core logic for handling the incoming file
    const handleFile = async (file) => {
        if (!file) return;
        
        // Strict validation: Only accept video formats
        if (!file.type.startsWith('video/')) {
            alert('Please upload a valid video file (MP4, WebM, MOV).');
            return;
        }

        // 1. Generate a local URL so the browser can play it immediately without waiting
        const localVideoUrl = URL.createObjectURL(file);
        setVideo(file, localVideoUrl);

        // 2. Send the file to your Node.js backend to get the AI timestamps
        const success = await uploadAndTranscribe(file);
        
        if (!success) {
            alert('Failed to process video transcription. Please check your server connection.');
        }
    };

    // Drag and Drop Event Handlers
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
        <div className="flex w-full h-full p-8 items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => !isProcessing && fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center w-full p-16 overflow-hidden transition-all border-2 border-dashed rounded-2xl cursor-pointer group ${
                        isDragging 
                            ? "border-emerald-500 bg-emerald-500/10" 
                            : "border-neutral-700 bg-neutral-900 hover:border-neutral-500 hover:bg-neutral-800"
                    } ${isProcessing ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                >
                    {/* Hidden input to trigger the actual file browser */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFile(e.target.files[0])}
                        accept="video/mp4,video/webm,video/quicktime"
                        className="hidden"
                    />

                    {/* Smoothly swap between the upload icon and the loading spinner */}
                    <AnimatePresence mode="wait">
                        {isProcessing ? (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex flex-col items-center text-emerald-500"
                            >
                                <Loader2 className="w-16 h-16 mb-4 animate-spin" />
                                <h3 className="text-xl font-bold tracking-tight text-white">AI is transcribing audio...</h3>
                                <p className="mt-2 text-sm text-neutral-400">Extracting word-level timestamps.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex flex-col items-center"
                            >
                                <div className="p-4 mb-6 transition-colors rounded-full bg-neutral-800 group-hover:bg-neutral-700">
                                    <UploadCloud className="w-12 h-12 text-neutral-300" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight text-white">Drop your video here</h3>
                                <p className="mt-2 text-sm text-neutral-400">MP4, WebM, or MOV up to 1GB</p>
                                <div className="px-6 py-2 mt-8 text-sm font-medium transition-colors rounded-full bg-neutral-800 text-neutral-300 group-hover:bg-neutral-700 group-hover:text-white">
                                    Browse Files
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}