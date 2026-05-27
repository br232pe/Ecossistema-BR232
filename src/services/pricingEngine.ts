/**
 * Motor Tarifário Canônico - Ecossistema BR-232
 * Estabilidade LTS e Resolução Determinística sob o protocolo PPI-TRANCAR
 */

export interface FinancialSummary {
  receitaBruta: number;
  fundoManutencao: number;
  fundoReserva: number;
  lucroReal: number;
}

export interface PilotPricingProfile {
  baseFare: number;
  pricePerKm: number;
}

/**
 * Calcula a tarifa síncrona individual da corrida de um piloto piloto-céntrico
 */
export const calculateIndividualRideRate = (
  baseFare: number,
  pricePerKm: number,
  distance: number,
  isExtraRateActive: boolean
): number => {
  const fare = baseFare + (pricePerKm * distance);
  return isExtraRateActive ? fare * 1.3 : fare;
};

/**
 * Calcula a repartição tarifária com base no volume de corridas,
 * taxa base corporativa e ativador de Adicional Noturno/Rural (+30%).
 */
export const calculateRates = (
  baseRate: number,
  isExtraRateActive: boolean,
  ridesCount: number
): FinancialSummary => {
  const ratePerRide = isExtraRateActive ? baseRate * 1.3 : baseRate;
  const receitaBruta = ratePerRide * ridesCount;
  
  // Alocação determinística de fundos mitigadores de risco operacional
  const fundoManutencao = receitaBruta * 0.15; // 15% para conservação preventiva da frota
  const fundoReserva = receitaBruta * 0.10;    // 10% para fundo emergencial da rodovia
  const lucroReal = receitaBruta - fundoManutencao - fundoReserva; // Lucro corporativo líquido
  
  return {
    receitaBruta: parseFloat(receitaBruta.toFixed(2)),
    fundoManutencao: parseFloat(fundoManutencao.toFixed(2)),
    fundoReserva: parseFloat(fundoReserva.toFixed(2)),
    lucroReal: parseFloat(lucroReal.toFixed(2))
  };
};

