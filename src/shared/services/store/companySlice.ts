import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface Company {
    id: string;
    name: string;
    type: string;
    user_id: string;
    is_active: boolean;
    created_at: string;
}

export interface CompanySetupData {
    company_name: string;
    company_type: string;
    cash_balance: string;
    balance_date: string;
    skip_balance: boolean;
}

interface CompanyState {
    currentCompany: Company | null;
    setupData: CompanySetupData;
    currentStep: number;
    totalSteps: number;
    isLoading: boolean;
    error: string | null;
    isSetupComplete: boolean;
}

const initialSetupData: CompanySetupData = {
    company_name: "",
    company_type: "",
    cash_balance: "",
    balance_date: "",
    skip_balance: false,
};

const initialState: CompanyState = {
    currentCompany: null,
    setupData: initialSetupData,
    currentStep: 1,
    totalSteps: 3,
    isLoading: false,
    error: null,
    isSetupComplete: false,
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

export const createCompanyWithSetup = createAsyncThunk(
    'company/createWithSetup',
    async (setupData: CompanySetupData & { userId: string }, { rejectWithValue }) => {
        try {
            const { createCompany } = await import('@/shared/services/supabase/company');
            const { copyCOATemplateToCompany } = await import('@/shared/services/supabase/coa');

            const companyData = {
                name: setupData.company_name,
                type: setupData.company_type,
                user_id: setupData.userId,
            };

            const company = await createCompany(companyData);

            // Copy COA template
            await copyCOATemplateToCompany(company.id);

            return company;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to create company');
        }
    }
);

const companySlice = createSlice({
    name: 'company',
    initialState,
    reducers: {
        updateSetupField: (state, action: PayloadAction<{ field: keyof CompanySetupData; value: string | boolean }>) => {
            const { field, value } = action.payload;
            if (field === 'skip_balance') {
                state.setupData[field] = value as boolean;
            } else {
                state.setupData[field] = value as string;
            }
            state.error = null;
        },
        skipBalance: (state) => {
            state.setupData.skip_balance = true;
            state.setupData.cash_balance = "";
            state.setupData.balance_date = "";
            state.error = null;
        },
        addBalance: (state) => {
            state.setupData.skip_balance = false;
            state.error = null;
        },
        nextStep: (state) => {
            if (state.currentStep < state.totalSteps) {
                state.currentStep += 1;
            }
        },
        previousStep: (state) => {
            if (state.currentStep > 1) {
                state.currentStep -= 1;
            }
            state.error = null;
        },
        setCurrentStep: (state, action: PayloadAction<number>) => {
            state.currentStep = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetSetup: (state) => {
            state.setupData = initialSetupData;
            state.currentStep = 1;
            state.error = null;
            state.isSetupComplete = false;
        },
        setCurrentCompany: (state, action: PayloadAction<Company | null>) => {
            state.currentCompany = action.payload;
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
            // Create company
            .addCase(createCompanyWithSetup.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createCompanyWithSetup.fulfilled, (state, action) => {
                state.currentCompany = action.payload;
                state.isLoading = false;
                state.error = null;
                state.isSetupComplete = true;
            })
            .addCase(createCompanyWithSetup.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    updateSetupField,
    skipBalance,
    addBalance,
    nextStep,
    previousStep,
    setCurrentStep,
    setError,
    clearError,
    resetSetup,
    setCurrentCompany,
} = companySlice.actions;

export default companySlice.reducer; 