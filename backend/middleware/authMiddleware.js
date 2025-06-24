const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("🛡 Token Received:", token);
  console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET);

  if (!token) {
    console.log("⛔️ No token provided");
    return res.status(401).json({ message: "Access denied, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔓 Decoded Token:", decoded); // ✅ Add this
    req.user = decoded;
    next();
  } catch (err) {
    console.log("❌ JWT verify failed:", err.message); // ✅ Add this
    return res.status(401).json({ message: "Invalid token" });
  }
};


exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
