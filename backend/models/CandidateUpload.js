const mongoose = require('mongoose');

const candidateUploadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cv: { type: String, required: true },
  linkedin: { type: String, required: true },
  linkedinText: { type: String, required: true },clientId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User', // assuming clients are in User collection
  required: true},
  jobMatched: { type: mongoose.Schema.Types.ObjectId, ref: 'JobRequest' },
  feedback: String,
  matchScore: Number,
  finalStatus: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // client who confirmed
}, { timestamps: true });

module.exports = mongoose.model('CandidateUpload', candidateUploadSchema);
