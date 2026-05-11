import { GoogleGenAI, Modality } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY ё AI_INTEGRATIONS_GEMINI_API_KEY лозим аст!");
}

const clientOptions = { apiKey };
if (baseUrl) {
  clientOptions.httpOptions = { apiVersion: "", baseUrl };
}

export const ai = new GoogleGenAI(clientOptions);

export async function chatWithGemini(history, userMessage) {
  const contents = [
    ...history,
    { role: "user", parts: [{ text: userMessage }] }
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
    config: {
      systemInstruction: "Шумо AI TAJ BOT ҳастед — ёрдамчии зирак ба забони тоҷикӣ ва русӣ. Ба саволҳо бо забони тоҷикӣ ё ҳамон забоне ки корбар навишт ҷавоб диҳед. Ҷавобҳои шумо мухтасар, фаҳмо ва муфид бошад.",
      maxOutputTokens: 8192,
    }
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.text || "Ҷавобе пайдо нашуд.";
}

export async function generateImage(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    }
  });

  const candidate = response.candidates?.[0];
  const imagePart = candidate?.content?.parts?.find(part => part.inlineData);

  if (!imagePart?.inlineData?.data) {
    throw new Error("Акс сохта нашуд");
  }

  return {
    b64_json: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType || "image/jpeg"
  };
}
