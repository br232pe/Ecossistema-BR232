import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Ecossistema BR-232 - Ponto de Entrada Principal
 * Última Atualização de Estabilidade: 30/03/2026 às 18:28 (Local)
 */

// --- SISTEMA DE DIAGNÓSTICO DE CRASH (Native Crash Reporter) ---
// Captura erros síncronos e de promessa que ocorrem antes do React montar
window.onerror = function(message, source, lineno, colno, error) {
  const report = document.getElementById('crash-report');
  if (report) {
    report.style.display = 'block';
    report.innerHTML = `
      <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 10px;">🛑 CRASH FATAL DE INICIALIZAÇÃO</h1>
      <p>O aplicativo encontrou um erro irrecuperável antes de carregar.</p>
      <hr style="border: 1px solid #330000; margin: 15px 0;"/>
      <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">
        <strong>Erro:</strong> ${message}<br/>
        <strong>Arquivo:</strong> ${source}:${lineno}:${colno}<br/>
        <pre style="margin-top: 10px; opacity: 0.7; font-size: 10px; overflow: auto;">${error?.stack || 'Sem Stacktrace'}</pre>
      </div>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #ff5555; border: none; color: white; border-radius: 5px; cursor: pointer;">Tentar Recarregar</button>
    `;
    // Oculta o root para evitar sobreposição
    const root = document.getElementById('root');
    if (root) root.style.display = 'none';
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Elemento raiz 'root' não encontrado no DOM. Verifique o index.html.");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (e) {
  console.error("Erro fatal ao renderizar App:", e);
  // Força o disparo do onerror se o catch pegar
  throw e;
}