// middleware/roleMiddleware.js

// Middleware to restrict access to recruiters
exports.recruiterOnly = (req, res, next) => {
  if (req.user && req.user.role === 'recruiter') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Recruiters only' });
  }
};

// Middleware to restrict access to clients
exports.clientOnly = (req, res, next) => {
  if (req.user && req.user.role === 'client') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Clients only' });
  }
};

// Middleware to restrict access to candidates
exports.candidateOnly = (req, res, next) => {
  if (req.user && req.user.role === 'candidate') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Candidates only' });
  }
};
