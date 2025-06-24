const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const User = require("../models/User");

const router = express.Router();

// GET /api/admin/pending-users
router.get("/pending-users", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const users = await User.find({ status: "pending" });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/admin/approve/:id
router.put("/approve/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "approved";
    await user.save();

    res.json({ message: "User approved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
// ✅ GET /api/admin/clients - get all approved clients (for recruiter dropdown)
router.get("/clients", protect, authorizeRoles("admin", "recruiter"), async (req, res) => {
  try {
    const clients = await User.find({ role: "client", status: "approved" }).select("email _id");
    res.json(clients);
  } catch (err) {
    console.error("❌ Error fetching clients:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
