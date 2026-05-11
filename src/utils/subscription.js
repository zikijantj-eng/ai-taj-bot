export async function checkSubscription(bot, userId, channelId) {
  try {
    const member = await bot.telegram.getChatMember(channelId, userId);
    const allowedStatuses = ["member", "administrator", "creator"];
    return allowedStatuses.includes(member.status);
  } catch (err) {
    console.error("Subscription check error:", err.message);
    return false;
  }
}

export function subscriptionMessage(channelUsername) {
  return `⚠️ АВВАЛ БА КАНАЛ ОБУНА ШАВЕД ↗️\n\n👉 https://t.me/${channelUsername}`;
}

export function subscriptionButtons(channelUsername) {
  return {
    inline_keyboard: [
      [{ text: "📢 Ба Канал Рафтан", url: `https://t.me/${channelUsername}` }],
      [{ text: "САНҶИШ 🔁", callback_data: "check_sub" }]
    ]
  };
}
