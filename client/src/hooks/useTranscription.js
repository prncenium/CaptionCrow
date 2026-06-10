import { useEditorStore } from '../store/useEditorStore';
import { useProjectStore } from '../store/useProjectStore';

export function useTranscription() {
    // 1. PULL IN THE MISSING SETTER
    const { setTranscription, setIsProcessing, setServerVideoFilename } = useEditorStore();

    const uploadAndTranscribe = async (file) => {
        setIsProcessing(true);
        
        try {
            const formData = new FormData();
            formData.append('video', file);

            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // 2. Save the AI transcript
                setTranscription(result.data, result.aiHighlights);
                
                // 3. THE CRITICAL FIX: Save the exact name the server generated!
                if (result.originalFileName) {
                    setServerVideoFilename(result.originalFileName);
                }

                // Track this session in My Edits
                useProjectStore.getState().addEdit(file.name);

                setIsProcessing(false);
                return true;
            } else {
                throw new Error(result.error || "Upload failed");
            }
        } catch (error) {
            console.error("Transcription Error:", error);
            setIsProcessing(false);
            return false;
        }
    };

    return { uploadAndTranscribe };
}