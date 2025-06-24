import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout, Menu, Button, Typography, Divider } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  UploadOutlined,
  ScheduleOutlined,
  UserOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;
const { Title } = Typography;

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const previewRole = localStorage.getItem("previewRole");
  const role = previewRole || user?.role;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("previewRole");
    navigate("/login");
  };

  const menuItems = [];

  if (role === "candidate") {
    menuItems.push(
      {
        key: "candidate-dashboard",
        icon: <DashboardOutlined />,
        label: <Link to="/dashboard">My Dashboard</Link>,
      },
      {
        key: "interviews",
        icon: <ScheduleOutlined />,
        label: <Link to="/dashboard/interviews">My Interviews</Link>,
      },
      {
        key: "feedback",
        icon: <FileTextOutlined />,
        label: <Link to="/dashboard/feedback">Feedback</Link>,
      },
      {
        key: "upload-cv",
        icon: <UploadOutlined />,
        label: <Link to="/dashboard/candidate/upload">Upload CV</Link>,
      }
    );
  }

  if (role === "client") {
    menuItems.push(
      {
        key: "client-dashboard",
        icon: <DashboardOutlined />,
        label: <Link to="/dashboard/client">Client Dashboard</Link>,
      },
      {
        key: "client-jobs",
        icon: <AppstoreOutlined />,
        label: <Link to="/dashboard/client-jobs">My Job Requests</Link>,
      },
      {
        key: "client-feedback",
        icon: <FileTextOutlined />,
        label: <Link to="/dashboard/client-feedback">Feedback</Link>,
      }
    );
  }

  if (role === "recruiter") {
    menuItems.push(
      {
        key: "recruiter-dashboard",
        icon: <DashboardOutlined />,
        label: <Link to="/dashboard/recruiter">Recruiter Dashboard</Link>,
      },
      {
        key: "manage-candidates",
        icon: <TeamOutlined />,
        label: <Link to="/dashboard/manage-candidates">Manage Candidates</Link>,
      },
      {
        key: "assigned-jobs",
        icon: <AppstoreOutlined />,
        label: <Link to="/dashboard/assigned-jobs">Assigned Jobs</Link>,
      },
      {
        key: "schedule-interviews",
        icon: <ScheduleOutlined />,
        label: <Link to="/dashboard/schedule-interviews">Schedule Interviews</Link>,
      },
      {
        key: "review-feedback",
        icon: <CheckCircleOutlined />,
        label: <Link to="/dashboard/review-feedback">Review Feedback</Link>,
      }
    );
  }

  if (role === "admin") {
    menuItems.push(
      {
        key: "admin-dashboard",
        icon: <DashboardOutlined />,
        label: <Link to="/dashboard/admin">Admin Dashboard</Link>,
      },
      {
        key: "approvals",
        icon: <CheckCircleOutlined />,
        label: <Link to="/dashboard/admin/approvals">Approve Users</Link>,
      }
    );
  }

  return (
    <Sider width={250} style={{ minHeight: "100vh", background: "#fff" }}>
      <div style={{ padding: "20px", textAlign: "center" }}>
        <Title level={3} style={{ margin: 0 }}>Smart Hire</Title>
      </div>

      <Menu mode="inline" items={menuItems} />

      {previewRole && (
        <div style={{ padding: "10px", textAlign: "center", fontSize: 12, color: "#888" }}>
          <em>Previewing as: {previewRole}</em>
          <br />
          <Button
            type="link"
            size="small"
            onClick={() => {
              localStorage.removeItem("previewRole");
              window.location.reload();
            }}
          >
            Exit Preview
          </Button>
          <Divider />
        </div>
      )}

      {role && (
        <div style={{ textAlign: "center", padding: 16 }}>
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            danger
            block
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      )}
    </Sider>
  );
}
