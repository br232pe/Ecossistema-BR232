/**
 * BetaGuard - Engenharia do Relógio Biológico e Arquitetura de Transição Temporal
 * Módulo de Controle Temporal para os Benefícios e Estágios da Fase Beta.
 */

// Data limite marcada para a virada de chave do Beta (31/12/2026 23:59:59 UTC-3, i.e. 01/01/2027 00:00:00 GMT-3)
export const BETA_END_DATE = new Date('2027-01-01T00:00:00-03:00');

/**
 * Função de checagem temporal do Relógio Biológico (Time-Bomb).
 * Compara a data/hora atual do sistema com a data final da Fase Beta.
 * Retorna true se estivermos dentro do período promocional/beta (antes de 2027).
 */
export function isBetaActive(): boolean {
  return new Date() < BETA_END_DATE;
}
