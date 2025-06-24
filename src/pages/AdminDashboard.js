import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Button,
  Table,
  Space,
  Card,
  Tag,
  message,
} from "antd";

const { Title } = Typography;

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/pending-users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingUsers(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch users", err);
      message.error("Failed to load pending users");
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/admin/approve/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingUsers(pendingUsers.filter(user => user._id !== userId));
      message.success("✅ User approved successfully");
    } catch (err) {
      console.error("❌ Approval failed", err);
      message.error("Approval failed");
    }
  };

  const switchRole = (newRole) => {
    localStorage.setItem("previewRole", newRole);
    window.location.href = "/dashboard";
  };

  const exitPreview = () => {
    localStorage.removeItem("previewRole");
    window.location.href = "/dashboard";
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const columns = [
    {
      title: "Full Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => approveUser(record._id)}>
          Approve
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>🛠️ Admin Dashboard</Title>

      <Card title="🔁 Preview Another Role" style={{ marginBottom: 24 }}>
        <Space>
          {["candidate", "recruiter", "client"].map((role) => (
            <Button key={role} onClick={() => switchRole(role)}>
              View as {role}
            </Button>
          ))}
          <Button onClick={exitPreview} type="dashed">
            Exit Preview
          </Button>
        </Space>
      </Card>

      <Card title="🕒 Pending User Approvals">
        {pendingUsers.length === 0 ? (
          <p>No pending users.</p>
        ) : (
          <Table
            columns={columns}
            dataSource={pendingUsers}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
