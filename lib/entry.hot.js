import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from 'react-hot-loader';

const render = () => {
  const App = require("__webpack_entry__").default;
  ReactDOM.render(
    <AppContainer>
      <App />
    </AppContainer>, 
    document.getElementById(REACT_ROOT)
  );
} 

window.addEventListener("load", render);

if(module.hot)
  module.hot.accept(
    require.resolve("__webpack_entry__"), 
    render
  );