import React from "react";
import ReactDOM from "react-dom";
import App from "__webpack_entry__";

window.addEventListener("load", () => {
  ReactDOM.render(
    do { App }, 
    document.getElementById(REACT_ROOT)
  );
});