import { combineReducers } from 'redux';

import providersReducer from './Providers/providersSlice';

const rootReducer = combineReducers({
  providers: providersReducer,
  // mappings: mappingsReducer,
});

export type IRootState = ReturnType<typeof rootReducer>;

export default rootReducer;
