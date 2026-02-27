import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userData: {},
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    clearUser: (state) => {
      state.userData = {};
    },
  },
});

export const { setApiKey, setUserData, clearUser } = userSlice.actions;
export default userSlice.reducer;