import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ICommonProvider } from './types';

// interface IProvidersInitialState{}
const providersSlice = createSlice({
  name: 'providers',
  initialState: [],
  reducers: {
    fetchProvidersRequest(state) {
      state.push({ isFetchingProviders: true });
    },
    fetchProvidersSuccess(state, action: PayloadAction<ICommonProvider[]>) {
      // The FSA convention suggests that rather than having data fields
      // with random names directly in the action object,
      // you should always put your data inside a field named payload.
      const providers = action.payload;
      state.push({ providers: providers });
    },
    fetchProvidersFailure(state) {
      state.push({ isFetchingProviders: false });
    },
  },
});

export const { fetchProvidersRequest, fetchProvidersSuccess } = providersSlice.actions;

export default providersSlice.reducer;
