import { useEditorStore } from '../store/useEditorStore';
import { useProjectStore } from '../store/useProjectStore';
import { getApiBase } from '../utils/apiConfig';

export function useTranscription() {
    const { setTranscription, setIsProcessing, setServerVideoFilename, bakeTimeline } = useEditorStore();

    const uploadAndTranscribe = async (file) => {
        setIsProcessing(true);

        const apiBase = getApiBase();
        console.log(`[Upload] Using API: ${apiBase}`);

        try {
            const formData = new FormData();
            formData.append('video', file);

            const response = await fetch(`${apiBase}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Server error ${response.status}: ${text.slice(0, 200)}`);
            }

            const result = await response.json();

            if (result.success) {
                setTranscription(result.data, result.aiHighlights);
                bakeTimeline();
                if (result.originalFileName) {
                    setServerVideoFilename(result.originalFileName);
                }
                useProjectStore.getState().addEdit(file.name);
                setIsProcessing(false);
                return true;
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            console.error('[Upload] Failed:', error.message);
            setIsProcessing(false);
            return false;
        }
    };

    return { uploadAndTranscribe };
}
