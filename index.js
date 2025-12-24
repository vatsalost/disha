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
  if (message.author.bot) return;

  console.log("MESSAGE:", message.content);

  if (!message.content.toLowerCase().startsWith("disha")) return;

  await message.reply("Haan bolo 😌");
});

client.once("ready", () => {
  console.log(`Disha online as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
