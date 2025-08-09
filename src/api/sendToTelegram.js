// src/api/sendToTelegram.js
import admin from "firebase-admin";

function initAdmin() {
  if (!admin.apps.length) {
    // Prefer full service account JSON in FIREBASE_SERVICE_ACCOUNT
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(sa),
      });
    } else {
      // Fallback to separate env vars (PRIVATE_KEY may have \n)
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // replace escaped newlines
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    }
  }
  return admin;
}

async function sendTelegram(botToken, payload) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { appName, description, userEmail } = req.body || {};

  if (!appName || !description) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const adminSDK = initAdmin();
    const db = adminSDK.firestore();

    // 1) create request doc
    const docRef = await db.collection("appRequests").add({
      appName,
      description,
      userEmail: userEmail || null,
      status: "pending",
      createdAt: adminSDK.firestore.FieldValue.serverTimestamp(),
    });
    const requestId = docRef.id;

    // 2) get bot username (for connect link)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    let botUsername = null;
    try {
      const me = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const meJson = await me.json();
      if (meJson.ok) botUsername = meJson.result.username;
    } catch (err) {
      // ignore — connect link will be omitted
      console.warn("getMe failed", err);
    }

    // connect link for requester to start the bot and link themselves to this request
    const connectLink = botUsername
      ? `https://t.me/${botUsername}?start=request_${requestId}`
      : null;

    // 3) compose admin message with inline buttons (callback_data must be small)
    const adminChatId = process.env.TELEGRAM_CHAT_ID;
    const appUrl = process.env.APP_URL || "";

    const messageText = `📥 *New MOD App Request*\n\n*ID:* ${requestId}\n*App:* ${appName}\n*Reason:* ${description}\n*Email:* ${userEmail || "Not provided"}`;

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "✅ Approve", callback_data: `approve|${requestId}` },
          { text: "❌ Reject", callback_data: `reject|${requestId}` },
          { text: "💬 Ask (reply)", callback_data: `ask|${requestId}` },
        ],
        [
          { text: "Open Admin", url: `${appUrl}/admin?request=${requestId}` },
        ],
      ],
    };

    // 4) send to admin
    const sendRes = await sendTelegram(botToken, {
      chat_id: adminChatId,
      text: messageText,
      parse_mode: "Markdown",
      reply_markup: replyMarkup,
    });

    if (!sendRes.ok) {
      console.error("Telegram send error:", sendRes);
      return res.status(500).json({ error: "Failed to notify admin" });
    }

    // 5) Respond to frontend with requestId and connect link (if available)
    return res.status(200).json({ success: true, requestId, connectLink });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
