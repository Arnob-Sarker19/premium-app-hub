import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RequestApp from "./pages/RequestApp";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Loader from "./components/Loader";

const ADMIN_EMAIL = "admin@arnob.com"; // Replace with your actual admin email

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <Loader />; // ✅ Show loading animation while auth state is loading
  }

  // ✅ Route for protected user pages
  const ProtectedRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    return children;
  };

  // ✅ Route for admin-only pages
  const AdminRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.email !== ADMIN_EMAIL) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <>
      <Navbar user={user} />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/request-app"
          element={
            <ProtectedRoute>
              <RequestApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;
