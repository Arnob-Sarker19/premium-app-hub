import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function RequestApp() {
  const [formData, setFormData] = useState({
    appName: "",
    description: "",
    userEmail: ""
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendTelegramMessage = async (message) => {
    const BOT_TOKEN = "8379257177:AAEdbdHZXYWcDHm07052hvjaq2374E1nkYI";
    const CHAT_ID = "5894848520";

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: "Markdown"
        })
      });
    } catch (error) {
      console.error("Telegram Error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const message = `📥 *New MOD App Request*\n\n🔤 *App:* ${formData.appName}\n📄 *Description:* ${formData.description}\n✉️ *Email:* ${formData.userEmail || "Not provided"}`;

    try {
      await addDoc(collection(db, "appRequests"), {
        ...formData,
        createdAt: Timestamp.now()
      });

      await sendTelegramMessage(message);

      setFormData({ appName: "", description: "", userEmail: "" });
      setSuccess(true);
    } catch (error) {
      alert("Error sending request: " + error.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Request a MOD App</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="appName"
          placeholder="App Name"
          value={formData.appName}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
        <textarea
          name="description"
          placeholder="Why do you want this MOD?"
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="email"
          name="userEmail"
          placeholder="Your Email"
          value={formData.userEmail}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
        >
          Submit Request
        </button>
        {success && <p className="text-green-600 text-center">✅ Request submitted!</p>}
      </form>
      <p className="text-sm text-center mt-4">
        Need help? Contact us at{" "}
        <a href="https://t.me/+D9rI9cYqu7xhZmU1" className="text-blue-600 hover:underline">
          join-support@telegram.com
        </a>
      </p>
    </div>
    
  );
}
