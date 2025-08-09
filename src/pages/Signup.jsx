import './auth.css';

import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const provider = new GoogleAuthProvider();

export default function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        username: form.username,
        email: form.email,
      });
      navigate("/");
    } catch (err) {
      alert(err.message);
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

        <div className="form-box register">
          <h2 className="title animation" style={{ "--i": 17, "--j": 0 }}>
            Sign Up
          </h2>
          <form onSubmit={handleSignup}>
            <div className="input-box animation" style={{ "--i": 18, "--j": 1 }}>
              <input
                type="text"
                name="username"
                required
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
              />
              <label>Username</label>
              <i className="bx bxs-user"></i>
            </div>

            <div className="input-box animation" style={{ "--i": 19, "--j": 2 }}>
              <input
                type="email"
                name="email"
                required
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
              />
              <label>Email</label>
              <i className="bx bxs-envelope"></i>
            </div>

            <div className="input-box animation" style={{ "--i": 20, "--j": 3 }}>
              <input
                type="password"
                name="password"
                required
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
              <label>Password</label>
              <i className="bx bxs-lock-alt"></i>
            </div>

            <button type="submit" className="btn animation" style={{ "--i": 21, "--j": 4 }}>
              Sign Up
            </button>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="btn google-btn animation"
              style={{ "--i": 22, "--j": 5 }}
            >
              <i className="bx bxl-google" style={{ fontSize: "1.4rem" }}></i>
              Sign up with Google
            </button>

            <div className="linkTxt animation" style={{ "--i": 23, "--j": 6 }}>
              <p>
                Already have an account?{" "}
                <a href="/login" className="login-link">
                  Login
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
