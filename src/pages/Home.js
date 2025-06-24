import React, { useEffect, useState } from 'react';
import { Typography, Button } from 'antd';
import {
  TwitterOutlined,
  InstagramOutlined,
  FacebookOutlined,
  YoutubeOutlined,
  GithubOutlined
} from '@ant-design/icons';
import './Home.css';

import smarthireBg from '../assets/background.png';
import bgImage from '../assets/cover.png';
import logo from '../assets/logo.png';

import imLogo from '../assets/IM.jpg';
import cvLogo from '../assets/CV.png';
import forumLogo from '../assets/FI.jpeg';

import imSlide1 from '../assets/IMSlide1.png';
import imSlide2 from '../assets/IMSlide2.png';


import cvSlides from '../assets/CVSlide1.png';
import cvSlides2 from '../assets/CVSlide2.png';
import cvSlides3 from '../assets/CVSlide3.png';

import forumSlides1 from '../assets/Forum1.jpeg';
import forumSlides2 from '../assets/Forum2.jpeg';
import forumSlides3 from '../assets/Forum3.jpeg';

const { Title, Paragraph } = Typography;

export default function Home() {
  const [cvSlide, setCvSlide] = useState(0);
  const [forumSlide, setForumSlide] = useState(0);
  
  const [imSlide, setImSlide] = useState(0);
  const imSlideImages = [imSlide1, imSlide2];


  const cvSlideImages = [cvSlides, cvSlides2, cvSlides3];
  const forumSlideImages = [forumSlides1, forumSlides2, forumSlides3];

  useEffect(() => {
  const interval = setInterval(() => {
    setCvSlide((prev) => (prev + 1) % cvSlideImages.length);
    setForumSlide((prev) => (prev + 1) % forumSlideImages.length);
    setImSlide((prev) => (prev + 1) % imSlideImages.length);
  }, 4000);
  return () => clearInterval(interval);
}, []);


  return (
    <div className="home-bg-wrapper" style={{ backgroundImage: `url(${smarthireBg})` }}>
      <div className="home-wrapper">
        {/* Logo Bar */}
        <div className="top-logo-bar">
          <img src={logo} alt="SmartHire Logo" className="logo" />
          <div className="top-right-buttons">
            <Button type="primary" href="/login">Login</Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="hero-bg-section" style={{ backgroundImage: `url(${bgImage})` }}>
          <div className="hero-overlay">
            <Title className="big-title">AI HIRING THAT’S SMART & SIMPLE</Title>
            <Paragraph className="hero-description">
              SmartHire connects companies with top candidates through AI-powered interviews,
              resume scanning, and instant feedback.
            </Paragraph>
          </div>
        </div>

        {/* === InterviewMate Banner === */}
        <div className="ad-banner split-layout">
          <div className="ad-content">
            <img src={imLogo} alt="InterviewMate Logo" className="text-logo" />
            <h2>InterviewMate</h2>
            <p>
              Practice interviews with AI-powered experience. Simulate real scenarios, get instant feedback,
              and boost your confidence.
            </p>
            <Button type="primary" href="https://gentle-field-06a5dc100.6.azurestaticapps.net/" target="_blank">
              Visit InterviewMate
            </Button>
          </div>
          <div className="slide-bg" style={{ backgroundImage: `url(${imSlideImages[imSlide]})` }} />


        </div>

        {/* === CV Scanner Banner === */}
        <div className="ad-banner split-layout">
          <div className="slide-bg" style={{ backgroundImage: `url(${cvSlideImages[cvSlide]})` }} />
          <div className="ad-content">
            <img src={cvLogo} alt="CV Logo" className="text-logo" />
            <h2>CV Scanner</h2>
            <p>
              Upload your CV and job title. Get real-time AI feedback on how well your CV matches the role.
            </p>
            <Button type="primary">Try CV Scanner</Button>
          </div>
        </div>

        {/* === Forum Academy Banner === */}
        <div className="ad-banner split-layout reverse">
          <div className="slide-bg" style={{ backgroundImage: `url(${forumSlideImages[forumSlide]})` }} />
          <div className="ad-content">
            <img src={forumLogo} alt="Forum Logo" className="text-logo" />
            <h2>Forum Academy</h2>
            <p>
              Forum Academy provides hands-on training in Full Stack Development and Cloud Engineering.
              Graduated professionals are showcased here for companies to discover and hire industry-ready talent.
            </p>
            <Button type="primary" href="https://wonderful-meadow-0e35b381e.6.azurestaticapps.net" target="_blank">
              Explore Academy
            </Button>
          </div>
        </div>

        {/* Spacer Before Footer */}
        <div className="footer-spacer" />

        {/* === Footer Section === */}
        <footer className="footer">
          <div className="footer-columns">
            <div className="footer-column">
              <img src={logo} alt="SmartHire Logo" className="footer-logo" />
              
              <p style={{ marginTop: "1rem" }}></p>
              <div className="social-icons">
                <TwitterOutlined />
                <InstagramOutlined />
                <FacebookOutlined />
                <YoutubeOutlined />
                <GithubOutlined />
              </div>
            </div>

            
          </div>
        </footer>
      </div>
    </div>
  );
}
