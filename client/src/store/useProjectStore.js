import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { getApiBase } from '../utils/apiConfig';

const authHeaders = () => {
    const token = useAuthStore.getState().token;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// "My Edits" is account-based — saved projects live in the database, not this
// device, so a user sees the same history after logging in anywhere.
export const useProjectStore = create((set, get) => ({
    edits: [],
    currentEditId: null,
    isLoadingEdits: false,

    // Fetches the logged-in user's saved projects for the My Edits grid.
    fetchEdits: async () => {
        if (!useAuthStore.getState().token) {
            set({ edits: [] });
            return;
        }
        set({ isLoadingEdits: true });
        try {
            const res = await fetch(`${getApiBase()}/projects`, { headers: authHeaders() });
            const data = await res.json();
            if (data.success) set({ edits: data.data });
        } catch (error) {
            console.error('[Projects] Failed to fetch edit history:', error);
        } finally {
            set({ isLoadingEdits: false });
        }
    },

    // Saves the current editor session as a new resumable project. Silently
    // no-ops when logged out — editing/exporting still works, it just won't be
    // saved anywhere (matches the app's "login required only to save/resume" rule).
    createProject: async (payload) => {
        if (!useAuthStore.getState().token) return null;
        try {
            const res = await fetch(`${getApiBase()}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!data.success) return null;
            set((state) => ({ edits: [data.data, ...state.edits], currentEditId: data.data._id }));
            return data.data._id;
        } catch (error) {
            console.error('[Projects] Failed to save project:', error);
            return null;
        }
    },

    // Autosave target — updates an existing project's caption/style state.
    // Never re-uploads the video.
    updateProject: async (id, payload) => {
        if (!id || !useAuthStore.getState().token) return;
        try {
            const res = await fetch(`${getApiBase()}/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                set((state) => ({
                    edits: state.edits.map((e) => (e._id === id ? { ...e, ...data.data } : e)),
                }));
            }
        } catch (error) {
            console.error('[Projects] Autosave failed:', error);
        }
    },

    // Fetches one project in full, to resume it in the editor.
    fetchProject: async (id) => {
        if (!useAuthStore.getState().token) return null;
        try {
            const res = await fetch(`${getApiBase()}/projects/${id}`, { headers: authHeaders() });
            const data = await res.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error('[Projects] Failed to load project:', error);
            return null;
        }
    },

    markExported: (id) => {
        get().updateProject(id, { status: 'exported' });
    },

    deleteEdit: async (id) => {
        set((state) => ({
            edits: state.edits.filter((e) => e._id !== id),
            currentEditId: state.currentEditId === id ? null : state.currentEditId,
        }));
        if (!useAuthStore.getState().token) return;
        try {
            await fetch(`${getApiBase()}/projects/${id}`, { method: 'DELETE', headers: authHeaders() });
        } catch (error) {
            console.error('[Projects] Failed to delete project:', error);
        }
    },

    setCurrentEditId: (id) => set({ currentEditId: id }),
}));
