import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const userData = localStorage.getItem("user");
  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("❌ Invalid user JSON in localStorage:", error);
    localStorage.removeItem("user");
    user = null;
  }

  return user ? children : <Navigate to="/" />;
}
