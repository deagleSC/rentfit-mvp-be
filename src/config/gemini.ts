import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️  GEMINI_API_KEY is not defined. AI features will not work.');
}

export const geminiAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
