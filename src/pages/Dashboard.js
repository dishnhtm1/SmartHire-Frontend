// src/pages/Dashboard.js
import React from "react";
import { Typography, Result } from "antd";
import CandidateDashboard from "./Candidate/CandidateDashboard";
import RecruiterDashboard from "./recruiter/RecruiterDashboard";
import ClientDashboard from "./client/ClientDashboard";
import AdminDashboard from "./AdminDashboard";

const { Paragraph } = Typography;

export default function Dashboard() {
  let user = null;

  try {
    const userData = localStorage.getItem("user");
    user = userData ? JSON.parse(userData) : null;
  } catch (err) {
    console.error("❌ Invalid user JSON:", err);
    localStorage.removeItem("user");
  }

  if (!user) {
    return (
      <Result
        status="403"
        title="Please Login"
        subTitle="You must be logged in to view your dashboard."
      />
    );
  }

  const previewRole = localStorage.getItem("previewRole");
  const role = previewRole || user.role;

  switch (role) {
    case "candidate":
      return <CandidateDashboard />;
    case "recruiter":
      return <RecruiterDashboard />;
    case "client":
      return <ClientDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return (
        <Result
          status="warning"
          title="Unknown Role"
          subTitle={
            <Paragraph>
              We couldn't detect a valid user role. Please contact support.
            </Paragraph>
          }
        />
      );
  }
}
