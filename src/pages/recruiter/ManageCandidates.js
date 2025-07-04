// [IMPORTS]
import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import {
  Table,
  Select,
  Button,
  Modal,
  Typography,
  message,
  Input,
  Card,
} from "antd";
import FeedbackVisualCard from "../../components/FeedbackVisualCard";
import "../../styles/recruiter.css";

const { Option } = Select;
const { Paragraph } = Typography;

// [COMPONENT]
export default function ManageCandidates() {
  const [uploads, setUploads] = useState([]);
  const [clients, setClients] = useState([]);
  const [jobsByClient, setJobsByClient] = useState({});
  const [selectedClients, setSelectedClients] = useState({});
  const [selectedJobs, setSelectedJobs] = useState({});
  const [previewModal, setPreviewModal] = useState({ visible: false, data: null });
  const [previews, setPreviews] = useState({});
  const [topNResults, setTopNResults] = useState([]);
  const [customTopN, setCustomTopN] = useState(3);
  const [selectedClientForBulk, setSelectedClientForBulk] = useState(null);
  const [selectedJobForBulk, setSelectedJobForBulk] = useState(null);

  const token = localStorage.getItem("token");

  const fetchClients = async () => {
    const res = await axios.get("/api/admin/clients", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setClients(res.data);
  };

  const fetchUploads = async () => {
    const res = await axios.get("https://smarthire-backend-c7cvfhfyd5caeph3.japanwest-01.azurewebsites.net/api/recruiter/uploads", {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("📦 Uploads response:", res.data);

    if (!Array.isArray(res.data)) {
      console.error("❌ Expected array but got:", res.data);
      message.error("Uploads fetch failed – invalid format.");
      return;
    }

    setUploads(res.data);

    const preselected = {};
    res.data.forEach((item) => {
      if (item.clientId) {
        preselected[item._id] = item.clientId._id;
      }
    });
    setSelectedClients(preselected);
  };

  const fetchJobsForClient = async (clientId) => {
    const res = await axios.get(`/api/recruiter/client-jobs/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setJobsByClient((prev) => ({ ...prev, [clientId]: res.data }));
  };

  const handleAnalyze = async (item) => {
    const clientId = selectedClients[item._id] || item.clientId?._id;
    const jobId = selectedJobs[item._id];
    if (!clientId || !jobId) return message.warning("Select client and job.");

    const job = jobsByClient[clientId]?.find((j) => j._id === jobId);
    const res = await axios.post("/api/recruiter/analyze-summary", {
      cvPath: item.cv,
      linkedinText: item.linkedin,
      jobTitle: job.title,
      jobId: job._id,
      candidateEmail: item.user?.email,
      jobDescription: job.description,
    }, { headers: { Authorization: `Bearer ${token}` } });

    const ai = res.data;
    const data = {
      summary: ai.summary,
      matchScore: ai.matchScore,
      skills: ai.skills,
      positives: ai.positives,
      negatives: ai.negatives,
      recommendations: ai.recommendations,
      jobId: job._id,
      jobTitle: job.title,
      candidateId: item._id,
      clientId,
      candidateEmail: item.user?.email,
      candidateName: item.user?.email?.split("@")[0] || "Candidate"
    };

    setPreviews((prev) => ({ ...prev, [item._id]: data }));
    setPreviewModal({ visible: true, data });
  };

  const handleSubmitFeedback = async (candidateId) => {
    const data = previews[candidateId];
    if (!data) return;

    await axios.post("/api/recruiter/save-feedback", data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    message.success("✅ Feedback submitted.");
    setPreviews((prev) => {
      const updated = { ...prev };
      delete updated[candidateId];
      return updated;
    });
    fetchUploads();
  };

  const handleSendAllFeedbacks = async () => {
    if (topNResults.length === 0) {
      return message.warning("No analyzed candidates.");
    }

    try {
      const feedbacks = topNResults.map((item) => ({
        candidateEmail: item.candidateEmail,
        candidateName: item.candidateName,
        summary: item.summary,
        matchScore: item.matchScore,
        skills: item.skills || {},
        positives: item.positives || [],
        negatives: item.negatives || [],
        recommendations: item.recommendations || [],
        clientId: item.clientId,
        jobId: item.jobId,
        jobTitle: item.jobTitle,
      }));

      await axios.post("/api/recruiter/save-bulk-feedback", { feedbacks }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success("✅ All feedbacks submitted.");
      setTopNResults([]);
      setPreviews({});
      fetchUploads();
    } catch (err) {
      console.error("❌ Bulk feedback save failed:", err);
      message.error("❌ Failed to submit bulk feedback.");
    }
  };

  const handleBulkAnalyze = async () => {
    if (!selectedClientForBulk || !selectedJobForBulk) {
      return message.warning("Select both client and job for bulk analysis.");
    }

    try {
      const res = await axios.post("/api/recruiter/analyze-top-candidates", {
        clientId: selectedClientForBulk,
        jobId: selectedJobForBulk,
        topN: customTopN,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const bulkPreviews = {};
      res.data.forEach((item) => {
        bulkPreviews[item.candidateId] = {
          ...item,
          candidateName: item.candidateEmail?.split("@")[0] || "Candidate"
        };
      });

      setPreviews(prev => ({
        ...prev,
        ...bulkPreviews
      }));

      setTopNResults(res.data);

      const firstCandidateId = res.data[0]?.candidateId;
      if (firstCandidateId) {
        setPreviewModal({
          visible: true,
          data: bulkPreviews[firstCandidateId],
          allIds: res.data.map(item => item.candidateId),
          currentIndex: 0
        });
      }

      message.success("✅ Bulk analysis completed.");
    } catch (err) {
      console.error("❌ Bulk analysis error:", err);
      message.error("Bulk analysis failed.");
    }
  };

  useEffect(() => {
    fetchClients();
    fetchUploads();
  }, []);

  useEffect(() => {
    uploads.forEach((item) => {
      const cid = item.clientId?._id;
      if (cid && !jobsByClient[cid]) fetchJobsForClient(cid);
    });
  }, [uploads]);

console.log("🧪 previews:", previews);
console.log("🧪 Object.values(previews):", Object.values(previews));
console.log("🧪 Valid Preview Keys:", Object.keys(previews));
console.log("🧪 Filtered Previews:", Object.values(previews).filter(p => p && p.candidateId));

  return (
    <>
      <h2>📄 Manage Candidates</h2>

      <div style={{ marginBottom: 20 }}>
        <Select
          placeholder="Client"
          style={{ width: 200, marginRight: 10 }}
          onChange={(val) => {
            setSelectedClientForBulk(val);
            fetchJobsForClient(val);
            setSelectedJobForBulk(null);
          }}
        >
          {clients.map((c) => (
            <Option key={c._id} value={c._id}>{c.email}</Option>
          ))}
        </Select>

        <Select
          placeholder="Job"
          style={{ width: 200, marginRight: 10 }}
          value={selectedJobForBulk}
          onChange={setSelectedJobForBulk}
        >
          {(jobsByClient[selectedClientForBulk] || []).map((j) => (
            <Option key={j._id} value={j._id}>{j.title}</Option>
          ))}
        </Select>

        <Input
          type="number"
          min={1}
          value={customTopN}
          onChange={(e) => setCustomTopN(Number(e.target.value))}
          style={{ width: 100, marginRight: 10 }}
        />

        <Button type="primary" onClick={handleBulkAnalyze}>
          🎯 Bulk Analyze Top {customTopN}
        </Button>

        <Button
          type="default"
          onClick={handleSendAllFeedbacks}
          disabled={topNResults.length === 0}
          style={{ marginLeft: 10 }}
        >
          📨 Submit All AI Feedbacks
        </Button>
      </div>

      <Table
        rowKey="_id"
        dataSource={uploads}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />
      {previews &&
        typeof previews === "object" &&
        Object.keys(previews).length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h3>🧠 Bulk AI Feedback Previews</h3>

            {Object.values(previews)
              .filter(
                (feedback) =>
                  feedback &&
                  typeof feedback === "object" &&
                  !Array.isArray(feedback) &&
                  feedback.candidateId
              )
              .map((feedback) => (
                <Card
                  key={feedback.candidateId}
                  title={`🧾 ${feedback.candidateName} – ${feedback.jobTitle}`}
                  style={{ marginBottom: 20 }}
                  extra={
                    <Button
                      type="primary"
                      onClick={() => handleSubmitFeedback(feedback.candidateId)}
                    >
                      ✅ Confirm & Send
                    </Button>
                  }
                >
                  <Paragraph>
                    <strong>Score:</strong> {feedback.matchScore}
                  </Paragraph>
                  <FeedbackVisualCard feedback={feedback} />
                </Card>
              ))}
          </div>
      )}







      <Modal
      title={`🧾 AI Feedback Preview – ${previewModal.data?.candidateName}`}
      visible={previewModal.visible}
      onCancel={() => setPreviewModal({ visible: false, data: null })}
      onOk={() => {
        handleSubmitFeedback(previewModal.data.candidateId);
        setPreviewModal({ visible: false, data: null });
      }}
      okText="✅ Confirm & Send"
      footer={[
        <Button
          key="prev"
            onClick={() => {
              const newIndex = (previewModal.currentIndex - 1 + previewModal.allIds.length) % previewModal.allIds.length;
              const newId = previewModal.allIds[newIndex];
              setPreviewModal((prev) => ({
                ...prev,
                currentIndex: newIndex,
                data: previews[newId],
              }));
            }}
            disabled={!previewModal.allIds || previewModal.allIds.length < 2}
          >
            ⬅ Previous
        </Button>,
        <Button
          key="next"
            onClick={() => {
              const newIndex = (previewModal.currentIndex + 1) % previewModal.allIds.length;
              const newId = previewModal.allIds[newIndex];
              setPreviewModal((prev) => ({
                ...prev,
                currentIndex: newIndex,
                data: previews[newId],
              }));
            }}
            disabled={!previewModal.allIds || previewModal.allIds.length < 2}
          >
            Next ➡
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => {
            handleSubmitFeedback(previewModal.data.candidateId);
            setPreviewModal({ visible: false, data: null });
          }}
        >
          ✅ Confirm & Send
        </Button>,
      ]}
      width={800}
    >
      {previewModal.data && (
        <>
          <Paragraph><strong>Candidate:</strong> {previewModal.data.candidateName}</Paragraph>
          <Paragraph><strong>Job:</strong> {previewModal.data.jobTitle}</Paragraph>
          <Paragraph><strong>Score:</strong> {previewModal.data.matchScore}</Paragraph>
          <FeedbackVisualCard feedback={previewModal.data} />
        </>
      )}
    </Modal>

    </>
  );
}
