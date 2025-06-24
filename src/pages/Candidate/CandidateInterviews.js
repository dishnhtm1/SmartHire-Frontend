// frontend/src/pages/MyInterviewPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Typography, Result } from "antd";

const { Title } = Typography;

export default function MyInterviewPage() {
  const [interviews, setInterviews] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await axios.get("/api/candidate/interviews", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInterviews(res.data);
        console.log("✅ Interview Data:", res.data);
      } catch (err) {
        console.error("❌ Failed to load interviews:", err);
      }
    };

    fetchInterviews();
  }, []);

  const columns = [
    {
      title: "Client",
      dataIndex: "clientName",
      key: "clientName",
      render: (text) => text || "N/A",
    },
    {
      title: "Job",
      dataIndex: "jobTitle",
      key: "jobTitle",
      render: (text) => text || "Unspecified",
    },
    {
      title: "Interview Type",
      dataIndex: "interviewType",
      key: "interviewType",
      render: (text) => text || "-",
    },
    {
      title: "Date",
      dataIndex: "interviewDate",
      key: "interviewDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      title: "Details",
      dataIndex: "interviewDetails",
      key: "interviewDetails",
      render: (text) => text || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status?.toLowerCase() === "accepted"
          ? "✅ Scheduled"
          : status?.toLowerCase() === "rejected"
          ? "❌ Rejected"
          : "⏳ Pending",
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3}>🎯 My Interviews</Title>

      {interviews.length === 0 ? (
        <Result
          status="info"
          title="No interviews scheduled yet"
          subTitle="Once a recruiter or client schedules an interview, you'll see it here."
        />
      ) : (
        <Table
          columns={columns}
          dataSource={interviews}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
          bordered
        />
      )}
    </div>
  );
}
