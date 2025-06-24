// backend/routes/candidateRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Job = require('../models/Job');
const { uploadCandidateData } = require('../controllers/candidateController');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ✅ Upload CV
router.post('/upload', protect, upload.single('cv'), uploadCandidateData);

// ✅ Get interviews for the candidate
router.get('/interviews', protect, authorizeRoles('candidate'), async (req, res) => {
  try {
    const candidateId = req.user.id;

    const feedbacks = await Feedback.find({
      candidateId,
      status: 'accepted',
      sentToCandidate: true
    });

    const enriched = await Promise.all(
      feedbacks.map(async (fb) => {
        const client = await User.findById(fb.clientId).select('email');
        const job = await Job.findById(fb.jobId).select('title');

        return {
          ...fb._doc,
          clientName: client?.email || 'Unknown Client',
          jobTitle: job?.title || 'Unknown Job',
          interviewType: fb.interviewType || '',
          interviewDate: fb.interviewDate || '',
          interviewDetails: fb.interviewDetails || '', // ✅ NEW FIELD
        };
      })
    );

    res.status(200).json(enriched);
  } catch (err) {
    console.error('❌ Error fetching interviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET: Final Feedback for candidate
router.get('/feedback', protect, authorizeRoles('candidate'), async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      candidateId: req.user.id,
      sentFinalFeedbackToCandidate: true
    });

    const enriched = await Promise.all(
      feedbacks.map(async (fb) => {
        const client = await User.findById(fb.clientId).select('email');
        const job = await Job.findById(fb.jobId).select('title');

        return {
          ...fb._doc,
          clientName: client?.email || 'Unknown Client',
          jobTitle: job?.title || 'Unknown Job',
        };
      })
    );

    res.status(200).json(enriched);
  } catch (err) {
    console.error('❌ Error fetching final feedback:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
