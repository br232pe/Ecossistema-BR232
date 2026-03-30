import { GoogleGenAI, Type } from "@google/genai";
import { MnemeItem } from './types';
import { CONFIG, checkSystemStatus } from './src/config';

// Executa o check de sistema na inicialização
checkSystemStatus();

const apiKey = CONFIG.GEMINI_API_KEY;

// Inicialização segura
let ai: GoogleGenAI | null = null;
try {
  if (apiKey && apiKey.length > 5) { // Validação básica de string não vazia
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.warn("Erro ao inicializar GoogleGenAI:", e);
}

/**
 * DADOS DA FUNDAÇÃO (MOCK DATA)
 */
const MOCK_SCREENING = {
  economy: "Comércio de beira de estrada aquecido com o fluxo de fim de semana. Oficinas em Gravatá operando com 90% de ocupação.",
  events: "Feira de Caruaru com alta movimentação. Festival de Inverno de Garanhuns (FIG) gerando expectativa na rede hoteleira.",
  pulse: "Vibração positiva. Motoristas relatando boa fluidez na Serra das Russas, apesar da neblina noturna.",
  opportunities: "Alta demanda por fretes fracionados para o Polo de Confecções. Vagas para mecânicos diesel em Vitória de Santo Antão."
};

const MOCK_ROAD_NEWS = {
  summary: "Monitoramento da Fundação: Fluxo intenso mas fluido na Serra das Russas. Atenção para neblina densa entre os KMs 70 e 80 após as 18h.",
  sources: [
    { title: "Boletim PRF - BR232", uri: "#" },
    { title: "Clima Tempo - Agreste", uri: "#" }
  ]
};

const MOCK_ROAD_STATUS = {
  status: "Atenção",
  color: "#eab308", // Yellow
  advice: "Reduza a velocidade na descida da Serra. Pista úmida."
};

const MOCK_ETHICS_SCORE = 0.92;

/**
 * Screening Comunitário: Analisa a 'Vida' de uma cidade.
 */
export const performCommunityScreening = async (cityName: string): Promise<any> => {
  if (!ai) return { ...MOCK_SCREENING, economy: `Análise local (Fundação) de ${cityName}: ${MOCK_SCREENING.economy}` };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Faça um 'Screening' rápido da cidade de ${cityName}, Pernambuco, na BR-232. 
      Retorne JSON com: economy, events, pulse, opportunities.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            economy: { type: Type.STRING },
            events: { type: Type.STRING },
            pulse: { type: Type.STRING },
            opportunities: { type: Type.STRING }
          },
          required: ["economy", "events", "pulse", "opportunities"]
        }
      },
    });
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.warn("API Offline ou Erro, usando dados da Fundação.");
    return { ...MOCK_SCREENING, economy: `(Modo Fundação) ${cityName}: ${MOCK_SCREENING.economy}` };
  }
};

/**
 * Notícias em Tempo Real da Rodovia
 */
export const getRealTimeRoadNews = async (): Promise<{ summary: string; sources: { title: string; uri: string }[] }> => {
  if (!ai) return MOCK_ROAD_NEWS;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Modelo rápido para notícias
      contents: `Resumo curto sobre o trânsito atual na BR-232 Pernambuco.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    
    const summary = response.text || MOCK_ROAD_NEWS.summary;
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    return { summary, sources: sources.length > 0 ? sources : MOCK_ROAD_NEWS.sources };
  } catch (error) {
    return MOCK_ROAD_NEWS;
  }
};

/**
 * MNĒMĒ: Gera lista de compras inteligente baseada em contexto
 */
export const generateSmartShoppingList = async (prompt: string): Promise<{ items: MnemeItem[], tips: string }> => {
  if (!ai) {
    return {
       items: [
         { id: 'm1', name: 'Carvão (5kg)', category: 'Churrasco', quantity: 1, unit: 'saco', checked: false, estimatedPrice: 15.00 },
         { id: 'm2', name: 'Picanha (1kg)', category: 'Churrasco', quantity: 2, unit: 'kg', checked: false, estimatedPrice: 120.00 },
         { id: 'm3', name: 'Cerveja (Lata)', category: 'Bebidas', quantity: 24, unit: 'un', checked: false, estimatedPrice: 80.00 }
       ],
       tips: "Modo Offline: Lista básica gerada. Conecte-se para sugestões sazonais."
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Atue como um assistente de compras para a região Nordeste/BR-232. 
      Gere uma lista de compras baseada neste pedido: "${prompt}".
      Considere produtos típicos de Pernambuco se aplicável.
      Retorne JSON com array de items e uma string 'tips' com dicas de economia ou sazonalidade.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  estimatedPrice: { type: Type.NUMBER }
                }
              }
            },
            tips: { type: Type.STRING }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    // Adiciona IDs e estado inicial
    const items = (data.items || []).map((i: any) => ({
      ...i,
      id: Math.random().toString(36).substr(2, 9),
      checked: false
    }));

    return { items, tips: data.tips || "Boas compras!" };
  } catch (e) {
    console.error("Mnēmē AI Error:", e);
    return { items: [], tips: "Erro ao consultar a IA." };
  }
};

export const analyzePilotFeedback = async (feedbacks: string[]): Promise<number> => {
  return MOCK_ETHICS_SCORE; 
};

export const analyzeRoadStatus = async (alerts: any[]): Promise<any> => {
  return MOCK_ROAD_STATUS;
};