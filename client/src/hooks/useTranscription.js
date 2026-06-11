import { useEditorStore } from '../store/useEditorStore';
import { useProjectStore } from '../store/useProjectStore';

export function useTranscription() {
    // 1. PULL IN THE MISSING SETTER
    const { setTranscription, setIsProcessing, setServerVideoFilename, bakeTimeline } = useEditorStore();

    const uploadAndTranscribe = async (file) => {
        setIsProcessing(true);
        
        try {
            const formData = new FormData();
            formData.append('video', file);

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // 2. Save the AI transcript
                setTranscription(result.data, result.aiHighlights);

                // 3. Build caption blocks immediately so export works from any page
                bakeTimeline();

                // 4. THE CRITICAL FIX: Save the exact name the server generated!
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