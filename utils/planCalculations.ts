import { ConfigPlan } from '../types';

/**
 * Calcula o valor total de uma associação com base no número de membros e no plano configurado.
 * Implementa a lógica de "Transbordo" (overflow) para membros além do limite base.
 */
export const calculateAssociationPrice = (memberCount: number, plan: ConfigPlan): number => {
  const { base_price, memberLimit, bracket_1_price, bracket_2_price, bracket_3_price } = plan;

  // Se estiver dentro do limite, paga apenas o preço base
  if (memberCount <= memberLimit) {
    return base_price;
  }

  const overflow = memberCount - memberLimit;
  let totalPrice = base_price;

  // Lógica de Transbordo (Exemplo de faixas de 50 em 50 para os brackets)
  // Nota: Esta lógica pode ser ajustada conforme a regra exata do usuário
  const BRACKET_SIZE = 50;

  if (overflow > 0) {
    const b1_members = Math.min(overflow, BRACKET_SIZE);
    totalPrice += b1_members * bracket_1_price;
  }

  if (overflow > BRACKET_SIZE) {
    const b2_members = Math.min(overflow - BRACKET_SIZE, BRACKET_SIZE);
    totalPrice += b2_members * bracket_2_price;
  }

  if (overflow > BRACKET_SIZE * 2) {
    const b3_members = overflow - (BRACKET_SIZE * 2);
    totalPrice += b3_members * bracket_3_price;
  }

  return totalPrice;
};

/**
 * Retorna o resumo do cálculo para exibição no UI
 */
export const getPriceBreakdown = (memberCount: number, plan: ConfigPlan) => {
  const total = calculateAssociationPrice(memberCount, plan);
  const overflow = Math.max(0, memberCount - plan.memberLimit);
  
  return {
    base: plan.base_price,
    overflow,
    total,
    isOverflowing: overflow > 0
  };
};
