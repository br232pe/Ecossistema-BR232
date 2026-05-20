"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = Number(process.env.PORT) || 3e3;
  app.use(import_express.default.json());
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY n\xE3o configurada nas vari\xE1veis de ambiente.");
    }
    return new import_genai.GoogleGenAI(apiKey);
  };
  app.get("/health", (_req, res) => {
    res.status(200).send("OK");
  });
  app.post("/api/mneme/analyze", async (req, res) => {
    const { items, supermarketName, travelPlans } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Itens inv\xE1lidos." });
    }
    const itemsText = items.map((i) => `- ${i.name} (${i.category})`).join("\n");
    const plansText = travelPlans && travelPlans.length > 0 ? `O usu\xE1rio tem viagens planejadas para: ${travelPlans.map((p) => p.cityName).join(", ")}.` : "O usu\xE1rio n\xE3o tem viagens mapeadas no momento.";
    const regionalDataPrompt = `
      BASE DE PRE\xC7OS PATRONOS (VALORES ATUAIS):
      - Queijo Coalho Patriota: R$ 34,50 em Sanhar\xF3 vs R$ 48,90 em Recife.
      - Arroz 5kg Atacad\xE3o Agreste: R$ 22,90 em Caruaru.
      - Frutas da Serra: Gravat\xE1 tem o melhor custo em Hortifruti nesta semana.
    `;
    try {
      const aiClient = getAi();
      const response = await aiClient.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent(`Voc\xEA \xE9 o Consultor Mn\u0113m\u0113 do ecossistema ECOBR232.
        Analise a seguinte lista de compras para o supermercado ${supermarketName || "Local"}:

        ${itemsText}

        ${regionalDataPrompt}

        CONTEXTO DE MOBILIDADE:
        ${plansText}

        MISS\xC3O:
        1. AN\xC1LISE DE NUTRIBILIDADE: Qu\xE3o saud\xE1vel/equilibrada \xE9 esta cesta para a fam\xEDlia?
        2. ECONOMIA DE GUERRA (MENOR PRE\xC7O): Identifique itens onde o pre\xE7o \xE9 vol\xE1til e sugira onde encontrar o menor valor na malha da 232.
        3. QUALIDADE PATRONA (VALOR LOCAL): Priorize e sugira itens que podem ser comprados de "Patronos" do ecossistema ou produtores locais.
        4. ARBITRAGEM DE PRE\xC7O POR TRECHO: Se o usu\xE1rio vai passar por outras cidades, recomende parar e comprar itens espec\xEDficos l\xE1.
        5. OPORTUNIDADES LINDURAS: Verifique se itens da lista podem ser resolvidos via Classificados ou Feira local.

        Responda de forma concisa, t\xE9cnica e em estilo Markdown. Use \xEDcones como \u{1F4CD} para cidades e \u{1F4B0} para economia.`);
      res.json({ analysis: response.response.text() });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Erro ao processar an\xE1lise inteligente." });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
