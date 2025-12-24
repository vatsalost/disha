import { Client, GatewayIntentBits } from "discord.js";
import express from "express";

const app = express();
app.get("/", (req, res) => res.send("Alive"));
app.listen(3000, () => console.log("Keep-alive server running"));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("messageCreate", async (message) => {
  console.log("MESSAGE RECEIVED:", message.content);

  if (message.author.bot) return;

  if (message.content.toLowerCase().includes("disha")) {
    await message.reply("Haan sun rahi hoon 👀");
  }
});

client.once("ready", () => {
  console.log(`Bot online as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
