import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Typography, Layout, message, Tag } from "antd";
import { PushpinOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Content } = Layout;

export default function AssignedJobs() {
  const [jobs, setJobs] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAssignedJobs = async () => {
      try {
        const res = await axios.get("/api/recruiter/assigned-jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJobs(res.data);
      } catch (err) {
        console.error("Error fetching assigned jobs:", err);
        message.error("Failed to load assigned job requests.");
      }
    };

    fetchAssignedJobs();
  }, [token]);

  const columns = [
    {
      title: "Position",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Client",
      dataIndex: ["client", "email"],
      key: "client",
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      render: (text) => text ? new Date(text).toLocaleDateString() : "-",
    },
    {
      title: "Candidates",
      dataIndex: "candidateCount",
      key: "candidateCount",
      render: (count) => count > 0 ? <Tag color="blue">{count}</Tag> : "-",
    },
  ];

  return (
    <Content style={{ padding: "24px", minHeight: "100vh", background: "#fff" }}>
      <Title level={3}>
        <PushpinOutlined /> Assigned Job Requests
      </Title>
      <Table
        columns={columns}
        dataSource={jobs}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
        bordered
      />
    </Content>
  );
}
