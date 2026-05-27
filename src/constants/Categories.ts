export const TIER_CATEGORIES = [
  "Açougue",
  "Pescados",
  "Refrigerados",
  "Hortifrúti",
  "Mercearia",
  "Matinais",
  "Conservas",
  "Congelados",
  "Bebidas",
  "Higiene",
  "Limpeza",
  "Utilidades",
  "Bebês",
  "Pet"
] as const;

export type ItemCategory = typeof TIER_CATEGORIES[number];
