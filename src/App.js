// src/App.js
import React from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Layout from "./layout/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import "antd/dist/reset.css";
import CandidateInterviews from "./pages/Candidate/CandidateInterviews";
import CandidateFeedback from "./pages/Candidate/CandidateFeedback";
import ClientJobRequests from "./pages/client/ClientJobRequests";
import ClientFeedback from "./pages/client/ClientFeedback";
import ClientDashboard from "./pages/client/ClientDashboard";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import ManageCandidates from "./pages/recruiter/ManageCandidates";
import AssignedJobs from "./pages/recruiter/AssignedJobs";
import ScheduleInterviews from "./pages/recruiter/ScheduleInterviews";
import ReviewFeedback from "./pages/recruiter/ReviewFeedback";
import CandidateUpload from "./pages/Candidate/CandidateUpload";
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const user = JSON.parse(localStorage.getItem("user"));
  const previewRole = localStorage.getItem("previewRole");
  const role = previewRole || user?.role;

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected + nested layout */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route
                path="/dashboard/admin"
                element={role === "admin" ? <AdminDashboard /> : <h2>Unauthorized</h2>}
          />

          <Route path="interviews" element={<CandidateInterviews />} />
          <Route path="feedback" element={<CandidateFeedback />} />
          <Route path="client" element={<ClientDashboard />} />
          
          <Route path="client-jobs" element={<ClientJobRequests />} />
          <Route path="client-feedback" element={<ClientFeedback />} />
          <Route path="recruiter" element={<RecruiterDashboard />} />
          <Route path="manage-candidates" element={<ManageCandidates />} />
          <Route path="assigned-jobs" element={<AssignedJobs />} />
          <Route path="schedule-interviews" element={<ScheduleInterviews />} />
          <Route path="review-feedback" element={<ReviewFeedback />} />
          <Route path="candidate/upload" element={<CandidateUpload />} />
          
        </Route>
      </Routes>
    </Router>
  );
}


export default App;
