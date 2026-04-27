import React, { useState } from 'react';
import { Loader2, Download } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import axios from 'axios';
import { groupCaptions } from '../../utils/captionChunker'; // NEW: We must import the chunker!

export default function ExportButton() {
    const [isExporting, setIsExporting] = useState(false);
    
    // Pull the necessary data from the global store
    const { transcription, activeStyle, serverVideoFilename } = useEditorStore();

    const handleExport = async () => {
        if (!serverVideoFilename) {
            alert("Error: Original video not found on server.");
            return;
        }

        setIsExporting(true);
        
        // CRITICAL STEP: Bundle the words into Caption Cards before sending to the server
        const chunkedCaptions = groupCaptions(
            transcription, 
            activeStyle.maxCharsPerLine, 
            activeStyle.maxLinesPerCard
        );
        
        try {
            // 🟢 UPDATED: Using the .env variable for the live Render URL
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/export`, {
                transcription: chunkedCaptions, // Send the grouped chunks, NOT the raw words
                styles: activeStyle,
                originalFileName: serverVideoFilename
            });

            if (response.data.success) {
                // Success! Force the browser to download the final video
                const link = document.createElement('a');
                link.href = response.data.downloadUrl;
                link.setAttribute('download', 'Caption-Crow-Export.mp4');
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else {
                alert("Export failed on server: " + response.data.message);
            }
        } catch (error) {
            console.error("Export Error:", error);
            alert("Export failed. Please check the backend terminal for errors.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button 
            onClick={handleExport}
            disabled={isExporting}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold transition-all rounded-md shadow-lg ${
                isExporting 
                ? "bg-neutral-700 text-neutral-400 cursor-wait" 
                : "bg-white text-black hover:bg-emerald-400 hover:text-black hover:shadow-emerald-500/20"
            }`}
        >
            {isExporting ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rendering Video...
                </>
            ) : (
                <>
                    <Download className="w-4 h-4" />
                    Export Video
                </>
            )}
        </button>
    );
}