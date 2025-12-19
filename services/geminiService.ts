
import { GoogleGenAI, Type } from "@google/genai";
import { StockAnalysis, InvestmentAction, RiskLevel } from "../types";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using the 'gemini-flash-lite-latest' model for high-speed, low-latency analysis.
const FAST_MODEL = 'gemini-flash-lite-latest';

/**
 * Utility to check if the Indian Stock Market (NSE/BSE) is currently open.
 */
export function isIndianMarketOpen(): boolean {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istDate = new Date(utc + (3600000 * 5.5));
  
  const day = istDate.getDay();
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  
  if (day === 0 || day === 6) return false;
  
  const timeInMinutes = hours * 60 + minutes;
  const openTime = 9 * 60 + 15;
  const closeTime = 15 * 60 + 30;
  
  return timeInMinutes >= openTime && timeInMinutes <= closeTime;
}

async function fetchWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const isTransient = (error as any)?.status === 429 || (error as any)?.status >= 500;
      if (!isTransient && attempt === 0) throw error;
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

function cleanNumericString(val: any): number {
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return 0;
  // Remove everything except digits and decimal point
  const cleaned = val.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Robust JSON extraction from model responses.
 * Handles markdown blocks, conversational text, and citation garbage.
 */
function extractJson(text: string): any {
  if (!text) throw new Error("Empty response from model");
  
  // 1. Remove Markdown code block markers
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  
  // 2. Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // 3. Find the first '{' and the last '}' to isolate the JSON object
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonSnippet = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonSnippet);
      } catch (innerE) {
        console.error("JSON Snippet extraction failed:", jsonSnippet);
      }
    }
    
    console.error("Failed to extract JSON from text:", text);
    throw new Error("Could not extract valid JSON from the market data source.");
  }
}

export async function fetchRealTimePrice(symbol: string): Promise<{ price: number; change: number }> {
  const ticker = symbol.includes('.') ? symbol : `${symbol}.NS`;
  const executeFetch = async () => {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Search for the current live price and percentage change of "${ticker}" on NSE/BSE. 
      Return ONLY a JSON object: {"price": number, "change": number}.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a real-time market data feed. Output ONLY valid raw JSON. No markdown, no prose, no conversational text."
      }
    });
    const data = extractJson(response.text || '{"price": 0, "change": 0}');
    return { price: cleanNumericString(data.price), change: cleanNumericString(data.change) };
  };
  try { return await fetchWithRetry(executeFetch); } catch (e) { return { price: 0, change: 0 }; }
}

export async function analyzeIndianStock(symbol: string): Promise<StockAnalysis> {
  const ticker = symbol.includes('.') ? symbol : `${symbol}.NS`;

  const prompt = `
    Conduct an aggressive, high-conviction analysis of the NSE/BSE stock: "${ticker}". 
    The user wants a CLEAR decision: Buy, Don't Buy (AVOID), Sell, or Hold.
    
    DECISION LOGIC (BE EXTREMELY DECISIVE):
    1. BUY: Stock is undervalued, has strong momentum, or clear technical breakout.
    2. SELL: Overvalued, technical breakdown, or negative corporate governance.
    3. AVOID: High risk, poor fundamentals, or better opportunities exist elsewhere.
    4. HOLD: Only if the stock is exactly at fair value with stable technicals.

    If you are unsure, default to SELL or AVOID rather than HOLD.
    
    Return JSON:
    {
      "symbol": string,
      "companyName": string,
      "currentPrice": number,
      "currency": "INR",
      "action": "BUY" | "HOLD" | "SELL" | "AVOID",
      "riskLevel": "LOW" | "MEDIUM" | "HIGH",
      "confidenceScore": number,
      "summary": string,
      "suggestedEntryRange": string,
      "fundamentals": { 
        "peRatio": number, 
        "pbRatio": number, 
        "roe": number, 
        "roce": number, 
        "debtToEquity": number, 
        "operatingMargin": number, 
        "promoterHolding": number, 
        "institutionalHolding": number 
      },
      "technicals": { 
        "supportLevels": number[], 
        "resistanceLevels": number[], 
        "trend": string, 
        "rsi": number 
      },
      "pros": string[], 
      "cons": string[],
      "longTermOutlook": string, 
      "shortTermOutlook": string
    }
  `;

  const executeAnalysis = async () => {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a sharp, opinionated Indian Stock Analyst. Provide bold and data-backed advice. Do not be neutral. Your response must be 100% valid JSON and nothing else."
      }
    });
    
    const rawData = extractJson(response.text || '{}');
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Market Intelligence',
      url: chunk.web?.uri || '#'
    })) || [];
    
    return { 
      ...rawData, 
      currentPrice: cleanNumericString(rawData.currentPrice), 
      sources 
    };
  };

  return await fetchWithRetry(executeAnalysis, 2);
}
