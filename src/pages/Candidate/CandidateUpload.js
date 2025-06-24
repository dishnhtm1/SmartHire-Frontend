import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Form,
  Input,
  Upload,
  Button,
  message,
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Dragger } = Upload;
const { TextArea } = Input;

export default function CandidateUpload() {
  const [cv, setCv] = useState(null);
  const [linkedin, setLinkedin] = useState('');
  const [linkedinText, setLinkedinText] = useState('');
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const clientId = params.get('client');

  // 🧭 Debug logs
  console.log("🧭 Raw URL =", location.pathname + location.search);
  console.log("🧭 Parsed clientId =", clientId);

  // 🔐 Require login before accessing
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning("🔐 Please login to upload your CV.");
      const redirectPath = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${redirectPath}`);
    }
  }, [navigate, location]);

  const handleUpload = async () => {
    // 🧪 Debug log
    console.log("🔍 Upload Field Check:", {
      cv,
      linkedin,
      linkedinText,
      clientId
    });

    if (!cv) return message.warning("⚠️ Please upload your CV file.");
    if (!linkedin) return message.warning("⚠️ LinkedIn profile URL is required.");
    if (!linkedinText || linkedinText.trim().length < 20)
      return message.warning("⚠️ Please paste detailed LinkedIn content (min 20 characters).");
    if (!clientId) return message.warning("⚠️ Referral link is invalid or missing.");

    const token = localStorage.getItem('token');
    if (!token) {
      alert('❌ No token found – please login again.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('cv', cv);
    formData.append('linkedin', linkedin);
    formData.append('linkedinText', linkedinText);
    formData.append('clientId', clientId);

    console.log("📤 Uploading with data:", {
      file: cv?.name,
      linkedin,
      linkedinText: linkedinText?.slice(0, 100),
      clientId,
      token
    });

    try {
      await axios.post('/api/candidate/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      message.success('✅ CV uploaded successfully!');
      setCv(null);
      setLinkedin('');
      setLinkedinText('');
    } catch (err) {
      console.error('❌ Upload failed:', err?.response?.data || err.message || err);
      alert('❌ Upload failed – check the console for details');
      message.error('❌ Failed to upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0f2f5',
        padding: 20,
      }}
    >
      <Card
        style={{ maxWidth: 700, width: '100%' }}
        title={<Title level={3}>📄 Upload CV + LinkedIn Info</Title>}
      >
        <Form layout="vertical">
          <Form.Item label="Upload Resume (PDF)" required>
            <Dragger
              beforeUpload={(file) => {
                setCv(file);
                return false; // prevent auto upload
              }}
              maxCount={1}
              accept=".pdf,.doc,.docx"
            >
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">Click or drag your CV file here</p>
            </Dragger>
          </Form.Item>

          <Form.Item label="LinkedIn Profile URL" required>
            <Input
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/your-profile"
            />
          </Form.Item>

          <Form.Item label="Paste Your LinkedIn Profile Content" required>
            <TextArea
              rows={6}
              value={linkedinText}
              onChange={(e) => setLinkedinText(e.target.value)}
              placeholder="Paste your LinkedIn summary, experiences, skills, and achievements"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" loading={loading} onClick={handleUpload} block>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
