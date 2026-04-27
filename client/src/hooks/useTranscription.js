import axios from 'axios';
import { useEditorStore } from '../store/useEditorStore';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api', 
});

export const useTranscription = () => {
    const { setIsProcessing, setTranscription, setServerVideoFilename } = useEditorStore();

    const uploadAndTranscribe = async (videoFile) => {
        setIsProcessing(true);
        const formData = new FormData();
        formData.append('video', videoFile);

        try {
            const response = await apiClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            if (response.data.success) {
                setTranscription(response.data.data);
                // NEW: Save the backend filename so we can export it later
                setServerVideoFilename(response.data.originalFileName);
                return true;
            }
        } catch (error) {
            console.error("Transcription failed:", error);
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    return { uploadAndTranscribe };
};