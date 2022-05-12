import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Calendar from "./Calendar";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <div className="container">
      <Calendar />
    </div>
  </React.StrictMode>
);
