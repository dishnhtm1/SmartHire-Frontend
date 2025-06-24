const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  },
  date: {
    type: Date,
    required: true,
  },
  interviewType: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online',
  },
});

module.exports = mongoose.model('Interview', interviewSchema);
