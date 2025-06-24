import React, { useState } from "react";
import { Card, Progress, Row, Col, Typography, List } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SoundOutlined
} from "@ant-design/icons";

const { Paragraph } = Typography;

const FeedbackVisualCard = ({ feedback }) => {
  const [showFullSummary, setShowFullSummary] = useState(false);

  // Safe destructuring with fallback
  const {
    summary = "No summary provided.",
    matchScore = 0,
    skills = {},
    positives = [],
    negatives = [],
    recommendations = []
  } = feedback || {};

  const toggleSummary = () => {
    setShowFullSummary((prev) => !prev);
  };

  return (
    <div style={{ padding: 24, background: "#f9f9f9", borderRadius: 12 }}>
      {/* Summary */}
      {summary && (
        <Card
          title="🧠 AI Summary Explanation"
          variant="outlined"
          style={{ marginBottom: 24 }}
        >
          <Paragraph
            ellipsis={
              !showFullSummary
                ? { rows: 4, expandable: false, symbol: "more" }
                : false
            }
            style={{ fontSize: "15px", lineHeight: "1.6" }}
          >
            {summary}
          </Paragraph>
          <a onClick={toggleSummary}>
            {showFullSummary ? "Show less ▲" : "Show more ▼"}
          </a>
        </Card>
      )}

      {/* Job-Fit Score */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card title="🎯 Job-Fit Score" variant="outlined">
            <Progress
              type="dashboard"
              percent={matchScore}
              strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
              size={150}
            />
          </Card>
        </Col>

        {/* Skill Percentages */}
        <Col xs={24} md={16}>
          <Card title="🛠️ Skills Match (All Parsed)" variant="outlined">
            {Object.keys(skills).length > 0 ? (
              Object.entries(skills).map(([skill, value]) => (
                <div key={skill} style={{ marginBottom: 10 }}>
                  <strong>{skill}:</strong>
                  <Progress
                    percent={value}
                    strokeColor="#1890ff"
                    showInfo
                    size="small"
                    style={{ marginLeft: 10, width: "70%" }}
                  />
                </div>
              ))
            ) : (
              <Paragraph>No skill data available.</Paragraph>
            )}
          </Card>
        </Col>
      </Row>

      {/* Strengths & Weaknesses */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="✅ Strengths" variant="outlined">
            {positives.length > 0 ? (
              <List
                dataSource={positives}
                renderItem={(item) => (
                  <List.Item>
                    <CheckCircleOutlined style={{ color: "green", marginRight: 8 }} />
                    {item}
                  </List.Item>
                )}
              />
            ) : (
              <Paragraph>No strengths listed.</Paragraph>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="❌ Weaknesses" variant="outlined">
            {negatives.length > 0 ? (
              <List
                dataSource={negatives}
                renderItem={(item) => (
                  <List.Item>
                    <CloseCircleOutlined style={{ color: "red", marginRight: 8 }} />
                    {item}
                  </List.Item>
                )}
              />
            ) : (
              <Paragraph>No weaknesses listed.</Paragraph>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recommendations */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="📌 Recommendations" variant="outlined">
            {recommendations.length > 0 ? (
              <List
                dataSource={recommendations}
                renderItem={(item) => (
                  <List.Item>
                    <SoundOutlined style={{ marginRight: 8 }} />
                    {item}
                  </List.Item>
                )}
              />
            ) : (
              <Paragraph>No recommendations provided.</Paragraph>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FeedbackVisualCard;
