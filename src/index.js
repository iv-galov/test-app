import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import testApp from './reducers'
import TestApp from './components'

// Main file: create Redux store and connect it with React main component

const store = createStore(testApp);

ReactDOM.render(
  <Provider store={store}>
    <TestApp />
  </Provider>,
  document.getElementById('root')
);
