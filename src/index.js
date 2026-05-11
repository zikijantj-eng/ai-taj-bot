import { Telegraf, Markup } from "telegraf";
import { message } from "telegraf/filters";
import { createServer } from "http";
import * as dotenv from "dotenv";
dotenv.config();

import { checkSubscription, subscriptionMessage, subscriptionButtons } from "./utils/subscription.js";
import { handleAI, clearHistory } from "./handlers/ai.js";
import { handleImage } from "./handlers/image.js";
import { handleVideo } from "./handlers/video.js";
import { handleGetId } from "./handlers/getId.js";

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID || "-1003987833715";
const CHANNEL_USERNAME = process.env.CHANNEL_USERNAME || "tutor_100k";

if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN лозим аст!");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

const userStates = new Map();

async function isSubscribed(userId) {
  return checkSubscription(bot, userId, CHANNEL_ID);
}

async function sendSubscribePrompt(ctx) {
  await ctx.reply(
    subscriptionMessage(CHANNEL_USERNAME),
    { reply_markup: subscriptionButtons(CHANNEL_USERNAME) }
  );
}

async function showMainMenu(ctx) {
  const name = ctx.from.first_name || "Корбар";
  await ctx.reply(
    `👋 Хуш омадед, ${name}!\n\n🤖 <b>AI TAJ BOT</b> — боти зирак бо қобилиятҳои зер:\n\n` +
    `🤖 AI TAJ BOT — Сӯҳбати зирак бо Gemini\n` +
    `🖼️ Акс созед — Сохтани акс бо промт\n` +
    `📥 Видео Скачат — YouTube • TikTok • Instagram\n` +
    `🆔 ID Ёбед — ID-и чат, канал, корбар\n\n` +
    `Яке аз тугмаҳоро пахш кунед 👇`,
    {
      parse_mode: "HTML",
      reply_markup: {
        keyboard: [
          [{ text: "🤖 AI TAJ BOT" }, { text: "🖼️ Акс созед" }],
          [{ text: "📥 Видео Скачат" }, { text: "🆔 ID Ёбед" }]
        ],
        resize_keyboard: true
      }
    }
  );
}

bot.start(async (ctx) => {
  const subscribed = await isSubscribed(ctx.from.id);
  if (!subscribed) {
    await sendSubscribePrompt(ctx);
    return;
  }
  userStates.set(ctx.from.id, "menu");
  await showMainMenu(ctx);
});

bot.command("menu", async (ctx) => {
  const subscribed = await isSubscribed(ctx.from.id);
  if (!subscribed) {
    await sendSubscribePrompt(ctx);
    return;
  }
  userStates.set(ctx.from.id, "menu");
  await showMainMenu(ctx);
});

bot.command("id", async (ctx) => {
  await handleGetId(ctx);
});

bot.action("check_sub", async (ctx) => {
  await ctx.answerCbQuery();
  const subscribed = await isSubscribed(ctx.from.id);
  if (subscribed) {
    await ctx.editMessageText("✅ ШУМО БА КАНАЛ ОБУНА ШУДЕД!");
    userStates.set(ctx.from.id, "menu");
    await showMainMenu(ctx);
  } else {
    await ctx.editMessageText(
      `❌ ШУМО БА КАНАЛ ОБУНА НАШУДАЕД!\n\n👉 https://t.me/${CHANNEL_USERNAME}`,
      {
        reply_markup: subscriptionButtons(CHANNEL_USERNAME)
      }
    );
  }
});

bot.on(message("text"), async (ctx) => {
  const subscribed = await isSubscribed(ctx.from.id);
  if (!subscribed) {
    await sendSubscribePrompt(ctx);
    return;
  }

  const text = ctx.message.text;
  const userId = ctx.from.id;
  const state = userStates.get(userId) || "menu";

  if (text === "🤖 AI TAJ BOT") {
    userStates.set(userId, "ai");
    clearHistory(userId);
    await ctx.reply(
      "🤖 <b>AI TAJ BOT фаъол аст!</b>\n\n" +
      "Ҳар саволеро ки мехоҳед бипурсед.\n\n" +
      "📌 /menu — барои бозгашт ба меню",
      { parse_mode: "HTML" }
    );
    return;
  }

  if (text === "🖼️ Акс созед") {
    userStates.set(userId, "image");
    await ctx.reply(
      "🖼️ <b>Сохтани акс</b>\n\n" +
      "Тасвири аксро нависед (Тоҷикӣ ё Англисӣ):\n\n" +
      "Намунаҳо:\n" +
      "• Паланги зебо дар ҷангал\n" +
      "• A beautiful mountain sunset\n" +
      "• Кӯҳҳои Тоҷикистон бо барф\n\n" +
      "📌 /menu — барои бозгашт ба меню",
      { parse_mode: "HTML" }
    );
    return;
  }

  if (text === "📥 Видео Скачат") {
    userStates.set(userId, "video");
    await ctx.reply(
      "📥 <b>Скачати видео</b>\n\n" +
      "Силкаи видеоро ворид кунед:\n\n" +
      "✅ YouTube\n" +
      "✅ TikTok\n" +
      "✅ Instagram\n\n" +
      "📌 /menu — барои бозгашт ба меню",
      { parse_mode: "HTML" }
    );
    return;
  }

  if (text === "🆔 ID Ёбед") {
    userStates.set(userId, "id");
    await ctx.reply(
      "🆔 <b>ID Ёбед</b>\n\n" +
      "Чӣ кор кунед:\n" +
      "• Паёми касеро форвард кунед — ID-и онро мегирем\n" +
      "• /id навиштан — ID-и худро мегиред\n" +
      "• Ин ҷо ID-и шумо: <code>" + ctx.from.id + "</code>\n\n" +
      "📌 /menu — барои бозгашт ба меню",
      { parse_mode: "HTML" }
    );
    return;
  }

  if (state === "ai") {
    await handleAI(ctx, text);
    return;
  }

  if (state === "image") {
    await handleImage(ctx, text);
    return;
  }

  if (state === "video") {
    await handleVideo(ctx, text);
    return;
  }

  if (state === "id") {
    await handleGetId(ctx);
    return;
  }

  await showMainMenu(ctx);
});

bot.on(message("forward_origin"), async (ctx) => {
  const subscribed = await isSubscribed(ctx.from.id);
  if (!subscribed) {
    await sendSubscribePrompt(ctx);
    return;
  }
  await handleGetId(ctx);
});

bot.catch((err, ctx) => {
  console.error(`Bot error for ${ctx?.updateType}:`, err.message);
});

const PORT = process.env.PORT || 3000;
const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("🤖 AI TAJ BOT is running!");
});
server.listen(PORT, () => console.log(`Health server on port ${PORT}`));

bot.launch({ dropPendingUpdates: true })
  .then(() => console.log("🤖 AI TAJ BOT запуск шуд!"))
  .catch(err => {
    console.error("Bot launch error:", err);
    process.exit(1);
  });

process.once("SIGINT", () => { bot.stop("SIGINT"); server.close(); });
process.once("SIGTERM", () => { bot.stop("SIGTERM"); server.close(); });
