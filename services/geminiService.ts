
import { GoogleGenAI, Type } from "@google/genai";

const MODEL_NAME = 'gemini-3-flash-preview';

// Fix: Implemented generateTemplateFromAi using GoogleGenAI
export const generateTemplateFromAi = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `You are a curriculum expert for Bangladeshi students (NCTB). 
  Generate a comprehensive study blueprint. 
  CRITICAL: Always provide subject names, chapter titles, and topics in Bengali (Bangla), even if the prompt is in English.
  Return a JSON object with:
  1. title: A catchy name in Bengali.
  2. subjects: Array of objects { subject: string, chapters: [{ title: string, topics: [string] }] }
  3. schedule: Array of milestones (e.g., "দিন ১", "দিন ৩").
  Follow NCTB standards strictly.`;

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

// Fix: Implemented identifyConceptRelationships using GoogleGenAI
export const identifyConceptRelationships = async (concepts: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const conceptTitles = concepts.map(c => c.title).join(', ');
  
  const prompt = `Given these concepts: [${conceptTitles}], identify logical relationships. 
  Always use Bengali for the descriptions.
  Return a JSON array: [{ "concept": "Title", "prerequisite": "Title", "related": ["Title"], "importance": "high|medium|low" }]`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            concept: { type: Type.STRING },
            prerequisite: { type: Type.STRING },
            related: { type: Type.ARRAY, items: { type: Type.STRING } },
            importance: { type: Type.STRING }
          },
          required: ["concept", "importance"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

// Fix: Implemented getStudyAdvise using GoogleGenAI
export const getStudyAdvise = async (syllabusData: string, focusData: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Analyze this progress and provide 3 actionable study tips. 
    IMPORTANT: Provide advice in Bengali (Bangla). 
    Progress: ${syllabusData}
    Focus: ${focusData}`,
  });
  return response.text || "পড়াশোনা চালিয়ে যাও, স্কলার!";
};

// Fix: Implemented autoScheduleEvents using GoogleGenAI
export const autoScheduleEvents = async (syllabus: string, existingEvents: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze syllabus and schedule. Suggest 3 study sessions. 
    Use Bengali for event titles.
    Syllabus: ${syllabus}
    Current Events: ${existingEvents}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            time: { type: Type.STRING },
            date: { type: Type.STRING }
          },
          required: ["title", "category", "time", "date"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

// Fix: Implemented generateQuizFromContent using GoogleGenAI
export const generateQuizFromContent = async (content: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate a 5-question MC quiz. CRITICAL: The quiz MUST be in Bengali (Bangla).
    Content: ${content}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER }
          },
          required: ["question", "options", "correctAnswer"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

// Fix: Implemented simplifyContent using GoogleGenAI
export const simplifyContent = async (content: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Explain this like I'm 5 years old in Bengali (Bangla):
    ${content}`,
  });
  return response.text || "";
};

// Fix: Implemented scholarChat using GoogleGenAI
export const scholarChat = async (message: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[] = []) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `You are Scholar AI, an academic expert for Bangladeshi students (NCTB). 
  CRITICAL: Always respond in Bengali (Bangla). Help with HSC/SSC preparation, explain complex topics, and be encouraging.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: [...history, { role: 'user', parts: [{ text: message }] }],
    config: { systemInstruction }
  });
  return response.text || "দুঃখিত, আমি এখন উত্তর দিতে পারছি না।";
};

// Fix: Implemented fetchSyllabusForLevel using GoogleGenAI with Google Search
export const fetchSyllabusForLevel = async (level: string, group: string = 'Science') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Act as an NCTB expert. Fetch the ${level} syllabus for ${group} group. 
  CRITICAL: Return everything (subjects, chapters, topics) in Bengali.
  Format: [{"subject": "বিষয়", "chapters": [{"title": "অধ্যায়", "topics": ["টপিক"]}]}]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });
    const text = response.text || '';
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
  } catch (e) {
    return null;
  }
};

/**
 * Fix: Added missing export for generateConceptImage.
 * Uses gemini-2.5-flash-image to create an educational illustration for concepts in the vault.
 */
export const generateConceptImage = async (title: string, content: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `Create a clean, minimalist, professional educational illustration for the concept: "${title}". Description: ${content}. The image should be clear and suitable for an academic app with a white background and no text.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  if (response.candidates && response.candidates.length > 0) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }
  return null;
};
