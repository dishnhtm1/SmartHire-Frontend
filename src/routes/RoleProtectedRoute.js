import React from "react";
import { Navigate } from "react-router-dom";

export default function RoleProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  return children;
}
