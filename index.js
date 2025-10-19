import TelegramBot from "node-telegram-bot-api";
import express from "express";
import fetch from "node-fetch";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN; // put your token in env
const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY; // voice API key
const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // default voice

// Express web server for Render
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Chipkali Voice Bot is alive! 🦎"));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Telegram bot
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Catch any crashes so you see the reason
process.on("unhandledRejection", (err) => console.error("Unhandled:", err));
process.on("uncaughtException", (err) => console.error("Crash:", err));

// When mentioned or replied to
bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;
    const text = msg.text;
    const mentioned = msg.text?.includes("@ChipkaliBot"); // change to your username

    if (mentioned || msg.reply_to_message?.from?.username === "ChipkaliBot") {
      await bot.sendMessage(chatId, "🎤 Processing voice reply...");

      // Call ElevenLabs
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVEN_API_KEY,
        },
        body: JSON.stringify({
          text,
          voice_settings: { stability: 0.5, similarity_boost: 0.8 },
        }),
      });

      if (!response.ok) throw new Error("Voice API error: " + response.statusText);
      const audioBuffer = await response.arrayBuffer();

      // Send back as voice message
      await bot.sendVoice(chatId, Buffer.from(audioBuffer));
    }
  } catch (err) {
    console.error("Message error:", err);
  }
});
