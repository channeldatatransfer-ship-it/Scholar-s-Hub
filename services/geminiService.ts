
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

export const scholarChat = async (message: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[] = []) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Extract context from localStorage for a more personalized experience
  const syllabus = localStorage.getItem('scholars_syllabuses_v2') || '[]';
  const tasks = localStorage.getItem('scholars_tasks') || '[]';
  
  const systemInstruction = `You are Scholar AI, the student's personal Study Buddy. 
  Current context of the student:
  - Syllabus Progress: ${syllabus}
  - Active Tasks: ${tasks}

  Your goals:
  1. Help with academic questions (Science, Math, History, etc.).
  2. Help organize study sessions.
  3. Be encouraging, concise, and professional.
  4. If asked about their progress, use the provided Syllabus data to give insights (e.g., "You are 60% done with Physics!").
  5. Use Markdown for formatting (bold, bullet points).
  6. If the student seems overwhelmed, suggest a 5-minute break.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: [
      ...history,
      { role: 'user', parts: [{ text: message }] }
    ],
    config: {
      systemInstruction: systemInstruction,
    }
  });
  
  return response.text || "I'm sorry, I'm having trouble thinking right now. Could you repeat that?";
};
