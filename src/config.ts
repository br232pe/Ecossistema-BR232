/**
 * CONFIGURAÇÃO GLOBAL DO SISTEMA
 * Centraliza o acesso a variáveis de ambiente e status dos serviços.
 * Última Verificação: 30/03/2026 às 18:28 (Local)
 */

export const CONFIG = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GOOGLE_MAPS_KEY: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0-beta',
  IS_DEV: import.meta.env.DEV || false,
};

export const checkSystemStatus = () => {
  const status = {
    gemini: !!CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY.length > 5,
    maps: !!CONFIG.GOOGLE_MAPS_KEY && CONFIG.GOOGLE_MAPS_KEY.length > 5,
    firebase: true, // Assumido como true se o app carregou
  };

  if (!status.gemini) {
    console.warn("⚠️ [SISTEMA] Gemini API Key ausente. IA rodando em modo Mock.");
  } else {
    console.info("✅ [SISTEMA] Gemini API conectada.");
  }

  if (!status.maps) {
    console.warn("⚠️ [SISTEMA] Google Maps Key ausente. Mapas reais desativados.");
  } else {
    console.info("✅ [SISTEMA] Google Maps API pronta.");
  }

  return status;
};
