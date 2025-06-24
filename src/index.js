import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { ConfigProvider } from "antd";
 // Required for AntD v5
import "./styles/global.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ConfigProvider theme={{}}>
    <App />
  </ConfigProvider>
);
