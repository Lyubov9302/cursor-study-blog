import { GoogleGenAI } from "@google/genai";

// TODO: Move this key to GEMINI_API_KEY env var before production use.
const GEMINI_API_KEY = 'AIzaSyBr9TCQ54dVVVBgSbVHgYQNIlT9bwNOTOI'
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function generateWithGemini(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  return response.text
}

export default generateWithGemini;