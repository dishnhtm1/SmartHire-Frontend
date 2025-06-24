import React, { useEffect, useState } from "react";
import { Card, Col, Row, Typography } from "antd";
import {
  SolutionOutlined,
  UsergroupAddOutlined,
  CalendarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;

export default function RecruiterDashboard() {
  const [stats, setStats] = useState({
    openJobs: 0,
    assignedCandidates: 0,
    clientsCount: 0,
    interviewsThisWeek: 0,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/recruiter/dashboard-stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch dashboard stats:", err);
      }
    };
    fetchStats();
  }, []);

  const metrics = [
    {
      title: " Open Jobs",
      value: stats.openJobs,
      icon: <SolutionOutlined style={{ fontSize: 24 }} />,
    },
    {
      title: " Assigned Candidates",
      value: stats.assignedCandidates,
      icon: <UsergroupAddOutlined style={{ fontSize: 24 }} />,
    },
    {
      title: " Total Clients",
      value: stats.clientsCount,
      icon: <TeamOutlined style={{ fontSize: 24 }} />,
    },
    {
      title: "Interviews This Week",
      value: stats.interviewsThisWeek,
      icon: <CalendarOutlined style={{ fontSize: 24 }} />,
    },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <Title level={3}>👤 Recruiter Dashboard</Title>
      <Row gutter={[16, 16]}>
        {metrics.map((metric, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card
              title={metric.title}
              bordered={false}
              style={{ textAlign: "center", borderRadius: "12px" }}
            >
              <div style={{ fontSize: 36 }}>{metric.value}</div>
              <div style={{ marginTop: 10 }}>{metric.icon}</div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
