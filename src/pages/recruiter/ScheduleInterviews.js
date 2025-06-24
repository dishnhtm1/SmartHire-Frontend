import React from "react";
import { Form, Input, DatePicker, Button, message } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function ScheduleInterviews() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    const { candidateName, clientCompany, interviewDate } = values;

    // 👉 Format or send data to backend here
    console.log("📤 Scheduling:", {
      candidateName,
      clientCompany,
      interviewDate: interviewDate.format("YYYY-MM-DD HH:mm"),
    });

    message.success("✅ Interview scheduled!");
    form.resetFields();
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <h2 style={{ marginBottom: "2rem" }}>📅 Schedule Interviews</h2>

      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="Candidate Name"
          name="candidateName"
          rules={[{ required: true, message: "Please enter the candidate's name" }]}
        >
          <Input placeholder="e.g. John Doe" />
        </Form.Item>

        <Form.Item
          label="Client Company"
          name="clientCompany"
          rules={[{ required: true, message: "Please enter the client company" }]}
        >
          <Input placeholder="e.g. ABC Corp" />
        </Form.Item>

        <Form.Item
          label="Interview Date & Time"
          name="interviewDate"
          rules={[{ required: true, message: "Please select interview date & time" }]}
        >
          <DatePicker
            showTime
            style={{ width: "100%" }}
            placeholder="Select Date & Time"
            format="YYYY-MM-DD HH:mm"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<CalendarOutlined />}>
            Schedule Interview
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
