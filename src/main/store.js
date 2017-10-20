import {
    applyMiddleware,
    combineReducers,
    compose,
    createStore
} from 'redux';
import thunk from 'redux-thunk';
import reducers from '../reducers/main';

const composeEnhancers = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
                            ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;

export const createReduxStore = () => {
  const middleware = composeEnhancers(applyMiddleware(thunk));
  const rootReducer = combineReducers(reducers);

  return createStore(rootReducer, middleware);
};
