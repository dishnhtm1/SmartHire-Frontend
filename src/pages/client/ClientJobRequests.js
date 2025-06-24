import React, { useState } from "react";
import axios from "axios";
import { Form, Input, Button, Card, Typography, message } from "antd";

const { Title } = Typography;
const { TextArea } = Input;

export default function ClientJobForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post("/api/client/jobs", values, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success("✅ Job posted successfully!");
      form.resetFields();
    } catch (err) {
      console.error("❌ Failed to post job:", err);
      message.error("Error posting job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={<Title level={4}>📝 Post a New Job</Title>} style={{ maxWidth: 600, margin: "0 auto" }}>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Job Title"
          name="title"
          rules={[{ required: true, message: "Please enter the job title" }]}
        >
          <Input placeholder="Enter job title" />
        </Form.Item>

        <Form.Item
          label="Job Description"
          name="description"
          rules={[
            { required: true, message: "Please enter the job description" },
            {
              validator: (_, value) =>
                value && value.length >= 50
                  ? Promise.resolve()
                  : Promise.reject(new Error("Description must be at least 50 characters")),
            },
          ]}
        >
          <TextArea rows={4} placeholder="Enter job description (min 50 characters)" />
        </Form.Item>


        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Post Job
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
