
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Always initialize GoogleGenAI with { apiKey: process.env.API_KEY } directly inside or before calling functions.
// As per guidelines, we use gemini-3-flash-preview for basic text tasks.

export const generateNewsletter = async (products: Product[]) => {
  // Use process.env.API_KEY directly as required.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Fix: use correct property names from Product interface (NazwaProduktu, CenaBazowa, Jednostka)
  const productList = products.map(p => `${p.NazwaProduktu}: ${p.CenaBazowa} zł / ${p.Jednostka}`).join('\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Przygotuj profesjonalny, ale prosty newsletter tekstowy dla klientów hurtowni warzyw i owoców "Firma X". 
    Poinformuj o nowych promocjach. Oto lista produktów i cen:\n${productList}\n
    Newsletter powinien być zachęcający i zawierać dane kontaktowe (użyj placeholderów).`,
    config: {
      temperature: 0.7,
      topP: 0.95,
    },
  });

  return response.text || "Nie udało się wygenerować newslettera.";
};

export const analyzeClientPotential = async (clientData: any) => {
  // Use process.env.API_KEY directly as required.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Przeanalizuj następujące dane klienta i zasugeruj kolejne kroki sprzedażowe: ${JSON.stringify(clientData)}`,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING },
                nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                riskLevel: { type: Type.STRING, description: "Low, Medium, High" }
            },
            required: ["summary", "nextSteps", "riskLevel"]
        }
    }
  });
  
  // Directly access .text property from the response object
  const text = response.text;
  return JSON.parse(text?.trim() || '{}');
};
