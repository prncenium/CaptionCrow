import { create } from 'zustand';

/**
 * useUIStore: Handles the global "shell" of the application.
 * This separates UI-only states (like toggles) from the heavy video logic 
 * in useEditorStore, preventing unnecessary re-renders of the video canvas.
 */
export const useUIStore = create((set) => ({
    // --- SIDEBAR & PANEL STATES ---
    leftSidebarOpen: true,
    rightSidebarOpen: true,
    
    // Tracks which tab is active in the Editor's Right Panel 
    // Values: 'text' | 'layout' | 'transitions'
    activeEditorTab: 'text', 
    
    // --- MODAL MANAGEMENT ---
    // Stores the ID of the open modal (null if none)
    activeModal: null, // e.g., 'EXPORT_SETTINGS' | 'PROJECT_RENAME' | 'SHORTCUTS_HELP'
    
    // --- GLOBAL NOTIFICATION (TOAST) ---
    notification: {
        isOpen: false,
        message: '',
        type: 'info', // 'info' | 'success' | 'error' | 'warning'
    },

    // --- ACTIONS ---

    // Sidebar Toggles
    toggleLeftSidebar: () => set((state) => ({ 
        leftSidebarOpen: !state.leftSidebarOpen 
    })),

    toggleRightSidebar: () => set((state) => ({ 
        rightSidebarOpen: !state.rightSidebarOpen 
    })),

    // Editor Navigation
    setActiveEditorTab: (tab) => set({ 
        activeEditorTab: tab 
    }),

    // Modal Controls
    openModal: (modalId) => set({ 
        activeModal: modalId 
    }),

    closeModal: () => set({ 
        activeModal: null 
    }),

    /**
     * showNotification: Triggers a global toast alert.
     * @param {string} message - The text to display
     * @param {string} type - The visual style of the alert
     */
    showNotification: (message, type = 'info') => {
        set({ notification: { isOpen: true, message, type } });
        
        // Automatically hide the toast after 3.5 seconds
        setTimeout(() => {
            set((state) => ({ 
                notification: { ...state.notification, isOpen: false } 
            }));
        }, 3500);
    },

    hideNotification: () => set((state) => ({ 
        notification: { ...state.notification, isOpen: false } 
    }))
}));