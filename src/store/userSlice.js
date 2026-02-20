import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userData: {},     // User info
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setApiKey: (state, action) => {
      state.apiKey = action.payload;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    clearUser: (state) => {
      state.apiKey = '';
      state.userData = {};
    },
  },
});

export const { setApiKey, setUserData, clearUser } = userSlice.actions;
export default userSlice.reducer;