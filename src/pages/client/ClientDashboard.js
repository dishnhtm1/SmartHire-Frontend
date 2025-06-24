import React from "react";
import { Card, Col, Row, Statistic, Table, Typography } from "antd";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  MessageOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

export default function ClientDashboard() {
  const jobStats = [
    { title: "Total Job Requests", value: 12, icon: <FileTextOutlined /> },
    { title: "Pending Interviews", value: 5, icon: <ClockCircleOutlined /> },
    { title: "Feedback Submitted", value: 8, icon: <MessageOutlined /> },
  ];

  const columns = [
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Candidates",
      dataIndex: "candidates",
      key: "candidates",
    },
  ];

  const jobData = [
    {
      key: "1",
      position: "Frontend Developer",
      status: "Open",
      candidates: 6,
    },
    {
      key: "2",
      position: "Data Analyst",
      status: "Interviewing",
      candidates: 3,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>📊 Client Dashboard</Title>

      {/* Metrics Section */}
      <Row gutter={16}>
        {jobStats.map((item, index) => (
          <Col span={8} key={index}>
            <Card>
              <Statistic
                title={
                  <span>
                    {item.icon} {item.title}
                  </span>
                }
                value={item.value}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Table Section */}
      <Card title="📁 Recent Job Submissions" style={{ marginTop: 24 }}>
        <Table columns={columns} dataSource={jobData} pagination={false} />
      </Card>
    </div>
  );
}
