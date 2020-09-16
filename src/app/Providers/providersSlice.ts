import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ICommonProvider } from './types';

// interface IProvidersInitialState{}
// type SliceState = { state: 'loading' } | { state: 'finished'; data: string }
// const initialState: SliceState = { state: 'loading' }

type IProvidersInitialState = {
  providers: ICommonProvider[];
  isFetchingProviders: boolean;
};

const initialState: IProvidersInitialState = {
  providers: [],
  isFetchingProviders: false,
};
const providersSlice = createSlice({
  name: 'providers',
  initialState,
  //   initialState: [{ isFetchingProviders: false }, { providers: [] }],
  reducers: {
    fetchProvidersRequest(state) {
      state.isFetchingProviders = true;
    },
    fetchProvidersSuccess(state, action: PayloadAction<ICommonProvider[]>) {
      // The FSA convention suggests that rather than having data fields
      // with random names directly in the action object,
      // you should always put your data inside a field named payload.
      const providers = action.payload;
      state.providers = providers;
    },
    fetchProvidersFailure(state) {
      state.isFetchingProviders = false;
    },
  },
});

export const { fetchProvidersRequest, fetchProvidersSuccess } = providersSlice.actions;

export default providersSlice.reducer;
