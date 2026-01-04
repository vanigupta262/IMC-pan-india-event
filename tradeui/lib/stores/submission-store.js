import { create } from 'zustand';
import { submissionsApi } from '../api-client';

export const useSubmissionStore = create((set, get) => ({
    submissions: [],
    activeSubmission: null,
    isLoading: false,
    error: null,

    fetchSubmissions: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await submissionsApi.getAll();
            const submissions = response.data || [];

            const active = submissions.find((s) => s.isActive) || null;

            set({
                submissions,
                activeSubmission: active,
                isLoading: false
            });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    createSubmission: async (code, language = 'cpp') => {
        set({ isLoading: true, error: null });
        try {
            const response = await submissionsApi.create(code, language);
            const newSubmission = response.data;

            set((state) => ({
                submissions: [newSubmission, ...state.submissions],
                isLoading: false,
            }));

            return { success: true, submission: newSubmission };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    activateSubmission: async (submissionId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await submissionsApi.activate(submissionId);

            // Update local state
            set((state) => {
                const updatedSubmissions = state.submissions.map((s) => ({
                    ...s,
                    isActive: s.id === submissionId,
                }));

                const activeSubmission = updatedSubmissions.find((s) => s.id === submissionId) || null;

                return {
                    submissions: updatedSubmissions,
                    activeSubmission,
                    isLoading: false,
                };
            });

            return { success: true };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    clearSubmissions: () => {
        set({ submissions: [], activeSubmission: null, error: null });
    },
}));
