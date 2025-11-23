
import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const chatWithGemini = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  imageBase64?: string
) => {
  const ai = getAiClient();
  
  // Prepare contents
  const contents = [
      ...history.map(h => ({ role: h.role, parts: h.parts })),
  ];

  const currentParts: any[] = [{ text: message }];

  if (imageBase64) {
    // Remove header data:image/jpeg;base64,
    const cleanBase64 = imageBase64.split(',')[1];
    currentParts.unshift({
      inlineData: {
        mimeType: 'image/jpeg',
        data: cleanBase64
      }
    });
  }

  // Add current user message
  contents.push({
      role: 'user',
      parts: currentParts
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents.map(c => ({
        role: c.role,
        parts: c.parts
    })),
    config: {
        systemInstruction: "You are a helpful, empathetic, and professional health assistant named 'LifePulse'. Provide clear, concise medical information but always include a disclaimer that you are an AI and not a doctor. Use Markdown for formatting.",
    }
  });

  return response.text;
};

export const analyzeMedicalReport = async (imageBase64: string): Promise<string> => {
  const ai = getAiClient();
  const cleanBase64 = imageBase64.split(',')[1];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
        parts: [
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: cleanBase64
                }
            },
            {
                text: "Analyze this medical report image. Extract the key test results. Return ONLY a JSON array where each object has: 'testName' (string), 'value' (string), 'unit' (string), 'status' (string: 'Normal' or 'Abnormal'), and 'explanation' (string, simplified for a layman). Do not wrap in markdown code blocks."
            }
        ]
    },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    testName: { type: Type.STRING },
                    value: { type: Type.STRING },
                    unit: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ["Normal", "Abnormal"] },
                    explanation: { type: Type.STRING }
                }
            }
        }
    }
  });

  return response.text || "[]";
};

export const analyzeSymptoms = async (data: { symptoms: string, duration: string, severity: number, history: string }): Promise<string> => {
  const ai = getAiClient();
  
  const prompt = `
    Act as a medical symptom checker. Analyze the following patient data:
    1. Main Symptoms: ${data.symptoms}
    2. Duration: ${data.duration}
    3. Severity (1-10): ${data.severity}
    4. Medical History: ${data.history}

    Based on this, provide a list of 3 potential conditions/causes.
    Return ONLY JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            condition: { type: Type.STRING, description: "Name of the potential condition" },
            probability: { type: Type.STRING, description: "Likelihood percentage or High/Medium/Low" },
            description: { type: Type.STRING, description: "Brief explanation of why this matches" },
            recommendation: { type: Type.STRING, description: "What the user should do next" },
            severity: { type: Type.STRING, enum: ["Low", "Moderate", "High"] }
          }
        }
      }
    }
  });

  return response.text || "[]";
};

export const checkDrugInteractions = async (medications: string[]): Promise<string> => {
    const ai = getAiClient();
    const prompt = `I am taking the following medications: ${medications.join(', ')}. Are there any known interactions between them? Please summarize briefly and highlight any warnings.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text || "No interactions found.";
};

export const getHealthInsights = async (metrics: any): Promise<string> => {
    const ai = getAiClient();
    const prompt = `Analyze these weekly health metrics: ${JSON.stringify(metrics)}. Provide a short, encouraging summary of improvements, 1 potential risk, and 1 actionable lifestyle suggestion. Keep it under 150 words.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text || "Keep up the good work!";
}
