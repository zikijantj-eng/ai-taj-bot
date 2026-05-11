import { generateImage } from "../gemini.js";

export async function handleImage(ctx, prompt) {
  const loadingMsg = await ctx.reply("🖼️ Акс сохта мешавад... Лутфан сабр кунед (10-30 сония)");

  try {
    const { b64_json, mimeType } = await generateImage(prompt);

    const imageBuffer = Buffer.from(b64_json, "base64");

    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});

    await ctx.replyWithPhoto(
      { source: imageBuffer },
      { caption: `🖼️ Промт: ${prompt}\n\n🤖 AI TAJ BOT` }
    );
  } catch (err) {
    console.error("Image error:", err);
    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
    await ctx.reply(
      "❌ Акс сохта нашуд.\n\n" +
      "Илтимос:\n" +
      "• Промтро ба англисӣ нависед\n" +
      "• Мазмуни дигар истифода кунед"
    );
  }
}
