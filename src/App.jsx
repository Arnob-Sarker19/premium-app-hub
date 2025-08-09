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
import Footer from "./components/Footer";

const ADMIN_EMAIL = "admin@arnob.com";

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) return <Loader />;

  const ProtectedRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    return children;
  };

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
              <div className="px-6 py-4 max-w-7xl mx-auto">
                <Home />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/request-app"
          element={
            <ProtectedRoute>
              <div className="px-6 py-4 max-w-7xl mx-auto">
                <RequestApp />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <div className="px-6 py-4 max-w-7xl mx-auto">
                <Admin />
              </div>
            </AdminRoute>
          }
        />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
