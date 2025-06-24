const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  candidateId: { type: String, required: true },
  candidateName: { type: String },
  clientId: { type: String, required: true },
  jobTitle: { type: String },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  summary: { type: String, required: true },
  matchScore: { type: Number },

  skills: { type: Object, default: {} },
  positives: { type: [String], default: [] },
  negatives: { type: [String], default: [] },
  recommendations: { type: [String], default: [] },

  reviewedBy: { type: String },
  additionalFeedback: { type: String },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  interviewDate: { type: Date },
  interviewType: { type: String },
  interviewDetails: { type: String, default: "" }, // ✅ Added field

  finalDecision: {
    type: String,
    enum: ['confirmed', 'rejected', ''],
    default: '',
  },
  finalMessage: { type: String, default: "" },

  sentToCandidate: { type: Boolean, default: false },
  sentFinalFeedbackToCandidate: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
