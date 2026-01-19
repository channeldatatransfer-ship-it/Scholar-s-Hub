
import { GoogleGenAI, Type } from "@google/genai";

const MODEL_NAME = 'gemini-3-flash-preview';

export const generateQuizFromContent = async (content: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate a 5-question multiple choice quiz based on the following text. Each question should have 4 options and 1 correct answer.
    
    Content: ${content}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            correctAnswer: { type: Type.INTEGER, description: 'The index of the correct option (0-3)' }
          },
          required: ["question", "options", "correctAnswer"],
          propertyOrdering: ["question", "options", "correctAnswer"]
        }
      }
    }
  });

  const jsonStr = response.text || '[]';
  return JSON.parse(jsonStr.trim());
};

export const simplifyContent = async (content: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Explain the following text like I'm 5 years old. Keep it simple and use analogies if helpful:
    
    ${content}`,
  });
  
  return response.text || "";
};

export const scholarChat = async (message: string, context?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: message,
    config: {
      systemInstruction: "You are Scholar AI, a brilliant and friendly study tutor. You help students understand complex topics, stay motivated, and organize their studies. Be concise, encouraging, and academic but accessible. If the student asks about a subject you don't know, suggest they check their 'Resource Library'.",
    }
  });
  return response.text || "I'm sorry, I couldn't process that. Can you try rephrasing?";
};
