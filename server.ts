import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Setup (Safe check)
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não configurada nas variáveis de ambiente.');
    }
    return new GoogleGenAI(apiKey);
  };

  // API Routes
  app.post('/api/mneme/analyze', async (req, res) => {
    const { items, supermarketName, travelPlans } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Itens inválidos.' });
    }

    const itemsText = items.map((i: any) => `- ${i.name} (${i.category})`).join('\n');
    const plansText = travelPlans && travelPlans.length > 0 
      ? `O usuário tem viagens planejadas para: ${travelPlans.map((p: any) => p.cityName).join(', ')}.`
      : 'O usuário não tem viagens mapeadas no momento.';

    // Base de dados de preços regional injetada no prompt
    const regionalDataPrompt = `
      BASE DE PREÇOS PATRONOS (VALORES ATUAIS):
      - Queijo Coalho Patriota: R$ 34,50 em Sanharó vs R$ 48,90 em Recife.
      - Arroz 5kg Atacadão Agreste: R$ 22,90 em Caruaru.
      - Frutas da Serra: Gravatá tem o melhor custo em Hortifruti nesta semana.
    `;
    
    try {
      const aiClient = getAi();
      const response = await aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' }).generateContent(`Você é o Consultor Mnēmē do ecossistema ECOBR232. 
        Analise a seguinte lista de compras para o supermercado ${supermarketName || 'Local'}:
        
        ${itemsText}

        ${regionalDataPrompt}
        
        CONTEXTO DE MOBILIDADE:
        ${plansText}
        
        MISSÃO:
        1. ANÁLISE DE NUTRIBILIDADE: Quão saudável/equilibrada é esta cesta para a família?
        2. ECONOMIA DE GUERRA (MENOR PREÇO): Identifique itens onde o preço é volátil e sugira onde encontrar o menor valor na malha da 232.
        3. QUALIDADE PATRONA (VALOR LOCAL): Priorize e sugira itens que podem ser comprados de "Patronos" do ecossistema ou produtores locais (ex: queijos artesanais, hortifruti direto do produtor). Explique o valor desse pertencimento.
        4. ARBITRAGEM DE PREÇO POR TRECHO: Se o usuário vai passar por outras cidades (como Gravatá, Caruaru, etc), recomende parar e comprar itens específicos lá. Use o contexto de viagens fornecido.
        5. OPORTUNIDADES LINDURAS: Verifique se itens da lista podem ser resolvidos via Classificados ou Feira local.
        
        Responda de forma concisa, técnica e em estilo Markdown. Use ícones como 📍 para cidades e 💰 para economia.`);

      res.json({ analysis: response.response.text() });
    } catch (error: any) {
      console.error('Gemini Error:', error);
      res.status(500).json({ error: error.message || 'Erro ao processar análise inteligente.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
