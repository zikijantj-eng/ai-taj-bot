import { execFile } from "child_process";
import { promisify } from "util";
import { unlinkSync, existsSync, statSync } from "fs";
import { tmpdir } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));

const YTDLP_PATH = join(__dirname, "../../bin/yt-dlp");
const MAX_SIZE_MB = 45;

function detectPlatform(url) {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
  if (url.includes("tiktok.com")) return "TikTok";
  if (url.includes("instagram.com")) return "Instagram";
  return "Видео";
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function handleVideo(ctx, url) {
  if (!isValidUrl(url)) {
    await ctx.reply(
      "❌ Силкаи нодуруст!\n\n" +
      "Намунаҳо:\n" +
      "• https://youtube.com/watch?v=...\n" +
      "• https://tiktok.com/@.../video/...\n" +
      "• https://instagram.com/p/..."
    );
    return;
  }

  const platform = detectPlatform(url);
  const loadingMsg = await ctx.reply(`📥 ${platform} аз видео скачат мешавад... ⏳`);

  const tmpFile = join(tmpdir(), `vid_${randomBytes(8).toString("hex")}.mp4`);

  try {
    const ytdlpBin = existsSync(YTDLP_PATH) ? YTDLP_PATH : "yt-dlp";

    await execFileAsync(ytdlpBin, [
      url,
      "-o", tmpFile,
      "-f", "best[ext=mp4][filesize<45M]/best[ext=mp4]/best",
      "--no-playlist",
      "--no-warnings",
      "--merge-output-format", "mp4",
      "--max-filesize", "45m",
    ], { timeout: 120000 });

    if (!existsSync(tmpFile)) {
      throw new Error("Файл сохта нашуд");
    }

    const fileSizeMB = statSync(tmpFile).size / (1024 * 1024);

    if (fileSizeMB > MAX_SIZE_MB) {
      unlinkSync(tmpFile);
      await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
      await ctx.reply(
        `❌ Файл хеле калон аст (${fileSizeMB.toFixed(0)} MB).\n` +
        "Telegram танҳо то 50MB қабул мекунад.\n" +
        "Видеои кӯтоҳтар интихоб кунед."
      );
      return;
    }

    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
    await ctx.replyWithVideo(
      { source: tmpFile },
      { caption: `✅ ${platform} аз скачат шуд!\n🤖 AI TAJ BOT` }
    );
  } catch (err) {
    console.error("Video error:", err.message);
    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
    await ctx.reply(
      "❌ Видео скачат нашуд.\n\n" +
      "Сабабҳои эҳтимолӣ:\n" +
      "• Видео хусусӣ аст\n" +
      "• Силка нодуруст аст\n" +
      "• Видео дастрас нест\n\n" +
      "Силкаи дигар кӯшиш кунед."
    );
  } finally {
    if (existsSync(tmpFile)) {
      try { unlinkSync(tmpFile); } catch {}
    }
  }
}
