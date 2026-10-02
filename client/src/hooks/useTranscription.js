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
                setTranscription(result.data, result.aiHighlights, result.aiPhraseBreaks);
                bakeTimeline();
                if (result.originalFileName) {
                    setServerVideoFilename(result.originalFileName);
                }

                // Save this as a resumable project if the user is logged in — silently
                // does nothing when logged out (editing/exporting still works either way).
                if (result.originalFileName) {
                    const editorState = useEditorStore.getState();
                    useProjectStore.getState().createProject({
                        videoFilename: result.originalFileName,
                        videoName: file.name,
                        transcription: editorState.transcription,
                        timelineBlocks: editorState.timelineBlocks,
                        activeStyle: editorState.activeStyle,
                        lineStyles: editorState.lineStyles,
                        globalLineOffsets: editorState.globalLineOffsets,
                        aiHighlights: editorState.aiHighlights,
                        rawAiHighlights: editorState.rawAiHighlights,
                        aiPhraseBreaks: editorState.aiPhraseBreaks,
                    });
                }

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
