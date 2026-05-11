export async function handleGetId(ctx) {
  const lines = [];

  const msg = ctx.message;
  const from = ctx.from;

  lines.push("🆔 <b>ID маълумот:</b>\n");

  lines.push(`👤 <b>Шумо:</b>`);
  lines.push(`  ID: <code>${from.id}</code>`);
  lines.push(`  Ном: ${from.first_name}${from.last_name ? " " + from.last_name : ""}`);
  if (from.username) lines.push(`  Username: @${from.username}`);

  const chat = ctx.chat;
  if (chat.id !== from.id) {
    lines.push(`\n💬 <b>Чат/Канал/Гурӯҳ:</b>`);
    lines.push(`  ID: <code>${chat.id}</code>`);
    lines.push(`  Ном: ${chat.title || chat.first_name || "—"}`);
    if (chat.username) lines.push(`  Username: @${chat.username}`);
    lines.push(`  Намуд: ${getChatType(chat.type)}`);
  }

  if (msg?.forward_origin) {
    const origin = msg.forward_origin;
    lines.push(`\n↪️ <b>Форвард аз:</b>`);

    if (origin.type === "user") {
      const u = origin.sender_user;
      lines.push(`  ID: <code>${u.id}</code>`);
      lines.push(`  Ном: ${u.first_name}${u.last_name ? " " + u.last_name : ""}`);
      if (u.username) lines.push(`  Username: @${u.username}`);
    } else if (origin.type === "channel") {
      const ch = origin.chat;
      lines.push(`  ID: <code>${ch.id}</code>`);
      lines.push(`  Ном: ${ch.title}`);
      if (ch.username) lines.push(`  Username: @${ch.username}`);
      if (origin.message_id) lines.push(`  Message ID: <code>${origin.message_id}</code>`);
    } else if (origin.type === "hidden_user") {
      lines.push(`  Ном: ${origin.sender_user_name} (пинҳон)`);
    } else if (origin.type === "chat") {
      const ch = origin.sender_chat;
      lines.push(`  ID: <code>${ch.id}</code>`);
      lines.push(`  Ном: ${ch.title}`);
      if (ch.username) lines.push(`  Username: @${ch.username}`);
    }
  }

  if (msg?.reply_to_message) {
    const replied = msg.reply_to_message;
    lines.push(`\n↩️ <b>Ҷавоб ба паём:</b>`);
    lines.push(`  Message ID: <code>${replied.message_id}</code>`);
    if (replied.from) {
      lines.push(`  Фиристандаи: <code>${replied.from.id}</code>`);
      if (replied.from.username) lines.push(`  @${replied.from.username}`);
    }
  }

  lines.push(`\n📨 <b>Message ID:</b> <code>${msg?.message_id || "—"}</code>`);

  await ctx.reply(lines.join("\n"), { parse_mode: "HTML" });
}

function getChatType(type) {
  const types = {
    private: "Шахсӣ",
    group: "Гурӯҳ",
    supergroup: "Супергурӯҳ",
    channel: "Канал"
  };
  return types[type] || type;
}
