
import { AssociationTier } from '../types';

/**
 * Lógica de Custo Marginal Decrescente para Associações
 */
export const calculateAssociationFee = (members: number): number => {
  if (members <= 50) return 250.0;
  if (members <= 100) return 400.0;
  if (members <= 200) return 600.0;

  let total = 600.0;
  const overflow = members - 200;

  for (let i = 1; i <= overflow; i++) {
    const current = 200 + i;
    if (current <= 350) total += 2.50;
    else if (current <= 500) total += 2.25;
    else total += 2.00;
  }

  return total;
};

/**
 * Hermenêutica do Pertencimento: IP = (Fator_A * 0.35) + (Fator_P * 0.65)
 */
export const calculateIPScore = (tier: AssociationTier, metrics: any): number => {
  const tierWeights = {
    [AssociationTier.TITAN]: 0.4,
    [AssociationTier.FACTOR]: 0.6,
    [AssociationTier.TWISTER]: 0.8,
    [AssociationTier.ALTA_CILINDRADA]: 1.0
  };

  const fAssoc = tierWeights[tier];
  
  const fPers = (
    metrics.recurrence * 0.20 +
    metrics.discretion * 0.30 + // Maior peso: Protocolo de Discrição
    metrics.ethics * 0.20 +
    metrics.safety * 0.20 +
    metrics.solidarity * 0.10
  );

  let score = (fAssoc * 0.35) + (fPers * 0.65);
  
  // Regra Bloqueante: Baixa discrição penaliza o ranking global
  if (metrics.discretion < 0.4) score *= 0.5;

  return parseFloat((score * 10).toFixed(2));
};
