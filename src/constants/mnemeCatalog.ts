export interface CatalogItem {
  name: string;
  category: string;
  defaultUnit: string;
  vibe: 'Essencial' | 'Saudável' | 'Desejo' | 'Higiene' | 'Limpeza';
}

export const MNEME_CATALOG: CatalogItem[] = [
  // HORTIFRUTI
  { name: 'Banana Prata', category: 'Hortifruti', defaultUnit: '1 Palma', vibe: 'Saudável' },
  { name: 'Maçã Fuji', category: 'Hortifruti', defaultUnit: '1 kg', vibe: 'Saudável' },
  { name: 'Tomate Italiano', category: 'Hortifruti', defaultUnit: '1 kg', vibe: 'Saudável' },
  { name: 'Cebola Branca', category: 'Hortifruti', defaultUnit: '1 kg', vibe: 'Essencial' },
  { name: 'Batata Inglesa', category: 'Hortifruti', defaultUnit: '1 kg', vibe: 'Essencial' },
  { name: 'Alface Crespa', category: 'Hortifruti', defaultUnit: '1 Unidade', vibe: 'Saudável' },
  { name: 'Cenoura', category: 'Hortifruti', defaultUnit: '1 kg', vibe: 'Saudável' },
  { name: 'Ovos Brancos', category: 'Hortifruti', defaultUnit: 'Geral', vibe: 'Essencial' },
  { name: 'Limão Taiti', category: 'Hortifruti', defaultUnit: '500g', vibe: 'Saudável' },
  { name: 'Abacaxi Pérola', category: 'Hortifruti', defaultUnit: '1 Unidade', vibe: 'Saudável' },
  { name: 'Uva Passa', category: 'Hortifruti', defaultUnit: '100g', vibe: 'Desejo' },
  { name: 'Azeitona Verde', category: 'Hortifruti', defaultUnit: '1 Pote', vibe: 'Desejo' },

  // MERCEARIA
  { name: 'Arroz Branco Tipo 1', category: 'Mercearia', defaultUnit: '1 kg', vibe: 'Essencial' },
  { name: 'Feijão Carioca', category: 'Mercearia', defaultUnit: '1 kg', vibe: 'Essencial' },
  { name: 'Açúcar Refinado', category: 'Mercearia', defaultUnit: '1 kg', vibe: 'Essencial' },
  { name: 'Café em Pó', category: 'Mercearia', defaultUnit: '250g', vibe: 'Essencial' },
  { name: 'Óleo de Soja', category: 'Mercearia', defaultUnit: '1 Litro', vibe: 'Essencial' },
  { name: 'Macarrão Espaguete', category: 'Mercearia', defaultUnit: '500g', vibe: 'Essencial' },
  { name: 'Extrato de Tomate', category: 'Mercearia', defaultUnit: '1 Unidade', vibe: 'Essencial' },
  { name: 'Farinha de Milho (Fubá)', category: 'Mercearia', defaultUnit: '500g', vibe: 'Essencial' },
  { name: 'Farinha de Trigo', category: 'Mercearia', defaultUnit: '1 kg', vibe: 'Essencial' },
  { name: 'Leite Condensado', category: 'Mercearia', defaultUnit: '1 Unidade', vibe: 'Desejo' },
  { name: 'Creme de Leite', category: 'Mercearia', defaultUnit: '1 Unidade', vibe: 'Desejo' },
  { name: 'Sal Refinado', category: 'Mercearia', defaultUnit: '1 kg', vibe: 'Essencial' },
  { name: 'Biscoito Cream Cracker', category: 'Mercearia', defaultUnit: '1 Pacote', vibe: 'Essencial' },
  { name: 'Biscoito Recheado', category: 'Mercearia', defaultUnit: '1 Pacote', vibe: 'Desejo' },

  // LATICÍNIOS
  { name: 'Leite Integral UHT', category: 'Laticínios', defaultUnit: '1 Litro', vibe: 'Essencial' },
  { name: 'Queijo Coalho', category: 'Laticínios', defaultUnit: '500g', vibe: 'Essencial' },
  { name: 'Manteiga com Sal', category: 'Laticínios', defaultUnit: '200g', vibe: 'Essencial' },
  { name: 'Iogurte Natural', category: 'Laticínios', defaultUnit: '1 Unidade', vibe: 'Saudável' },
  { name: 'Requeijão Cremoso', category: 'Laticínios', defaultUnit: '1 Pote', vibe: 'Desejo' },
  { name: 'Queijo Muçarela', category: 'Laticínios', defaultUnit: '200g', vibe: 'Essencial' },
  { name: 'Presunto Fatiado', category: 'Frios', defaultUnit: '200g', vibe: 'Desejo' },

  // LIMPEZA
  { name: 'Detergente Líquido', category: 'Limpeza', defaultUnit: '1 Unidade', vibe: 'Limpeza' },
  { name: 'Sabão em Pó', category: 'Limpeza', defaultUnit: '1 kg', vibe: 'Limpeza' },
  { name: 'Amaciante de Roupas', category: 'Limpeza', defaultUnit: '1 Litro', vibe: 'Limpeza' },
  { name: 'Água Sanitária', category: 'Limpeza', defaultUnit: '1 Litro', vibe: 'Limpeza' },
  { name: 'Desinfetante', category: 'Limpeza', defaultUnit: '1 Litro', vibe: 'Limpeza' },
  { name: 'Papel Higiênico', category: 'Higiene', defaultUnit: '4 unidades', vibe: 'Higiene' },
  { name: 'Esponja de Aço', category: 'Limpeza', defaultUnit: '1 Pacote', vibe: 'Limpeza' },

  // HIGIENE
  { name: 'Creme Dental', category: 'Higiene', defaultUnit: '90g', vibe: 'Higiene' },
  { name: 'Sabonete em Barra', category: 'Higiene', defaultUnit: '1 Unidade', vibe: 'Higiene' },
  { name: 'Shampoo', category: 'Higiene', defaultUnit: '1 Unidade', vibe: 'Higiene' },
  { name: 'Desodorante Roll-on', category: 'Higiene', defaultUnit: '1 Unidade', vibe: 'Higiene' },

  // CARNES/PROTEÍNAS
  { name: 'Frango Inteiro Resfriado', category: 'Carnes', defaultUnit: '1 kg', vibe: 'Essencial' },
  { name: 'Carne Moida (Patinho)', category: 'Carnes', defaultUnit: '500g', vibe: 'Essencial' },
  { name: 'Filé de Tilápia', category: 'Peixaria', defaultUnit: '500g', vibe: 'Saudável' },
  { name: 'Linguiça Calabresa', category: 'Frios', defaultUnit: '1 Unidade', vibe: 'Desejo' },

  // BEBIDAS
  { name: 'Água Mineral', category: 'Bebidas', defaultUnit: '1.5 Litros', vibe: 'Saudável' },
  { name: 'Suco de Uva Integral', category: 'Bebidas', defaultUnit: '1 Litro', vibe: 'Saudável' },
  { name: 'Refrigerante Cola', category: 'Bebidas', defaultUnit: '2 Litros', vibe: 'Desejo' },
  { name: 'Cerveja Lata', category: 'Bebidas', defaultUnit: '1 Unidade', vibe: 'Desejo' },
];

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Hortifruti': return '🍎';
    case 'Mercearia': return '📦';
    case 'Laticínios': return '🧀';
    case 'Frios': return '🥓';
    case 'Limpeza': return '🧹';
    case 'Higiene': return '🧼';
    case 'Carnes': return '🥩';
    case 'Peixaria': return '🐟';
    case 'Bebidas': return '🥤';
    case 'Padaria': return '🥖';
    default: return '🛒';
  }
};
