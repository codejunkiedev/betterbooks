import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Session, User } from '@supabase/supabase-js';

interface UserState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  userRole: string | null;
  isUserDataLoaded: boolean;
}

const initialState: UserState = {
  session: null,
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isInitialized: false,
  userRole: null,
  isUserDataLoaded: false,
};

// Async thunks for authentication actions
export const initializeAuth = createAsyncThunk(
  'user/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      const { supabase } = await import('@/shared/services/supabase/client');
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      return {
        user: session?.user || null,
        session: session,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to initialize auth');
    }
  }
);

// Centralized data loading for user role and company data
export const loadUserData = createAsyncThunk(
  'user/loadUserData',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      const [{ getUserRoleFromDB }, { checkOnboardingStatus }] = await Promise.all([
        import('@/shared/services/supabase/auth'),
        import('@/shared/services/store/companySlice')
      ]);

      // Load user role and company data in parallel
      const [userRole] = await Promise.all([
        getUserRoleFromDB({ id: userId } as User),
        dispatch(checkOnboardingStatus(userId))
      ]);

      return { userRole };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load user data');
    }
  }
);

// Async thunk for setting up auth state listener
export const setupAuthListener = createAsyncThunk(
  'user/setupAuthListener',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { supabase } = await import('@/shared/services/supabase/client');

      supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_OUT') {
            dispatch(clearAuth());
            // Clear company data when user signs out
            const { clearCompany } = await import('@/shared/services/store/companySlice');
            dispatch(clearCompany());
          } else {
            dispatch(setUser(session ? { user: session.user, session } : null));

            // Load user data when user signs in
            if (session?.user?.id) {
              dispatch(loadUserData(session.user.id));
            }
          }
        }
      );

      return { success: true };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to setup auth listener');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User | null; session: Session | null; } | null>) => {
      if (action.payload === null) {
        state.user = null;
        state.session = null;
        state.isAuthenticated = false;
        state.userRole = null;
        state.isUserDataLoaded = false;
      } else {
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.isAuthenticated = !!action.payload.session;
      }
      state.error = null;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearAuth: (state) => {
      state.user = null;
      state.session = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      state.userRole = null;
      state.isUserDataLoaded = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.isAuthenticated = !!action.payload.session;
        state.loading = false;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isInitialized = true;
      })
      .addCase(loadUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserData.fulfilled, (state, action) => {
        state.userRole = action.payload.userRole;
        state.isUserDataLoaded = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(loadUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isUserDataLoaded = true;
      })
      .addCase(setupAuthListener.fulfilled, (state) => {
        // Auth listener is set up successfully
        state.error = null;
      })
      .addCase(setupAuthListener.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setLoading, setError, clearAuth } = userSlice.actions;
export default userSlice.reducer; 