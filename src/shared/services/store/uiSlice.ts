import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
    isLoading: boolean;
    loadingMessage: string | null;
    isModalOpen: boolean;
    modalTitle: string | null;
    modalContent: string | null;
    toastMessage: string | null;
    toastType: 'success' | 'error' | 'info' | 'warning' | null;
}

const initialState: UiState = {
    isLoading: false,
    loadingMessage: null,
    isModalOpen: false,
    modalTitle: null,
    modalContent: null,
    toastMessage: null,
    toastType: null,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
            if (!action.payload) {
                state.loadingMessage = null;
            }
        },
        setLoadingMessage: (state, action: PayloadAction<string | null>) => {
            state.loadingMessage = action.payload;
        },
        setLoadingWithMessage: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
            state.isLoading = action.payload.isLoading;
            state.loadingMessage = action.payload.message || null;
        },
        openModal: (state, action: PayloadAction<{ title: string; content: string }>) => {
            state.isModalOpen = true;
            state.modalTitle = action.payload.title;
            state.modalContent = action.payload.content;
        },
        closeModal: (state) => {
            state.isModalOpen = false;
            state.modalTitle = null;
            state.modalContent = null;
        },
        showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' | 'warning' }>) => {
            state.toastMessage = action.payload.message;
            state.toastType = action.payload.type;
        },
        hideToast: (state) => {
            state.toastMessage = null;
            state.toastType = null;
        },
    },
});

export const {
    setLoading,
    setLoadingMessage,
    setLoadingWithMessage,
    openModal,
    closeModal,
    showToast,
    hideToast,
} = uiSlice.actions;

export default uiSlice.reducer; 