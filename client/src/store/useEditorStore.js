import { create } from 'zustand';
import { groupCaptions } from '../utils/captionChunker';

export const useEditorStore = create((set, get) => ({
    // --- Media State ---
    videoFile: null,
    videoUrl: null,
    serverVideoFilename: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    transcription: [],
    isProcessing: false,
    // The Timeline Data Engine (NLE Paradigm)
    timelineBlocks: [], 
    history: [], // <-- ADD THIS: Stores past timeline states for Undo
    selectedBlockId: null, 
    editingCaptionId: null,
    
    // --- Styling State ---
    activeStyle: {
        fontFamily: 'Poppins',   
        fontWeight: '900',       
        fontStyle: 'normal',     
        fontSize: 48,
        fillColor: '#ffffff',
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
        staggerDelayMs: 150 
    },

    // Advanced Typography State
    activeLineTarget: -1, 
    lineStyles: [], 
    linePositions: [], 
    customFonts: [],

    // NEW: Global line positions { 0: {x, y}, 1: {x, y} }
    // This ensures that moving Line 1 once moves ALL Line 1s in the video.
    globalLinePositions: {}, 

    // The Timeline Data Engine (NLE Paradigm)
    timelineBlocks: [], 
    selectedBlockId: null, 
    editingCaptionId: null,

    // --- Actions ---
    setVideo: (file, url) => set({ videoFile: file, videoUrl: url }),
    setServerVideoFilename: (name) => set({ serverVideoFilename: name }), 
    setPlaying: (isPlaying) => set({ isPlaying }),
    setCurrentTime: (time) => set({ currentTime: time }),
    setDuration: (duration) => set({ duration }),
    setTranscription: (data) => set({ transcription: data }),
    setIsProcessing: (status) => set({ isProcessing: status }),
    setActiveLineTarget: (index) => set({ activeLineTarget: index }),
    
    addCustomFont: (fontName) => set((state) => ({ 
        customFonts: [...state.customFonts, fontName] 
    })),

    setLinePosition: (index, position) => set((state) => {
        const newPositions = [...state.linePositions];
        newPositions[index] = position;
        return { linePositions: newPositions };
    }),

    resetLinePositions: () => set({ linePositions: [] }),

    // NEW ACTION: Updates the position for every instance of a line index across the video
    setGlobalLinePosition: (lineIndex, x, y) => set((state) => ({
        globalLinePositions: {
            ...state.globalLinePositions,
            [lineIndex]: { x, y }
        }
    })),

    // The "Baking" Function 
    bakeTimeline: () => set((state) => {
        const chunks = groupCaptions(
            state.transcription, 
            state.activeStyle.maxCharsPerLine, 
            state.activeStyle.maxLinesPerCard
        );
        
        const bakedBlocks = chunks.map((chunk, index) => ({
            id: `block-${index}-${Date.now()}`,
            text: chunk.text,
            start: chunk.start,
            end: chunk.end,
            customX: null,
            customY: null,
            styleOverrides: {} 
        }));

        return { timelineBlocks: bakedBlocks };
    }),

    updateBlockTiming: (id, newStart, newEnd) => set((state) => ({
        timelineBlocks: state.timelineBlocks.map(block => 
            block.id === id ? { ...block, start: newStart, end: newEnd } : block
        )
    })),

    // NEW: Updates the actual text string for a specific block
    updateBlockText: (id, newText) => set((state) => ({
        timelineBlocks: state.timelineBlocks.map(block => 
            block.id === id ? { ...block, text: newText } : block
        )
    })),

    // Upgraded individual override: Prevents Line 1 and Line 2 from snapping together!
    updateBlockPosition: (id, lineIndex, x, y) => set((state) => ({
        timelineBlocks: state.timelineBlocks.map(block => 
            block.id === id ? { 
                ...block, 
                customLinePositions: {
                    ...(block.customLinePositions || {}),
                    [lineIndex]: { x, y }
                }
            } : block
        )
    })),

    // Replaces style overrides for a specific block
    updateBlockStyleOverride: (id, newStyles) => set((state) => ({
        timelineBlocks: state.timelineBlocks.map(block => 
            block.id === id 
            ? { ...block, styleOverrides: { ...block.styleOverrides, ...newStyles } } 
            : block
        )
    })),

    setSelectedBlock: (id) => set({ selectedBlockId: id }),
    
    // Toggles the left-side individual editing panel
    setEditingCaptionId: (id) => set({ editingCaptionId: id }),

    

    updateStyle: (newStyles) => set((state) => {
        // 1. GLOBAL UPDATE: If "All Lines" is targeted (-1), update the baseline styles
        if (state.activeLineTarget === -1) {
            return { activeStyle: { ...state.activeStyle, ...newStyles } };
        }
        
        // 2. TRACK UPDATE: If a specific line is targeted (L1 or L2), update that track globally
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

    // --- HISTORY & UNDO ENGINE ---
    saveHistory: () => set((state) => {
        // Creates a deep copy of the current blocks to prevent reference bugs
        const snapshot = JSON.parse(JSON.stringify(state.timelineBlocks));
        // Keep only the last 30 actions to save memory
        const newHistory = [...state.history, snapshot].slice(-30);
        return { history: newHistory };
    }),

    undo: () => set((state) => {
        if (state.history.length === 0) return state; // Nothing to undo
        const newHistory = [...state.history];
        const previousState = newHistory.pop(); // Get the last saved state
        
        return { 
            timelineBlocks: previousState, 
            history: newHistory,
            selectedBlockId: null, // Clear selection safely
            editingCaptionId: null
        };
    }),

    deleteBlock: (id) => {
        get().saveHistory(); // Save state before deleting!
        set((state) => ({
            timelineBlocks: state.timelineBlocks.filter(b => b.id !== id),
            selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
            editingCaptionId: state.editingCaptionId === id ? null : state.editingCaptionId
        }));
    },

    addManualCaption: (insertTime) => {
        get().saveHistory(); // Hooks into your existing Undo engine!
        set((state) => {
            const newCaptionBlock = {
                id: `manual_${Date.now()}`,
                text: "NEW CAPTION",     // Matched to your bakeTimeline schema
                start: insertTime,
                end: insertTime + 2.0,   // Defaults to 2 seconds duration
                customX: null,           // Matched to your bakeTimeline schema
                customY: null,           // Matched to your bakeTimeline schema
                styleOverrides: {},      // Matched to your bakeTimeline schema
                isManual: true
            };

            const updatedBlocks = [...state.timelineBlocks, newCaptionBlock];
            return { 
                // Sort them so the timeline renders them chronologically
                timelineBlocks: updatedBlocks.sort((a, b) => a.start - b.start) 
            };
        });
    },


    resetEditor: () => set({
        videoFile: null,
        videoUrl: null,
        serverVideoFilename: null,
        isPlaying: false,
        currentTime: 0,
        transcription: [],
        isProcessing: false,
        lineStyles: [],
        activeLineTarget: -1,
        customFonts: [],
        linePositions: [],
        globalLinePositions: {}, // NEW: Resets global positions
        timelineBlocks: [], 
        selectedBlockId: null ,
        editingCaptionId: null
    })
}));