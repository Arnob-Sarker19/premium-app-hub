import { db } from "../../firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { message } = req.body;

  if (!message || !message.text) {
    return res.status(400).json({ error: "No message text found" });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = message.chat.id;
  const fromId = message.from.id;
  const text = message.text.trim();

  // Only allow your Telegram user ID (replace with your actual Telegram user ID)
  const ADMIN_TELEGRAM_USER_ID = parseInt(process.env.ADMIN_TELEGRAM_USER_ID);

  if (fromId !== ADMIN_TELEGRAM_USER_ID) {
    return res.status(403).json({ error: "Unauthorized user" });
  }

  // Simple command parser
  // Commands:
  // /delete <appId>
  // /update <appId> title="New title" description="New description" iconURL="url" apkURL="url"
  
  const [command, ...args] = text.split(" ");

  if (command === "/delete") {
    const appId = args[0];
    if (!appId) {
      await sendTelegramMessage(botToken, chatId, "❌ Usage: /delete <appId>");
      return res.status(400).json({ error: "App ID required" });
    }

    try {
      await deleteDoc(doc(db, "apps", appId));
      await sendTelegramMessage(botToken, chatId, `✅ App ${appId} deleted successfully.`);
      return res.status(200).json({ success: true });
    } catch (err) {
      await sendTelegramMessage(botToken, chatId, `❌ Error deleting app: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
  }

  else if (command === "/update") {
    const appId = args[0];
    if (!appId) {
      await sendTelegramMessage(botToken, chatId, "❌ Usage: /update <appId> title=\"...\" description=\"...\" iconURL=\"...\" apkURL=\"...\"");
      return res.status(400).json({ error: "App ID required" });
    }

    // Parse key="value" pairs from args after appId
    const updateData = {};
    const regex = /(\w+)="([^"]*)"/g;
    const rest = text.slice(command.length + appId.length + 2); // +2 for spaces
    let match;
    while ((match = regex.exec(rest)) !== null) {
      updateData[match[1]] = match[2];
    }

    if (Object.keys(updateData).length === 0) {
      await sendTelegramMessage(botToken, chatId, "❌ No update data provided.");
      return res.status(400).json({ error: "No update data" });
    }

    try {
      const docRef = doc(db, "apps", appId);
      await updateDoc(docRef, updateData);
      await sendTelegramMessage(botToken, chatId, `✅ App ${appId} updated successfully.`);
      return res.status(200).json({ success: true });
    } catch (err) {
      await sendTelegramMessage(botToken, chatId, `❌ Error updating app: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
  }

  else {
    await sendTelegramMessage(botToken, chatId, "❌ Unknown command. Use /delete or /update.");
    return res.status(400).json({ error: "Unknown command" });
  }
}

// Helper to send message back to Telegram
async function sendTelegramMessage(botToken, chatId, text) {
  const telegramURL = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await fetch(telegramURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    }),
  });
}
