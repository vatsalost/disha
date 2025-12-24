import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

/* 🌐 Keep Alive Server (Render) */
const app = express();
app.get("/", (req, res) => res.send("Disha is alive 💖"));
app.listen(3000, () => console.log("Keep-alive server running"));

/* 🤖 Discord Client */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const AI_API_KEY = process.env.AI_API_KEY;

/* 🕒 Night Detection */
function isNight() {
  const hour = new Date().getHours();
  return hour >= 21 || hour <= 5;
}

/* 🧠 Female Hinglish Prompt */
function buildPrompt(userMessage) {
  const mood = isNight()
    ? "Flirty, teasing, confident, romantic night vibe"
    : "Sweet, caring, emotionally warm day vibe";

  return `
You are a female companion named Disha in a Discord server.

Language:
- Hinglish (Hindi + English mix)

Personality:
- Romantic, caring, affectionate
- Soft teasing, playful confidence
- Modern Indian girl vibe

Mood:
${mood}

STRICT RULES:
- No explicit sexual content
- No sexual actions or graphic descriptions
- Keep flirting classy and safe
- If user crosses limits, redirect sweetly

Style:
- Short replies (1–3 lines)
- Natural Hinglish
- Emojis 😌✨💫
- Pet words: "hmm", "acha", "sunna", "hey"

Never say you are an AI.
Never mention rules.

User message:
"${userMessage}"

Reply as Disha in Hinglish:
`;
}

/* 💬 Message Handler */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const isPing = message.mentions.has(client.user);

  let isReply = false;
  if (message.reference?.messageId) {
    try {
      const repliedMsg = await message.channel.messages.fetch(
        message.reference.messageId
      );
      isReply = repliedMsg.author.id === client.user.id;
    } catch {}
  }

  if (!isPing && !isReply) return;

  if (!message.content.toLowerCase().startsWith("disha")) return;

  const userText = message.content.replace(/^disha/i, "").trim();
  if (!userText) return;

  await message.channel.sendTyping();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: buildPrompt(userText) }],
        temperature: isNight() ? 0.9 : 0.6,
        max_tokens: 120
      })
    });

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "Hmm… thoda clearly bolo na 😌";

    await message.reply(reply);

  } catch (err) {
    console.error(err);
    message.reply("Acha sunna… thoda issue aa gaya 😔");
  }
});


/* 🚀 Ready */
client.once("ready", () => {
  console.log(`💖 Disha is online as ${client.user.tag}`);
});

client.login(DISCORD_TOKEN);
