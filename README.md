# 🤖 AI TAJ BOT

Боти Telegram бо қобилиятҳои зер:
- 🤖 AI TAJ BOT — сӯҳбат бо Gemini
- 🖼️ Сохтани акс бо промт
- 📥 Скачати видео аз YouTube, TikTok, Instagram
- 🆔 Ёфтани ID

## Насб

```bash
npm install
```

## Танзим

Файли `.env` созед ва тағиротҳоро ворид кунед (намуна: `.env.example`)

## Оғоз

```bash
node src/index.js
```

## Railway Deploy

1. Лоиҳаро ба GitHub бор кунед
2. Railway.app-ро кушоед
3. "New Project" → "Deploy from GitHub repo"
4. Тағиротҳои муҳитро (`Environment Variables`) танзим кунед:
   - `BOT_TOKEN` — токени боти шумо
   - `CHANNEL_ID` — ID-и канал (-1003987833715)
   - `CHANNEL_USERNAME` — username-и канал (tutor_100k)
   - `GEMINI_API_KEY` — ключи Gemini аз aistudio.google.com

## Гирифтани Gemini API Key (Ройгон)

1. https://aistudio.google.com ба ин сайт равед
2. "Get API Key" пахш кунед
3. "Create API Key" пахш кунед
4. Ключро нусхабардорӣ кунед ва дар Railway Environment Variables гузоред
