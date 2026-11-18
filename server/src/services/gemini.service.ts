
import { GoogleGenAI } from '@google/genai';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  return new GoogleGenAI({ apiKey });
}

export async function generateGeminiResponse(
  prompt: string
): Promise<string> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
   model: 'gemini-3.5-flash-lite',
    contents: prompt,
  });

  const text = response.text;

  if (!text) {
    throw new Error('Gemini returned an empty response');
  }

  return text;
}
