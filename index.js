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

  let content = message.content.trim();

  // Check ping
  const botMention = `<@${client.user.id}>`;
  const botMentionNick = `<@!${client.user.id}>`;

  const isPing =
    content.startsWith(botMention) || content.startsWith(botMentionNick);

  // Check reply
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

  // Remove mention text if pinged
  if (isPing) {
    content = content
      .replace(botMention, "")
      .replace(botMentionNick, "")
      .trim();
  }

  // Require name trigger
  if (!content.toLowerCase().startsWith("disha")) return;

  console.log("TRIGGERED MESSAGE:", content);

  await message.reply("Haan sun rahi hoon 😌");
});

client.once("ready", () => {
  console.log(`Disha online as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
