// src/components/AdminOnlyRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const ADMIN_EMAIL = "admin@arnob.com"; // replace with your admin email

export default function AdminOnlyRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p>Loading...</p>;
  if (!user || user.email !== ADMIN_EMAIL) return <Navigate to="/login" />;

  return children;
}
