
import { GoogleGenAI, Type } from "@google/genai";

const MODEL_NAME = 'gemini-3-flash-preview';

export const generateTemplateFromAi = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `You are a curriculum expert for Bangladeshi students. 
  Generate a comprehensive study blueprint based on the user's request.
  Return a JSON object with:
  1. title: A catchy name for the template.
  2. subjects: Array of objects { subject: string, chapters: [{ title: string, topics: [string] }] }
  3. schedule: Array of 5-7 key milestone dates (as relative days, e.g., "Day 1", "Day 3").
  Ensure it follows the NCTB (National Curriculum and Textbook Board) standards where applicable.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subjects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                chapters: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      topics: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  }
                }
              }
            }
          },
          schedule: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "subjects", "schedule"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateConceptImage = async (conceptTitle: string, description: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `A clear, high-quality educational diagram or visual aid for the scientific/academic concept: "${conceptTitle}". Context: ${description}. Style: Minimalist, clean 3D illustration or flat educational vector, white background, informative and accurate.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

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

export const fetchSyllabusForLevel = async (level: string, group: string = 'Science') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Search for the latest official NCTB ${level} ${group} group syllabus for Bangladesh. 
  Focus on identifying all major subjects for this profile.
  Refer to resources like the 'study-progress-tracker' on GitHub for structure if needed.
  Extract the main chapters and topics for all relevant subjects.
  Return ONLY a raw JSON array of objects.
  Structure: [{"subject": "Subject Name", "chapters": [{"title": "Chapter Title", "topics": ["Topic 1", "Topic 2"]}]}]
  Ensure the syllabus is comprehensive for a complete 2-year cycle.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Syllabus fetch error:", e);
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
