import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import express from "express";

// ==== EXPRESS KEEP-ALIVE ====
const app = express();
app.get("/", (req, res) => res.send("🤖 Chipkaliii Bot is alive and running!"));
app.listen(process.env.PORT || 3000, () => console.log("Server running..."));

// ==== CONFIG ====
const TELEGRAM_TOKEN = "7923628657:AAHGL5B9XzYC_VvP_llN6LKTpU4WdMNgIsY";
const ELEVEN_API_KEY = "sk_8318cb9d27b1b4e412d9da0fdc3621ae076ba580b277af0a";
const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // female voice

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// ==== MESSAGE HANDLER ====
bot.on("message", async (msg) => {
  const text = msg.text || "";
  if (!text) return;

  const chatId = msg.chat.id;
  const botMentioned =
    text.includes("@Chipkaliii_Bot") ||
    msg.reply_to_message?.from?.username === "Chipkaliii_Bot";

  if (!botMentioned) return;

  const userText = text.replace(`@Chipkaliii_Bot`, "").trim();

  try {
    const replyText = `Tumne kaha: ${userText}`;

    // Send text reply
    await bot.sendMessage(chatId, replyText);

    // Generate voice reply
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      { text: replyText, model_id: "eleven_multilingual_v2" },
      {
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    const filename = `voice_${uuidv4()}.mp3`;
    fs.writeFileSync(filename, response.data);

    await bot.sendVoice(chatId, filename);
    fs.unlinkSync(filename);
  } catch (err) {
    console.error(err);
    await bot.sendMessage(chatId, "Voice reply me error aayi 😅");
  }
});
