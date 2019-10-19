import ReactDOM from "@hot-loader/react-dom";
import { AppContainer } from 'react-hot-loader';

const render = () => {
  const App = require("__webpack_entry__").default;
  ReactDOM.render(
    do { AppContainer >> App }, 
    document.getElementById("react-root")
  );
} 

window.addEventListener("load", render);

if(module.hot)
  module.hot.accept(
    require.resolve("__webpack_entry__"), 
    render
  );