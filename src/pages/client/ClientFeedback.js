import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  message,
  Typography,
  Space,
  Divider,
  Card,
} from "antd";
import axios from "axios";
import FeedbackVisualCard from "../../components/FeedbackVisualCard";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function ClientFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [responseInputs, setResponseInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/client/feedback", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(res.data);

      const initialInputs = {};
      res.data.forEach((f) => {
        initialInputs[f._id] = {
          finalDecision: f.finalDecision || "",
          finalMessage: f.finalMessage || "",
          interviewDate: f.interviewDate || "",
          type: f.interviewType || "",
          interviewDetails: f.interviewDetails || "",
        };
      });
      setResponseInputs(initialInputs);
    } catch (error) {
      console.error("❌ Failed to fetch feedbacks:", error);
      message.error("Error fetching feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (id, field, value) => {
    setResponseInputs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (id, status) => {
    const { interviewDate, type, interviewDetails } = responseInputs[id] || {};

    if (
      status === "accepted" &&
      (!interviewDate || !type || !interviewDetails)
    ) {
      return message.warning("Please fill date, type and interview details.");
    }

    try {
      await axios.post(
        `/api/client/respond-feedback`,
        {
          feedbackId: id,
          status,
          interviewDate,
          interviewType: type,
          interviewDetails,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success(`Feedback ${status}`);
      fetchFeedbacks();
    } catch (err) {
      console.error("❌ Failed to update feedback:", err);
      message.error("Error updating feedback.");
    }
  };

  const submitFinalDecision = async (id) => {
    const decision = responseInputs[id]?.finalDecision;
    const finalMessage = responseInputs[id]?.finalMessage || "";

    if (!decision) return message.warning("Please select a final decision");

    try {
      await axios.patch(
        `/api/client/final-decision/${id}`,
        { status: decision, message: finalMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("✅ Final decision submitted.");
      fetchFeedbacks();
    } catch (err) {
      console.error("❌ Final decision error:", err);
      message.error("Failed to submit final decision.");
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
      title: "Job",
      dataIndex: "jobTitle",
      key: "jobTitle",
    },
    {
      title: "Score",
      dataIndex: "matchScore",
      key: "matchScore",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        !status || status === "pending"
          ? "⏳ Pending"
          : status === "accepted"
          ? "✅ Accepted"
          : "❌ Rejected",
    },
    {
      title: "Action",
      key: "action",
      render: (_, item) =>
        !item.status || item.status === "pending" ? (
          <span style={{ color: "#fa8c16" }}>Awaiting Response</span>
        ) : (
          <span>{item.status === "accepted" ? "✅ Accepted" : "❌ Rejected"}</span>
        ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>🧠 AI Analyzed Candidates – Review & Respond</Title>
      <p>Review analyzed candidates, schedule interviews, and send your final decision to recruiters.</p>

      <Table
        columns={columns}
        dataSource={feedbacks}
        loading={loading}
        rowKey="_id"
        expandable={{
          expandedRowRender: (record) => (
            <Card style={{ background: "#f9f9f9", margin: "10px 0" }}>
              <Title level={5}>📋 Feedback Summary – {record.candidateName}</Title>
              <FeedbackVisualCard feedback={record} />

              {!record.status || record.status === "pending" ? (
                <div style={{ marginTop: 24 }}>
                  <Divider orientation="left">📅 Interview Scheduling</Divider>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <DatePicker
                      placeholder="Interview Date"
                      style={{ width: 300 }}
                      onChange={(date, dateStr) =>
                        handleResponseChange(record._id, "interviewDate", dateStr)
                      }
                    />
                    <Input
                      placeholder="Interview Type (e.g. Zoom)"
                      value={responseInputs[record._id]?.type}
                      onChange={(e) =>
                        handleResponseChange(record._id, "type", e.target.value)
                      }
                    />
                    <TextArea
                      rows={3}
                      placeholder="Interview Details (e.g. Zoom link, meeting location)"
                      value={responseInputs[record._id]?.interviewDetails}
                      onChange={(e) =>
                        handleResponseChange(record._id, "interviewDetails", e.target.value)
                      }
                    />
                    <Space>
                      <Button
                        type="primary"
                        onClick={() => handleSubmit(record._id, "accepted")}
                      >
                        ✅ Accept & Schedule
                      </Button>
                      <Button
                        danger
                        onClick={() => handleSubmit(record._id, "rejected")}
                      >
                        ❌ Reject
                      </Button>
                    </Space>
                  </Space>
                </div>
              ) : record.finalDecision ? (
                <div style={{ marginTop: 24 }}>
                  <Divider orientation="left">📌 Final Decision</Divider>
                  <p><strong>Decision:</strong> {record.finalDecision === "confirmed" ? "✅ Confirmed" : "❌ Rejected"}</p>
                  <p><strong>Message:</strong> {record.finalMessage || "No message provided."}</p>
                </div>
              ) : (
                <div style={{ marginTop: 24 }}>
                  <Divider orientation="left">📌 Final Decision</Divider>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Select
                      placeholder="Select final decision"
                      style={{ width: 250 }}
                      value={responseInputs[record._id]?.finalDecision}
                      onChange={(val) =>
                        handleResponseChange(record._id, "finalDecision", val)
                      }
                    >
                      <Option value="confirmed">✅ Confirmed</Option>
                      <Option value="rejected">❌ Rejected</Option>
                    </Select>
                    <TextArea
                      rows={3}
                      placeholder="Message to recruiter"
                      value={responseInputs[record._id]?.finalMessage}
                      onChange={(e) =>
                        handleResponseChange(record._id, "finalMessage", e.target.value)
                      }
                    />
                    <Button
                      type="primary"
                      onClick={() => submitFinalDecision(record._id)}
                    >
                      Submit Final Decision
                    </Button>
                  </Space>
                </div>
              )}
            </Card>
          ),
        }}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}
