import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProjectStore = create(
    persist(
        (set) => ({
            edits: [],
            currentEditId: null,

            // Called when a video is successfully uploaded & transcribed
            addEdit: (videoName) => {
                const newEdit = {
                    id: Math.random().toString(36).substr(2, 9),
                    videoName: videoName || 'Untitled Video',
                    preset: null,
                    startedAt: new Date().toISOString(),
                    lastEditedAt: new Date().toISOString(),
                    status: 'editing',
                };
                set((state) => ({
                    edits: [newEdit, ...state.edits],
                    currentEditId: newEdit.id,
                }));
                return newEdit.id;
            },

            // Called when a preset is applied in the editor
            updateEditPreset: (id, presetId) => {
                if (!id) return;
                set((state) => ({
                    edits: state.edits.map(e =>
                        e.id === id
                            ? { ...e, preset: presetId, lastEditedAt: new Date().toISOString() }
                            : e
                    ),
                }));
            },

            // Called when the video is exported
            markExported: (id) => {
                if (!id) return;
                set((state) => ({
                    edits: state.edits.map(e =>
                        e.id === id
                            ? { ...e, status: 'exported', lastEditedAt: new Date().toISOString() }
                            : e
                    ),
                }));
            },

            deleteEdit: (id) => {
                set((state) => ({
                    edits: state.edits.filter(e => e.id !== id),
                    currentEditId: state.currentEditId === id ? null : state.currentEditId,
                }));
            },
        }),
        {
            name: 'caption-crow-projects',
        }
    )
);
