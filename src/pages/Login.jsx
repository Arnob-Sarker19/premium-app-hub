import './auth.css';

import React, { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const provider = new GoogleAuthProvider();

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Firebase handles persistence internally,
      // But you can set persistence based on rememberMe here if needed.
      // For now, just sign in normally:

      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/");
    } catch (err) {
      alert("Invalid credentials. Try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          username: user.displayName || "Google User",
          email: user.email,
        });
      }

      navigate("/");
    } catch (err) {
      alert("Google sign-in failed: " + err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="wrapper">
        <span className="rotate-bg"></span>
        <span className="rotate-bg2"></span>

        <div className="form-box login">
          <h2 className="title animation" style={{ "--i": 0, "--j": 21 }}>
            Login
          </h2>
          <form onSubmit={handleLogin}>
            <div className="input-box animation" style={{ "--i": 1, "--j": 22 }}>
              <input
                type="email"
                required
                placeholder="Email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <label>Email</label>
              <i className="bx bxs-envelope"></i>
            </div>

            <div className="input-box animation" style={{ "--i": 2, "--j": 23 }}>
              <input
                type="password"
                required
                placeholder="Password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <label>Password</label>
              <i className="bx bxs-lock-alt"></i>
            </div>

            <div className="remember-me animation" style={{ "--i": 3, "--j": 24 }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="rememberMe">Remember Me</label>
            </div>

            <button type="submit" className="btn animation" style={{ "--i": 4, "--j": 25 }}>
              Login
            </button>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="btn google-btn animation"
              style={{ "--i": 5, "--j": 26 }}
            >
              <i className="bx bxl-google" style={{ fontSize: "1.4rem" }}></i>
              Sign in with Google
            </button>

            <div className="linkTxt animation" style={{ "--i": 6, "--j": 27 }}>
              <p>
                Don’t have an account?{" "}
                <a href="/signup" className="register-link">
                  Sign Up
                </a>
              </p>
            </div>
          </form>
        </div>

        <div className="info-text login">
          <h2 className=" font-extrabold text-2xl " style={{ "--i": 0, "--j": 20 }}>
            Welcome Back!
          </h2>
          <p className=" font-semibold text-sm" style={{ }}>
             Discover and enjoy the latest premium apps and games for free! Unlock exclusive features and get the best versions without any hassle. Your gateway to premium digital experiences.
          </p>
        </div>
      </div>
    </div>
  );
}
