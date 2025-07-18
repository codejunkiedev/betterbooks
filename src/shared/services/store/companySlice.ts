import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface Company {
    id: string;
    name: string;
    type: string;
    user_id: string;
    is_active: boolean;
    created_at: string;
}

interface CompanyState {
    currentCompany: Company | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: CompanyState = {
    currentCompany: null,
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchCompanyByUserId = createAsyncThunk(
    'company/fetchByUserId',
    async (userId: string, { rejectWithValue }) => {
        try {
            const { getCompanyByUserId } = await import('@/shared/services/supabase/company');
            const company = await getCompanyByUserId(userId);
            return company;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch company');
        }
    }
);

const companySlice = createSlice({
    name: 'company',
    initialState,
    reducers: {
        setCurrentCompany: (state, action: PayloadAction<Company | null>) => {
            state.currentCompany = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch company
            .addCase(fetchCompanyByUserId.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCompanyByUserId.fulfilled, (state, action) => {
                state.currentCompany = action.payload;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(fetchCompanyByUserId.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setCurrentCompany,
    clearError,
} = companySlice.actions;

export default companySlice.reducer; 