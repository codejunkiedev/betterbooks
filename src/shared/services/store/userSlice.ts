import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Session, User } from '@supabase/supabase-js';

interface UserState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: UserState = {
  session: null,
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isInitialized: false,
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

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User | null; session: Session | null; } | null>) => {
      if (action.payload === null) {
        state.user = null;
        state.session = null;
        state.isAuthenticated = false;
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
      });
  },
});

export const { setUser, setLoading, setError, clearAuth } = userSlice.actions;
export default userSlice.reducer; 