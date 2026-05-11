import { chatWithGemini } from "../gemini.js";

const userHistories = new Map();
const MAX_HISTORY = 10;

export async function handleAI(ctx, text) {
  const userId = ctx.from.id;
  const history = userHistories.get(userId) || [];

  const loadingMsg = await ctx.reply("🤖 Ҷавоб тайёр мешавад...");

  try {
    const reply = await chatWithGemini(history, text);

    history.push(
      { role: "user", parts: [{ text }] },
      { role: "model", parts: [{ text: reply }] }
    );

    if (history.length > MAX_HISTORY * 2) {
      history.splice(0, 2);
    }

    userHistories.set(userId, history);

    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
    await ctx.reply(`🤖 ${reply}`);
  } catch (err) {
    console.error("AI error:", err);
    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
    await ctx.reply("❌ Хатогӣ рӯй дод. Баъдтар кӯшиш кунед.");
  }
}

export function clearHistory(userId) {
  userHistories.delete(userId);
}
