import React, { useEffect, useState } from "react";
import axios from "axios";
import { List, Card, Typography, Result } from "antd";

const { Title, Text } = Typography;

export default function CandidateFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/candidate/feedback", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const visibleFeedbacks = res.data.filter(
          (f) => f.sentFinalFeedbackToCandidate
        );
        setFeedbacks(visibleFeedbacks);
      } catch (err) {
        console.error("❌ Failed to fetch candidate feedback:", err);
      }
    };

    fetchFeedback();
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3}>📩 Interview Feedback</Title>

      {feedbacks.length === 0 ? (
        <Result
          status="info"
          title="No feedback yet"
          subTitle="Once a client confirms your interview decision, feedback will appear here."
        />
      ) : (
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={feedbacks}
          renderItem={(item) => (
            <List.Item>
              <Card
                title={
                  <>
                    <Text strong>Job Title:</Text> {item.jobTitle || "N/A"}
                    <br />
                    <Text strong>Client:</Text> {item.clientName || "Unknown Client"}
                  </>
                }
                bordered
              >
                <p>
                  <Text strong>Status:</Text>{" "}
                  {item.status === "accepted"
                    ? "✅ Accepted"
                    : item.status === "rejected"
                    ? "❌ Rejected"
                    : "⏳ Pending"}
                </p>

                {item.finalDecision && item.sentFinalFeedbackToCandidate && (
                  <div
                    style={{
                      marginTop: "10px",
                      background: "#fafafa",
                      padding: "12px",
                      borderRadius: "6px",
                    }}
                  >
                    <p>
                      <Text strong>🎯 Final Decision:</Text>{" "}
                      {item.finalDecision === "confirmed"
                        ? "✅ Selected"
                        : "❌ Not Selected"}
                    </p>
                    <p>
                      <Text strong>📝 Message from Client:</Text>{" "}
                      {item.finalMessage || "No message provided."}
                    </p>
                  </div>
                )}
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
