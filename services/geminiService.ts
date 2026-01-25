
import { GoogleGenAI, Type, Modality } from "@google/genai";

const MODEL_NAME = 'gemini-3-flash-preview';

export const executeCCode = async (code: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `You are a C Compiler simulator for HSC ICT students. 
  Execute the provided C code and return ONLY the resulting standard output (stdout). 
  If there are compilation errors, return the error message clearly. 
  Do not explain the code, just provide the output as if it were a terminal window.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: code,
    config: { systemInstruction }
  });

  return response.text || "Execution timed out.";
};

export const generateNotebookGuide = async (sources: string[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Based ONLY on the following source materials, generate a comprehensive study guide.
  Include: 
  1. A summary
  2. 5 Key FAQs
  3. A glossary of important terms.
  
  CRITICAL: Respond in Bengali (Bangla).
  Sources: ${sources.join("\n\n")}`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });

  return response.text || "";
};

export const chatWithNotebook = async (message: string, sources: string[], history: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `You are a helpful academic assistant. 
  Answer questions based primarily on the provided source materials. 
  If the information is not in the sources, say so but try to help using your general knowledge if appropriate. 
  Respond in Bengali (Bangla).
  
  SOURCES:
  ${sources.join("\n\n")}`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: [...history, { role: 'user', parts: [{ text: message }] }],
    config: { systemInstruction }
  });
  
  return response.text || "";
};

export const generateAudioOverview = async (content: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `TTS the following conversational discussion about this academic material between two podcasters, Joe and Jane. 
  They should sound excited and explain the concepts simply for a student.
  Joe: Hey Jane, did you see this chapter on ${content.substring(0, 50)}?
  Jane: I did! It's actually really fascinating how it works...
  
  Continue the dialogue for about 200 words summarizing the main points.
  The dialogue should be in English but can use Bengali terms for clarity.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            { speaker: 'Joe', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
            { speaker: 'Jane', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
          ]
        }
      }
    }
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

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

export const simplifyContent = async (content: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Explain this like I'm 5 years old in Bengali (Bangla):
    ${content}`,
  });
  return response.text || "";
};

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

export const fetchSyllabusForLevel = async (level: string, group: string = 'Science') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Act as an NCTB (National Curriculum and Textbook Board, Bangladesh) expert. 
  Find the latest official ${level} syllabus for the ${group} academic group in Bangladesh. 
  CRITICAL: Return subject names, chapter names, and a list of specific topics for each chapter.
  IMPORTANT: Return ALL text content (subjects, chapters, topics) in Bengali (Bangla).
  Your response must be a valid JSON array of objects.
  Format: [{"subject": "বিষয়", "chapters": [{"title": "অধ্যায়", "topics": ["টপিক ১", "টপিক ২"]}]}]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
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
                  },
                  required: ["title", "topics"]
                }
              }
            },
            required: ["subject", "chapters"]
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Syllabus fetch error:", e);
    return null;
  }
};

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
