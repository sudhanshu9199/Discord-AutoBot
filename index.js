require("dotenv").config();
const { Client, GatewayIntentBits, AttachmentBuilder } = require("discord.js");
const { GoogleGenAI } = require("@google/genai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

async function generateImage(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      return buffer;
    }
  }
}

client.once("ready", () => {
  console.log("Bot is ready!");
});

client.on("messageCreate", async (message) => {
  console.log(`Message received: ${message.content}`);
  // message.reply("Hello! This is a response from the bot.");
  // console.log(message.member.user);
  // console.log(message.author);
  //   const attachments = message.attachments;
  // console.log(message);

  const isBot = message.author.bot;

  if (isBot) return;
  //   message.reply("Hello! How can I assist you today?");
  //   console.log(attachments);

  //   attachments.forEach((attachment) => {
  //     console.log(attachment.url);
  //   });

  const imageBuffer = await generateImage(message.content);

  if (imageBuffer) {
    const attachment = new AttachmentBuilder(imageBuffer, {
      name: "generated-image.png",
    });
    message.channel.send({ files: [attachment] });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
