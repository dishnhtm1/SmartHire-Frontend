import React, { useEffect, useState } from "react";
import '../../styles/recruiter.css';

import axios from "axios";
import {
  Table,
  Button,
  Tag,
  message,
  Typography,
  Space,
  Card
} from "antd";
import {
  SendOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";


const { Title, Paragraph } = Typography;

export default function ReviewFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const token = localStorage.getItem("token");

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get("/api/recruiter/review-feedback", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(res.data);
    } catch (error) {
      console.error("❌ Failed to fetch review feedback:", error);
    }
  };

  const handleSendToCandidate = async (id) => {
    try {
      await axios.post(`/api/recruiter/send-to-candidate/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success("✅ Feedback sent to candidate.");
      fetchFeedbacks();
    } catch (err) {
      console.error("❌ Failed to send feedback:", err);
      message.error("❌ Error sending feedback.");
    }
  };

  const handleSendFinalFeedback = async (id) => {
    try {
      await axios.post(`/api/recruiter/send-final-feedback/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("✅ Final feedback sent.");
      fetchFeedbacks();
    } catch (err) {
      console.error("❌ Failed to send final feedback:", err);
      message.error("❌ Error sending final feedback.");
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const columns = [
    {
      title: "Candidate",
      dataIndex: "candidateName",
      key: "candidateName",
    },
    {
      title: "Client",
      dataIndex: "clientName",
      key: "clientName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: status => {
        if (status === "accepted") return <Tag color="green">Accepted</Tag>;
        if (status === "rejected") return <Tag color="red">Rejected</Tag>;
        return <Tag color="orange">Pending</Tag>;
      }
    },
    {
      title: "Interview Type",
      dataIndex: "interviewType",
      key: "interviewType",
      render: text => text || "-"
    },
    {
      title: "Interview Date",
      dataIndex: "interviewDate",
      key: "interviewDate",
      render: date => date ? new Date(date).toLocaleDateString() : "-"
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => record.status === "accepted" ? (
        record.sentToCandidate ? (
          <Tag icon={<CheckCircleOutlined />} color="green">Sent</Tag>
        ) : (
          <Button icon={<SendOutlined />} type="primary" onClick={() => handleSendToCandidate(record._id)}>
            Submit to Candidate
          </Button>
        )
      ) : "-"
    }
  ];

  return (
    <Card style={{ margin: 20 }}>
      <Title level={3}>📝 Review Client Feedback</Title>
      <Table
        dataSource={feedbacks}
        columns={columns}
        rowKey="_id"
        rowClassName={(record) => {
          if (record.finalDecision === "confirmed") return "row-confirmed";
          if (record.finalDecision === "rejected") return "row-rejected";
          return "";
        }}
        expandable={{
          expandedRowRender: (record) =>
            record.finalDecision && (
              <div style={{ padding: "1rem", backgroundColor: "#f9f9f9" }}>
                <Paragraph>
                  <strong>Client Final Decision:</strong>{" "}
                  {record.finalDecision === "confirmed" ? (
                    <Tag color="green">✅ Confirmed</Tag>
                  ) : (
                    <Tag color="red">❌ Rejected</Tag>
                  )}
                </Paragraph>
                <Paragraph>
                  <strong>Message:</strong> {record.finalMessage || "No message provided."}
                </Paragraph>
                {record.sentFinalFeedbackToCandidate ? (
                  <Tag icon={<CheckCircleOutlined />} color="green">Final feedback sent</Tag>
                ) : (
                  <Button icon={<SendOutlined />} type="default" onClick={() => handleSendFinalFeedback(record._id)}>
                    Submit Final Feedback
                  </Button>
                )}
              </div>
            )
        }}
      />
    </Card>
  );
}
