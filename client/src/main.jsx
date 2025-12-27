/**
 * Entry point for the React app
 * Nothing fancy here, just the standard Vite + React setup
 */

import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/main.scss";
import App from "./App.jsx";

// Grab the root element and mount our app
const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
