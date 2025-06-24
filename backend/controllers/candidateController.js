// ✅ candidateController.js (Backend)
const CandidateUpload = require('../models/CandidateUpload');

const uploadCandidateData = async (req, res) => {
  const { linkedin, linkedinText, clientId } = req.body;

  try {
    if (!req.file || !linkedin || !linkedinText || !clientId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const upload = new CandidateUpload({
      user: req.user.id,
      cv: req.file.path,
      linkedin,
      linkedinText,
      clientId
    });

    await upload.save();
    res.status(201).json({ message: 'Uploaded successfully' });
  } catch (err) {
    console.error("❌ Upload Save Error:", err);
    res.status(500).json({ message: 'Upload failed' });
  }
};

module.exports = { uploadCandidateData };