
import { GoogleGenAI } from "@google/genai";
import { Car, Partner } from "../types";

// Always use a new instance to ensure we have the latest key if it changes
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export interface AdviceResult {
  text: string;
  sources: { title: string; uri: string }[];
}

export const getFinancialAdvice = async (cars: Car[], partners: Partner[]): Promise<AdviceResult> => {
  const ai = getAI();
  const dataSummary = {
    cars: cars.map(c => ({
      make: c.make,
      model: c.model,
      year: c.year,
      isSold: c.isSold,
      profit: c.isSold ? (c.sellingPrice - c.purchasePrice - c.expenses.reduce((sum, e) => sum + e.amount, 0)) : 0
    })),
    partners: partners.map(p => ({ name: p.name, split: p.splitPercentage }))
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this car sales partnership data and provide 3-4 specific financial insights. Use Google Search to check current used car market trends for 2024/2025 to see if our inventory selection matches high-demand vehicles. Data: ${JSON.stringify(dataSummary)}`,
      config: {
        systemInstruction: "You are an expert automotive business consultant. Use Google Search to provide grounded, real-time advice on market trends. Always return helpful, concise insights.",
        tools: [{ googleSearch: {} }]
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      .map(chunk => ({ title: chunk.web?.title || 'Source', uri: chunk.web?.uri || '' })) || [];

    return {
      text: response.text || "I couldn't generate advice at this time.",
      sources: sources
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Error connecting to advisor service. Please check your API configuration.", sources: [] };
  }
};

export const getMarketValue = async (car: Car): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `What is the current average private party sales price and dealer retail price for a ${car.year} ${car.make} ${car.model} in good condition? Provide a brief summary of its market desirability right now.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return response.text || "Market data unavailable.";
  } catch (error) {
    return "Could not fetch market data.";
  }
};
