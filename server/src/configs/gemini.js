import { GoogleGenAI } from "@google/genai";

// TODO: Move this key to GEMINI_API_KEY env var before production use.

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateWithGemini(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  return response.text
}

export default generateWithGemini;