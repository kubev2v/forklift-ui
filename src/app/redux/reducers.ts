import { combineReducers } from 'redux';

import commonReducer from './common/reducers';

export const rootReducer = combineReducers({
  // providers: providersReducer,
  // mappings: mappingsReducer,
  common: commonReducer,
});

//TODO: Discuss how do we feel about union types/inferring types?
export type IRootState = ReturnType<typeof rootReducer>;
