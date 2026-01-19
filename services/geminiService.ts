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

export const fetchSyllabusForLevel = async (level: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Specifically instructing to look for NCTB Bangladesh and the requested repo structure
  const prompt = `Search for the latest official NCTB ${level} Science group syllabus for Bangladesh. 
  Refer to resources like the 'study-progress-tracker' on GitHub or official NCTB documents.
  Extract the main chapters and topics for Physics 1st & 2nd, Chemistry 1st & 2nd, Biology 1st & 2nd, Higher Math 1st & 2nd, and ICT.
  Return ONLY a raw JSON array of objects.
  Structure: [{"subject": "Physics 1st Paper", "chapters": [{"title": "Vector", "topics": ["Definition", "Addition"]}]}]
  Ensure all chapters are included for a complete HSC/SSC track.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using pro for better extraction of large lists
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    // Use a regex to find the JSON array in case there's extra text
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Syllabus fetch error:", e);
    // Return a structured default if AI fails
    return null;
  }
};

export const scholarChat = async (message: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[] = []) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const syllabus = localStorage.getItem('scholars_syllabuses_v2') || '[]';
  const tasks = localStorage.getItem('scholars_tasks') || '[]';
  
  const systemInstruction = `You are Scholar AI, the student's personal Study Buddy for Bangladeshi students (NCTB Curriculum). 
  Current context:
  - Syllabus Progress: ${syllabus}
  - Active Tasks: ${tasks}

  Your goals:
  1. Help with academic questions (Science, Math, History, etc.).
  2. Help organize study sessions.
  3. Be encouraging, concise, and professional.
  4. Support both English and Bangla.
  5. Use Markdown for formatting.
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
  
  return response.text || "I'm sorry, I'm having trouble thinking right now.";
};