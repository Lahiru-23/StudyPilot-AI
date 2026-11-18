import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';
interface AuthState { user: User | null; isAuthenticated: boolean; }
const initialState: AuthState = { user: null, isAuthenticated: false };
const slice = createSlice({
  name: 'auth', initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<User>) { state.user = action.payload; state.isAuthenticated = true; },
    clearCredentials(state) { state.user = null; state.isAuthenticated = false; }
  }
});
export const { setCredentials, clearCredentials } = slice.actions;
export default slice.reducer;
