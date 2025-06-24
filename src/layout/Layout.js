// src/layout/Layout.js
import React from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import Navbar from "../components/Navbar";

const { Content } = Layout;

export default function MainLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar/Navbar */}
      <Navbar />

      {/* Main content area */}
      <Layout style={{ background: "#f0f2f5" }}>
        <Content style={{ padding: "24px" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
