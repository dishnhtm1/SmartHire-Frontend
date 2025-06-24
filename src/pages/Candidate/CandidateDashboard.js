// ✅ CANDIDATE DASHBOARD PAGE (Frontend with Ant Design)
// File: src/pages/candidate/CandidateDashboard.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Tabs, List, Typography, Spin, message } from "antd";
import { UserOutlined, CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";


const { TabPane } = Tabs;
const { Title, Paragraph } = Typography;

export default function CandidateDashboard() {
  const [user, setUser] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [finalFeedbacks, setFinalFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const userRes = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        const intRes = await axios.get("/api/candidate/interviews", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInterviews(intRes.data);

        const fbRes = await axios.get("/api/candidate/feedback", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filtered = fbRes.data.filter(f => f.sentFinalFeedbackToCandidate);
        setFinalFeedbacks(filtered);

        setLoading(false);
      } catch (err) {
        console.error("Dashboard load error:", err);
        message.error("Failed to load dashboard data.");
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>🎓 Candidate Dashboard</Title>

      {user && (
        <Card title="👤 Profile" style={{ marginBottom: 24 }}>
          <p><UserOutlined /> <strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.emailOrPhone}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </Card>
      )}

      <Tabs defaultActiveKey="1">
        <TabPane
          tab={<span><CalendarOutlined /> Interview Schedule</span>}
          key="1"
        >
          {interviews.length === 0 ? (
            <Paragraph>No scheduled interviews yet.</Paragraph>
          ) : (
            <List
              bordered
              dataSource={interviews}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={<strong>{item.jobTitle}</strong>}
                    description={<>
                      <p>👤 Client: {item.clientName}</p>
                      <p>📅 Date: {new Date(item.interviewDate).toLocaleDateString()}</p>
                    </>}
                  />
                </List.Item>
              )}
            />
          )}
        </TabPane>

        <TabPane
          tab={<span><CheckCircleOutlined /> Final Feedback</span>}
          key="2"
        >
          {finalFeedbacks.length === 0 ? (
            <Paragraph>No final decisions received yet.</Paragraph>
          ) : (
            <List
              bordered
              dataSource={finalFeedbacks}
              renderItem={fb => (
                <List.Item>
                  <List.Item.Meta
                    title={<strong>{fb.jobTitle}</strong>}
                    description={<>
                      <p>🎯 Decision: {fb.finalDecision === "confirmed" ? "✅ Selected" : "❌ Not Selected"}</p>
                      <p>📝 Message: {fb.finalMessage || "No message provided."}</p>
                    </>}
                  />
                </List.Item>
              )}
            />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
}
