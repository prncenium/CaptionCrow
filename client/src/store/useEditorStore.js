import { create } from 'zustand';
import { groupCaptions } from '../utils/captionChunker';
import { PRESET_STYLES } from '../utils/presetStyles';
import { filterMinimalistHighlights } from '../utils/minimalistHighlightFilter';
import { useProjectStore } from './useProjectStore';

export const useEditorStore = create((set, get) => ({
    // --- Media State ---
    videoFile: null,
    videoUrl: null,
    serverVideoFilename: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    transcription: [],
    aiHighlights: [],      // active lookup list used by canvas (may be filtered for Minimalist)
    rawAiHighlights: [],   // original unfiltered LLaMA output — used to restore on preset switch
    isProcessing: false,
    
    // --- Timeline Data Engine ---
    timelineBlocks: [], 
    history: [], 
    selectedBlockId: null, 
    editingCaptionId: null,
    
    // --- Styling State ---
    activeStyle: {
        fontFamily: 'Poppins',   
        fontWeight: '900',       
        fontStyle: 'normal',     
        fontSize: 48,
        fillColor: '#ffffff',
        inactiveColor: '',
        strokeColor: '#000000',
        strokeWidth: 0,
        shadowColor: 'rgba(0,0,0,0.8)',
        shadowBlur: 10,
        shadowOffsetX: 4,
        shadowOffsetY: 4,
        maxCharsPerLine: 11,
        maxLinesPerCard: 2,
        animationStyle: 'none',
        wordStagger: true,
        motionBlur: 0,
        animationDurationMs: 300,
        staggerDelayMs: 150,
        hasBackground: false,
        backgroundColor: '#000000'
    },

    activeLineTarget: -1, 
    lineStyles: [], 
    customFonts: [],

    // THE INDEPENDENT LINE POSITIONS
    // e.g., { 0: { x: 100, y: 50 }, 1: { x: 100, y: 150 } }
    globalLineOffsets: {},

    // --- Actions ---
    setVideo: (file, url) => set({ videoFile: file, videoUrl: url, isPlaying: false, currentTime: 0 }),
    setServerVideoFilename: (name) => set({ serverVideoFilename: name }), 
    setPlaying: (isPlaying) => set({ isPlaying }),
    setCurrentTime: (time) => set({ currentTime: time }),
    setDuration: (duration) => set({ duration }),
    setTranscription: (data, highlights = []) => {

    const normalizedHighlights = highlights.map(h =>
        String(h)
            .replace(/[^\p{L}\p{N}]/gu, '')
            .toLowerCase()
    );

    const enrichedData = data.map(wordObj => {

        const cleanedWord = String(wordObj.word || '')
            .replace(/[^\p{L}\p{N}]/gu, '')
            .toLowerCase();

        const isEmp = normalizedHighlights.includes(cleanedWord);

        return {
            ...wordObj,
            isEmphasized: isEmp,
            color: isEmp ? '#FFFF3D' : '#FFFFFF',
        };
    });

    console.log(
        'FINAL ENRICHED TRANSCRIPTION:',
        enrichedData
    );

    set({
        transcription: enrichedData,
        aiHighlights: highlights,
        rawAiHighlights: highlights, // preserve original for preset restore
    });
},
    setIsProcessing: (status) => set({ isProcessing: status }),
    setActiveLineTarget: (index) => set({ activeLineTarget: index }),
    
    addCustomFont: (fontName) => set((state) => ({ 
        customFonts: [...state.customFonts, fontName] 
    })),

    // NEW: Independent Global Line Drag
    setGlobalLineOffset: (index, x, y) => {
        get().saveHistory();
        set((state) => ({
            globalLineOffsets: {
                ...state.globalLineOffsets,
                [index]: { x, y }
            }
        }));
    },

    // Resets all lines back to their default stacked positions
    resetLinePositions: () => {
        get().saveHistory();
        set({ globalLineOffsets: {} });
    },

    bakeTimeline: () => set((state) => {
        const chunks = groupCaptions(
            state.transcription, 
            state.activeStyle.maxCharsPerLine, 
            state.activeStyle.maxLinesPerCard,
            state.aiHighlights // 🚨 THIS MUST BE HERE
        );
        
        const bakedBlocks = chunks.map((chunk, index) => {
            const existingBlock = state.timelineBlocks.find(b => b.start === chunk.start);
            return {
    id: existingBlock?.id || `block-${index}-${Date.now()}`,
    text: chunk.text,
    start: chunk.start,
    end: chunk.end,

    words: chunk.words || [],

    customLinePositions: existingBlock?.customLinePositions || {},
    styleOverrides: existingBlock?.styleOverrides || {} 
};
        });

        return { timelineBlocks: bakedBlocks };
    }),

    updateBlockTiming: (id, newStart, newEnd) => set((state) => ({
        timelineBlocks: state.timelineBlocks.map(block => 
            block.id === id ? { ...block, start: newStart, end: newEnd } : block
        )
    })),

    updateBlockText: (id, newText) => set((state) => ({
        timelineBlocks: state.timelineBlocks.map(block => 
            block.id === id ? { ...block, text: newText } : block
        )
    })),
    // NEW: Local override for a single block (powers the Sidebar!)
    updateBlockPosition: (id, lineIndex, x, y) => {
        get().saveHistory();
        set((state) => ({
            timelineBlocks: state.timelineBlocks.map(block => 
                block.id === id ? { 
                    ...block, 
                    customLinePositions: {
                        ...(block.customLinePositions || {}),
                        [lineIndex]: { x, y }
                    }
                } : block
            )
        }));
    },

    updateBlockStyleOverride: (id, newStyles) => set((state) => ({
        timelineBlocks: state.timelineBlocks.map(block => 
            block.id === id 
            ? { ...block, styleOverrides: { ...block.styleOverrides, ...newStyles } } 
            : block
        )
    })),

    setSelectedBlock: (id) => set({ selectedBlockId: id }),
    setEditingCaptionId: (id) => set({ editingCaptionId: id }),

    // NEW: Applies a global style preset and respects line-specific overrides
applyPreset: (presetId) => {
    // Bulleproof string matching: force lowercase to catch UI capitalization errors
    const safeId = String(presetId).toLowerCase().trim();
    const preset = PRESET_STYLES[safeId];
    if (!preset) {
        console.warn(`[Zustand] Could not find preset: ${presetId}`);
        return; 
    }

    // Prepare lineStyles (if they exist in the preset) and convert them to an array
    const presetLineStyles = preset.lineStyles ? Object.values(preset.lineStyles) : [];

    // Normalize layout keys to catch typos (maxLines vs lines)
    const safeMaxLines = preset.maxLinesPerCard || preset.linesPerCard || 2;
    const safeMaxChars = preset.maxCharsPerLine || preset.charsPerLine || 15;

    //🚨 ATOMIC SOLUTION: Integrated Ghost Wiper Logic!
    set((state) => {
        // Step 1: Wipe overrides and custom positions from existing blocks
        const cleanOldBlocks = state.timelineBlocks.map(block => ({
            ...block,
            styleOverrides: {},
            customLinePositions: {}
        }));

        // Step 1b: Compute the active highlight word-string list for this preset.
        //
        // The canvas overlay resolves yellow via `aiHighlights.includes(cleanWord)`,
        // so we MUST update `aiHighlights` in state — not just the word objects.
        //
        // Minimalist → run the strict POS + 7-word gap filter, convert the
        //              result (Set of indices) back to word strings, write to aiHighlights.
        // All others → restore the original unfiltered LLaMA list (rawAiHighlights).

        let enrichedTranscription = state.transcription;
        let nextAiHighlights = state.rawAiHighlights; // default: restore full list

        if (state.transcription.length > 0) {
            if (safeId === 'minimalist') {
                // Use rawAiHighlights as the input to the filter (not the possibly-already-filtered aiHighlights)
                const filteredIndices = filterMinimalistHighlights(
                    state.transcription,
                    state.rawAiHighlights
                );

                // Convert indices → word strings so the canvas lookup works
                nextAiHighlights = [...filteredIndices].map(idx => {
                    const w = state.transcription[idx];
                    return String(w.word || w.text || '')
                        .replace(/[^\p{L}\p{N}]/gu, '')
                        .toLowerCase();
                }).filter(Boolean);

                // Also update isEmphasized flags on word objects for export pipeline
                enrichedTranscription = state.transcription.map((w, idx) => ({
                    ...w,
                    isEmphasized: filteredIndices.has(idx),
                    color: filteredIndices.has(idx) ? '#FFFF3D' : '#FFFFFF',
                }));
            } else {
                // Restore standard matching — re-enrich word objects from the raw list
                const normalizedSet = new Set(
                    state.rawAiHighlights.map(h =>
                        String(h).replace(/[^\p{L}\p{N}]/gu, '').toLowerCase()
                    )
                );
                enrichedTranscription = state.transcription.map(w => {
                    const cleaned = String(w.word || '').replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
                    const isEmp = normalizedSet.has(cleaned);
                    return { ...w, isEmphasized: isEmp, color: isEmp ? '#FFFF3D' : '#FFFFFF' };
                });
            }
        }

        // Step 2: Prepare the re-baking using groupCaptions
        const chunks = groupCaptions(
            enrichedTranscription,
            safeMaxChars,
            safeMaxLines,
            state.aiHighlights
        );
        
        // Step 3: Re-bake new timeline blocks using the re-enriched transcription
        const bakedBlocks = chunks.map((chunk, index) => {
            const existingCleanBlock = cleanOldBlocks.find(b => b.start === chunk.start);
            return {
                id: existingCleanBlock?.id || `block-${index}-${Date.now()}`,
                text: chunk.text,
                start: chunk.start,
                end: chunk.end,
                words: chunk.words || [],
                customLinePositions: existingCleanBlock?.customLinePositions || {},
                styleOverrides: existingCleanBlock?.styleOverrides || {}
            };
        });

        // Step 4: Atomically update store — include re-enriched transcription + active highlights
        return {
            transcription: enrichedTranscription,
            aiHighlights: nextAiHighlights,   // canvas uses this for yellow lookup
            activeStyle: {
                ...state.activeStyle,
                emphasisColor: null,
                inactiveColor: null,
                ...preset,
                maxLinesPerCard: safeMaxLines,
                maxCharsPerLine: safeMaxChars
            },
            lineStyles: presetLineStyles,
            globalLineOffsets: {},
            timelineBlocks: bakedBlocks
        };
    });
    // get().bakeTimeline(); //🚨 DELETED: Now integrated into the single set() update!

    // Track active preset in My Edits history
    const { currentEditId, updateEditPreset } = useProjectStore.getState();
    if (currentEditId) updateEditPreset(currentEditId, safeId);

    // Auto-trigger AI refresh for minimalist if AI data is sparse (old cached / never run)
    if (safeId === 'minimalist') {
        const currentState = get();
        const density = currentState.rawAiHighlights.length / (currentState.transcription.length || 1);
        if (density < 0.08 && currentState.transcription.length > 0) {
            console.log(`[applyPreset] Minimalist: sparse AI data (density=${(density*100).toFixed(1)}%), triggering refresh...`);
            get().refreshAiHighlights();
        }
    }
},

    // Calls the server to re-analyze the current transcript for highlights (no re-upload needed).
    // Auto-triggered when switching to minimalist with sparse/old AI data.
    refreshAiHighlights: async () => {
        const state = get();
        if (!state.transcription.length) return;

        const fullText = state.transcription.map(w => w.word || w.text || '').filter(Boolean).join(' ');

        try {
            const response = await fetch('http://localhost:5000/api/refresh-highlights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcriptText: fullText })
            });
            const data = await response.json();
            if (!data.success || !data.aiHighlights?.length) return;

            console.log(`[refreshAiHighlights] AI returned ${data.aiHighlights.length} words`);

            const currentState = get();
            const filteredIndices = filterMinimalistHighlights(currentState.transcription, data.aiHighlights);

            const nextAiHighlights = [...filteredIndices].map(idx => {
                const w = currentState.transcription[idx];
                return String(w.word || w.text || '').replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
            }).filter(Boolean);

            const enrichedTranscription = currentState.transcription.map((w, idx) => ({
                ...w,
                isEmphasized: filteredIndices.has(idx),
                color: filteredIndices.has(idx) ? '#FFFF3D' : '#FFFFFF',
            }));

            const safeMaxChars = currentState.activeStyle.maxCharsPerLine || 15;
            const safeMaxLines = currentState.activeStyle.maxLinesPerCard || 1;
            const chunks = groupCaptions(enrichedTranscription, safeMaxChars, safeMaxLines, nextAiHighlights);
            const bakedBlocks = chunks.map((chunk, index) => {
                const existingBlock = currentState.timelineBlocks.find(b => b.start === chunk.start);
                return {
                    id: existingBlock?.id || `block-${index}-${Date.now()}`,
                    text: chunk.text,
                    start: chunk.start,
                    end: chunk.end,
                    words: chunk.words || [],
                    customLinePositions: existingBlock?.customLinePositions || {},
                    styleOverrides: existingBlock?.styleOverrides || {}
                };
            });

            set({
                rawAiHighlights: data.aiHighlights,
                aiHighlights: nextAiHighlights,
                transcription: enrichedTranscription,
                timelineBlocks: bakedBlocks,
            });

            console.log(`[refreshAiHighlights] Applied ${nextAiHighlights.length} highlights`);
        } catch (error) {
            console.error('[refreshAiHighlights] Failed:', error);
        }
    },

    updateStyle: (newStyles) => set((state) => {
        if (state.activeLineTarget === -1) {
            return { activeStyle: { ...state.activeStyle, ...newStyles } };
        }
        const updatedLineStyles = [...state.lineStyles];
        if (!updatedLineStyles[state.activeLineTarget]) {
            updatedLineStyles[state.activeLineTarget] = {};
        }
        updatedLineStyles[state.activeLineTarget] = { 
            ...updatedLineStyles[state.activeLineTarget], 
            ...newStyles 
        };
        return { lineStyles: updatedLineStyles };
    }),

    saveHistory: () => set((state) => {
        const snapshot = JSON.parse(JSON.stringify(state.timelineBlocks));
        const newHistory = [...state.history, snapshot].slice(-30);
        return { history: newHistory };
    }),

    undo: () => set((state) => {
        if (state.history.length === 0) return state;
        const newHistory = [...state.history];
        const previousState = newHistory.pop();
        return { 
            timelineBlocks: previousState, 
            history: newHistory,
            selectedBlockId: null,
            editingCaptionId: null
        };
    }),

    deleteBlock: (id) => {
        get().saveHistory();
        set((state) => ({
            timelineBlocks: state.timelineBlocks.filter(b => b.id !== id),
            selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
            editingCaptionId: state.editingCaptionId === id ? null : state.editingCaptionId
        }));
    },

    addManualCaption: (insertTime) => {
        get().saveHistory();
        set((state) => {
            const newCaptionBlock = {
                id: `manual_${Date.now()}`,
                text: "NEW CAPTION",
                start: insertTime,
                end: insertTime + 2.0,
                styleOverrides: {},
                isManual: true
            };
            const updatedBlocks = [...state.timelineBlocks, newCaptionBlock];
            return { timelineBlocks: updatedBlocks.sort((a, b) => a.start - b.start) };
        });
    },

    resetEditor: () => set({
        videoFile: null,
        videoUrl: null,
        serverVideoFilename: null,
        isPlaying: false,
        currentTime: 0,
        transcription: [],
        aiHighlights:[],
        isProcessing: false,
        lineStyles: [],
        activeLineTarget: -1,
        customFonts: [],
        globalLineOffsets: {},
        timelineBlocks: [], 
        selectedBlockId: null,
        editingCaptionId: null
    })
}));