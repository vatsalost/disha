import { Client, GatewayIntentBits } from "discord.js";
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

/* 🌐 Keep-alive server */
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

/* 🕒 Night detection */
function isNight() {
  const hour = new Date().getHours();
  return hour >= 21 || hour <= 5;
}

/* 🧠 AI Prompt */
function buildPrompt(userMessage) {
  const mood = isNight()
    ? "Flirty, teasing, confident, playful (night vibe)"
    : "Sweet, caring, emotionally warm (day vibe)";

  return `
You are a female companion named Disha in a Discord server.

Language:
- Hinglish (Hindi + English mix)

Personality:
- Romantic, caring, affectionate
- Gentle teasing, playful confidence
- Modern Indian girl vibe

Current mood:
${mood}

STRICT RULES:
- No explicit sexual content
- No sexual actions or graphic descriptions
- Keep flirting classy and safe
- If user crosses limits, redirect sweetly

Style:
- Short replies (1–3 lines)
- Natural Hinglish
- Emojis allowed 😌✨💫
- Pet words like "hmm", "acha", "sunna"

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

  let content = message.content.trim();

  const botMention = `<@${client.user.id}>`;
  const botMentionNick = `<@!${client.user.id}>`;

  const isPing =
    content.startsWith(botMention) || content.startsWith(botMentionNick);

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

  if (isPing) {
    content = content
      .replace(botMention, "")
      .replace(botMentionNick, "")
      .trim();
  }

  if (!content.toLowerCase().startsWith("disha")) return;

  const userText = content.replace(/^disha/i, "").trim();
  if (!userText) return;

  await message.channel.sendTyping();

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.AI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: buildPrompt(userText) }
          ],
          temperature: isNight() ? 0.9 : 0.6,
          max_tokens: 120
        })
      }
    );

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

client.login(process.env.DISCORD_TOKEN);
