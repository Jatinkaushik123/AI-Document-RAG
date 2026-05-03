import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./styles.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "rgba(10, 14, 26, 0.9)",
          color: "#e5e7eb",
          border: "1px solid rgba(255, 255, 255, 0.12)",
        },
      }}
    />
  </React.StrictMode>,
);
