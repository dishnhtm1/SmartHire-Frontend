const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');
const Feedback = require('../models/Feedback');
const Job = require('../models/Job');

const router = express.Router();

// ✅ Create a new job request
router.post('/jobs', protect, authorizeRoles('client'), async (req, res) => {
  const { title, description } = req.body;

  try {
    const job = new Job({
      title,
      description,
      postedBy: req.user.id
    });

    await job.save();
    res.status(201).json({ message: "Job request created", job });
  } catch (err) {
    res.status(500).json({ message: "Error creating job request" });
  }
});

// ✅ Fixed route to return actual feedbacks related to the client
router.get('/feedback', protect, authorizeRoles('client'), async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ clientId: req.user.id });
    res.json(feedbacks);
  } catch (err) {
    console.error("❌ Feedback fetch error:", err);
    res.status(500).json({ message: "Server error fetching feedbacks" });
  }
});

// POST /api/client/respond-feedback
router.post('/respond-feedback', protect, authorizeRoles('client'), async (req, res) => {
  const { feedbackId, status, interviewDate, interviewType, interviewDetails } = req.body;

  try {
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    feedback.status = status;

    if (status === 'accepted') {
      feedback.interviewDate = interviewDate;
      feedback.interviewType = interviewType;
      feedback.interviewDetails = interviewDetails; // ✅ NEW LINE
    }

    await feedback.save();

    res.status(200).json({ message: "✅ Feedback updated successfully" });
  } catch (err) {
    console.error("❌ Feedback update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.patch('/final-decision/:feedbackId', protect, authorizeRoles('client'), async (req, res) => {
  const { status, message } = req.body;

  if (!['confirmed', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const feedback = await Feedback.findById(req.params.feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.finalDecision = status;
    feedback.finalMessage = message || "";
    await feedback.save();

    res.status(200).json({ message: '✅ Final decision submitted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
