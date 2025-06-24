const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { recruiterOnly } = require('../middleware/roleMiddleware');
const CandidateUpload = require('../models/CandidateUpload');
const Feedback = require('../models/Feedback');
const Job = require('../models/Job');
const User = require('../models/User');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { PDFDocument } = require('pdf-lib'); // ✅ added for sanitization
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
const path = require('path');

// ✅ PDF sanitization function
const sanitizeAndParsePDF = async (filePath) => {
  try {
    const existingPdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const newPdfBytes = await pdfDoc.save();
    const parsed = await pdfParse(newPdfBytes);
    return parsed.text;
  } catch (err) {
    console.error("❌ sanitizeAndParsePDF error:", err.message);
    throw new Error("Invalid or corrupted PDF format.");
  }
};

// ✅ GET all uploads - For recruiter dashboard
router.get('/uploads', protect, recruiterOnly, async (req, res) => {
  try {
    const uploads = await CandidateUpload.find()
      .populate('user', 'email')
      .populate('clientId', 'email name');

    res.json(uploads);
  } catch (err) {
    console.error("❌ Error fetching uploads:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Analyze single resume
router.post('/analyze-summary', protect, recruiterOnly, async (req, res) => {
  try {
    const { cvPath, linkedinText = '', jobTitle = '', jobId = '', candidateEmail = '' } = req.body;

    if (!cvPath) {
      return res.status(400).json({ message: "cvPath is required" });
    }

    const filePath = path.join(__dirname, '..', cvPath);
    const cvText = await sanitizeAndParsePDF(filePath);

    let jobDescription = '';
    if (jobId) {
      const job = await Job.findById(jobId);
      jobDescription = job?.description || '';
    }

    if (!jobDescription || jobDescription.length < 50) {
      return res.status(400).json({
        message: "Job description is too short or unclear. Cannot determine candidate match.",
      });
    }

    // 🧠 Gemini prompt (same format as bulk)
    const prompt = `
You are an AI hiring assistant. Analyze the candidate's resume and LinkedIn based on the following job description.

Return ONLY a JSON in this format:
{
  "summary": "short paragraph",
  "matchScore": number (0-100),
  "skills": { "React": number, "Node.js": number, ... },
  "positives": [ "string", ... ],
  "negatives": [ "string", ... ],
  "recommendations": [ "string", ... ]
}

Resume:
${cvText}

LinkedIn:
${linkedinText}

Job Title: ${jobTitle}
Job Description: ${jobDescription}
`;

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }
    );

    const raw = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsed = {};
    try {
      const jsonStart = raw.indexOf("{");
      const jsonEnd = raw.lastIndexOf("}");
      const jsonString = raw.slice(jsonStart, jsonEnd + 1);
      parsed = JSON.parse(jsonString);
    } catch (e) {
      parsed = {
        summary: raw,
        matchScore: 30,
        skills: {},
        positives: ["Basic info extracted"],
        negatives: ["AI couldn't parse feedback"],
        recommendations: ["Please review CV relevance manually"]
      };
    }

    // Include candidate name (if email provided)
    let candidateName = "Candidate";
    if (candidateEmail) {
      const user = await User.findOne({ email: candidateEmail });
      if (user && user.email) {
        candidateName = user.email.split("@")[0];
      }
    }

    res.json({
      ...parsed,
      candidateName,
      jobTitle,
      matchScore: parsed.matchScore || 0,
    });
  } catch (err) {
    console.error("❌ AI summary error:", err);
    res.status(500).json({ message: "Failed to analyze resume" });
  }
});







// ✅ Bulk analyze top N candidates from a client
// ✅ Bulk analyze top N candidates from a client by matchScore
router.post("/analyze-top-candidates", protect, recruiterOnly, async (req, res) => {
  try {
    const { clientId, jobId, topN = 3 } = req.body;

    if (!clientId || !jobId) {
      return res.status(400).json({ message: "clientId and jobId are required" });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const jobTitle = job.title || "Untitled";
    const jobDescription = job.description || "";

    if (!jobDescription || jobDescription.length < 50) {
      return res.status(400).json({ message: "Job description too short for analysis." });
    }

    // ✅ Get all candidates uploaded by the client
    const uploads = await CandidateUpload.find({ clientId }).populate("user");
    const allAnalyzed = [];

    for (const item of uploads) {
      const filePath = path.join(__dirname, "..", item.cv);
      const cvText = await sanitizeAndParsePDF(filePath);
      const linkedinText = item.linkedin || "";

      const prompt = `
You are an AI hiring assistant. Analyze the candidate's resume and LinkedIn based on the following job description.

Return ONLY a JSON in this format:
{
  "summary": "short paragraph",
  "matchScore": number (0-100),
  "skills": { "React": number, "Node.js": number, ... },
  "positives": [ "string", ... ],
  "negatives": [ "string", ... ],
  "recommendations": [ "string", ... ]
}

Resume:
${cvText}

LinkedIn:
${linkedinText}

Job Title: ${jobTitle}
Job Description: ${jobDescription}
`;

      const aiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        }
      );

      const raw = aiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      let parsed = {};
      try {
        const jsonStart = raw.indexOf("{");
        const jsonEnd = raw.lastIndexOf("}");
        const jsonString = raw.slice(jsonStart, jsonEnd + 1);
        parsed = JSON.parse(jsonString);
      } catch (e) {
        parsed = {
          summary: raw,
          matchScore: 30,
          skills: {},
          positives: ["Basic info extracted"],
          negatives: ["AI couldn't parse feedback"],
          recommendations: ["Please review CV relevance manually"]
        };
      }

      allAnalyzed.push({
        candidateId: item._id,
        candidateName: item.user?.email?.split("@")[0] || "Candidate",
        candidateEmail: item.user?.email || "N/A",
        summary: parsed.summary,
        matchScore: parsed.matchScore || 0,
        skills: parsed.skills || {},
        positives: parsed.positives || [],
        negatives: parsed.negatives || [],
        recommendations: parsed.recommendations || [],
        clientId,
        jobId,
        jobTitle
      });
    }

    // ✅ Sort by score descending and return top N
    const topCandidates = allAnalyzed
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, topN);

    res.json(topCandidates);
  } catch (err) {
    console.error("Bulk analysis error:", err);
    res.status(500).json({ message: "Bulk analysis failed" });
  }
});





// Other routes unchanged below

router.post('/analyze-preview', protect, recruiterOnly, async (req, res) => {
  const { cvPath, linkedin } = req.body;
  try {
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Analyze the following candidate:\nResume: ${cvPath}\nLinkedIn: ${linkedin}\nGive a short summary with skills and job-fit score (0-100).`
              }
            ]
          }
        ]
      }
    );

    const output = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || "No AI response";
    const score = parseInt(output.match(/\b(\d{2,3})\b/)?.[1] || "75");

    res.status(200).json({ summary: output, matchScore: score });

  } catch (err) {
    console.error("❌ Gemini API Error:", err?.response?.data || err.message);
    res.status(500).json({ message: "❌ AI analysis failed." });
  }
});

router.post("/save-bulk-feedback", protect, recruiterOnly, async (req, res) => {
  try {
    const { feedbacks } = req.body;

    const saved = [];
    const skipped = [];

    for (const fb of feedbacks) {
      try {
        const user = await User.findOne({ email: fb.candidateEmail });

        if (!user || user.role !== "candidate") {
          console.warn(`⚠️ Skipping: ${fb.candidateEmail} is not a candidate`);
          skipped.push(fb.candidateEmail);
          continue;
        }

        const newFeedback = new Feedback({
          candidateId: user._id,
          candidateEmail: fb.candidateEmail,
          candidateName: fb.candidateName,
          summary: fb.summary,
          matchScore: fb.matchScore,
          skills: fb.skills || {},
          positives: fb.positives || [],
          negatives: fb.negatives || [],
          recommendations: fb.recommendations || [],
          clientId: fb.clientId,
          jobId: fb.jobId,
          jobTitle: fb.jobTitle,
          reviewedBy: req.user.email,
        });

        await newFeedback.save();
        saved.push(fb.candidateEmail);

      } catch (innerErr) {
        console.error(`❌ Failed saving feedback for ${fb.candidateEmail}:`, innerErr.message);
        skipped.push(fb.candidateEmail);
      }
    }

    res.status(201).json({
      message: "✅ Bulk feedback processed.",
      saved,
      skipped,
    });

  } catch (err) {
    console.error("❌ Save bulk feedback error:", err);
    res.status(500).json({ message: "❌ Saving bulk feedback failed.", error: err.message });
  }
});


router.post('/save-feedback', protect, recruiterOnly, async (req, res) => {
  const {
    candidateEmail,
    candidateName,
    summary,
    matchScore,
    clientId,
    jobId,
    jobTitle,
    skills,
    positives,
    negatives,
    recommendations
  } = req.body;

  try {
    console.log("🔍 Incoming feedback submission:");
    console.log({
      candidateEmail,
      candidateName,
      summary,
      matchScore,
      clientId,
      jobId,
      jobTitle,
      skills,
      positives,
      negatives,
      recommendations
    });

    const candidate = await User.findOne({ email: candidateEmail });

    if (!candidate) {
      console.error("❌ No user found with this email");
      return res.status(404).json({ message: 'No user found with this email.' });
    }

    if (candidate.role !== 'candidate') {
      console.error(`❌ User found but has invalid role: ${candidate.role}`);
      return res.status(400).json({ message: `User is not a candidate. Found role: ${candidate.role}` });
    }

    const feedback = new Feedback({
      candidateId: candidate._id,
      candidateName,
      summary,
      matchScore,
      skills,
      positives,
      negatives,
      recommendations,
      clientId,
      jobId,
      jobTitle,
      reviewedBy: req.user.email
    });

    await feedback.save();
    console.log("✅ Feedback saved successfully");
    res.status(201).json({ message: "✅ Feedback sent to client." });

  } catch (err) {
    console.error("❌ Feedback save error:", err); // full error stack
    res.status(500).json({ message: "❌ Failed to save feedback.", error: err.message });
  }
});



router.get('/client-jobs/:clientId', protect, recruiterOnly, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.params.clientId });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

router.get('/responses', protect, recruiterOnly, async (req, res) => {
  try {
    const responses = await Feedback.find({ status: { $ne: 'pending' } });
    res.json(responses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching responses' });
  }
});

router.get('/review-feedback', protect, recruiterOnly, async (req, res) => {
  try {
    const recruiterEmail = req.user.email;
    const feedbacks = await Feedback.find({ reviewedBy: recruiterEmail });

    const enriched = await Promise.all(
      feedbacks.map(async (item) => {
        const client = await User.findById(item.clientId).select('email');
        return {
          ...item._doc,
          clientName: client?.email || 'Unknown',
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error('❌ Error fetching recruiter review feedback:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/send-to-candidate/:id', protect, recruiterOnly, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    feedback.sentToCandidate = true;
    await feedback.save();

    res.status(200).json({ message: "✅ Feedback sent to candidate." });
  } catch (err) {
    console.error("❌ Send to candidate error:", err.message);
    res.status(500).json({ message: "Server error sending feedback." });
  }
});

router.post('/send-final-feedback/:id', protect, authorizeRoles('recruiter'), async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.sentFinalFeedbackToCandidate = true;
    await feedback.save();

    res.status(200).json({ message: '✅ Final feedback sent to candidate.' });
  } catch (err) {
    console.error('Send final feedback error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/dashboard-stats', protect, recruiterOnly, async (req, res) => {
  try {
    const Job = require('../models/Job');
    const CandidateUpload = require('../models/CandidateUpload');
    const Interview = require('../models/Interview');
    const User = require('../models/User');

    const openJobs = await Job.countDocuments();
    const assignedCandidates = await CandidateUpload.countDocuments();
    const clientsCount = await User.countDocuments({ role: 'client' });

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const interviewsThisWeek = await Interview.countDocuments({
      date: { $gte: today, $lte: nextWeek },
    });

    res.json({
      openJobs,
      assignedCandidates,
      clientsCount,
      interviewsThisWeek,
    });
  } catch (err) {
    console.error("❌ Dashboard stats error:", err);
    res.status(500).json({ message: 'Dashboard stats fetch failed' });
  }
});

module.exports = router;
