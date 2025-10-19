import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// ==== CONFIG ====
const TELEGRAM_TOKEN = "7923628657:AAHGL5B9XzYC_VvP_llN6LKTpU4WdMNgIsY"; 
const ELEVEN_API_KEY = "sk_8318cb9d27b1b4e412d9da0fdc3621ae076ba580b277af0a";
const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // default voice ID (female)
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// ==== MESSAGE HANDLER ====
bot.on("message", async (msg) => {
  const text = msg.text || "";
  const chatId = msg.chat.id;
  const botMentioned = text.includes("@Chipkaliii_Bot") || msg.reply_to_message?.from?.username === "YourBotUsername";

  if (!botMentioned) return;

  const userText = text.replace(`@Chipkaliii_Bot`, "").trim();

  try {
    // Simple echo reply (you can connect Gemini/GPT later)
    const replyText = `Tumne kaha: ${userText}`;

    // Send text reply
    await bot.sendMessage(chatId, replyText);

    // Generate voice from ElevenLabs
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

    // Save audio file
    const filename = `voice_${uuidv4()}.mp3`;
    fs.writeFileSync(filename, response.data);

    // Send voice
    await bot.sendVoice(chatId, filename);

    // Delete after sending
    fs.unlinkSync(filename);
  } catch (err) {
    console.error(err);
    await bot.sendMessage(chatId, "Voice reply me error aayi 😅");
  }
});
