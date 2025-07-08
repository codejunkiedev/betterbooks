import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Session, User } from '@supabase/supabase-js';

interface UserState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  session: null,
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

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
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer; 