import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface Company {
    id: string;
    name: string;
    type: string;
    user_id: string;
    is_active: boolean;
    created_at: string;
}

interface OnboardingStatus {
    hasCompany: boolean;
    hasFbrProfile: boolean;
    isCompleted: boolean;
}

interface CompanyState {
    currentCompany: Company | null;
    onboardingStatus: OnboardingStatus | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: CompanyState = {
    currentCompany: null,
    onboardingStatus: null,
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

export const checkOnboardingStatus = createAsyncThunk(
    'company/checkOnboardingStatus',
    async (userId: string, { rejectWithValue }) => {
        try {
            const [{ getCompanyByUserId }, { getFbrProfileByUser }] = await Promise.all([
                import('@/shared/services/supabase/company'),
                import('@/shared/services/supabase/fbr')
            ]);

            const [company, fbrProfile] = await Promise.all([
                getCompanyByUserId(userId),
                getFbrProfileByUser(userId).catch(() => null)
            ]);

            return {
                company,
                fbrProfile,
                hasCompany: !!company,
                hasFbrProfile: !!fbrProfile,
                isCompleted: !!company && !!fbrProfile
            };
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to check onboarding status');
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
        setOnboardingStatus: (state, action: PayloadAction<OnboardingStatus>) => {
            state.onboardingStatus = action.payload;
        },
        clearOnboardingStatus: (state) => {
            state.onboardingStatus = null;
        },
        clearCompany: (state) => {
            state.currentCompany = null;
            state.onboardingStatus = null;
            state.error = null;
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
            })
            // Check onboarding status
            .addCase(checkOnboardingStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(checkOnboardingStatus.fulfilled, (state, action) => {
                state.currentCompany = action.payload.company;
                state.onboardingStatus = {
                    hasCompany: action.payload.hasCompany,
                    hasFbrProfile: action.payload.hasFbrProfile,
                    isCompleted: action.payload.isCompleted
                };
                state.isLoading = false;
                state.error = null;
            })
            .addCase(checkOnboardingStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setCurrentCompany,
    setOnboardingStatus,
    clearOnboardingStatus,
    clearCompany,
    clearError,
} = companySlice.actions;

export default companySlice.reducer; 