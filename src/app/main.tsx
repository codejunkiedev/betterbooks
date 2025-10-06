import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "@/shared/services/supabase/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/shared/components/Toaster";
import { Provider } from "react-redux";
import { store } from "@/shared/services/store";
import React from "react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
