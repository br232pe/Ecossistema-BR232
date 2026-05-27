import { ItemCategory } from './Categories';

export interface CatalogItem {
  name: string;
  category: ItemCategory;
  defaultUnit: string;
  classification: 'Essencial' | 'Saudável' | 'Desejo' | 'Higiene' | 'Limpeza';
}

export const MNEME_CATALOG: CatalogItem[] = [
  // HORTIFRÚTI
  { name: 'Banana Prata', category: 'Hortifrúti', defaultUnit: '1 Palma', classification: 'Saudável' },
  { name: 'Maçã Fuji', category: 'Hortifrúti', defaultUnit: '1 kg', classification: 'Saudável' },
  { name: 'Tomate Italiano', category: 'Hortifrúti', defaultUnit: '1 kg', classification: 'Saudável' },
  { name: 'Cebola Branca', category: 'Hortifrúti', defaultUnit: '1 kg', classification: 'Essencial' },
  { name: 'Batata Inglesa', category: 'Hortifrúti', defaultUnit: '1 kg', classification: 'Essencial' },
  { name: 'Alface Crespa', category: 'Hortifrúti', defaultUnit: '1 Unidade', classification: 'Saudável' },
  { name: 'Cenoura', category: 'Hortifrúti', defaultUnit: '1 kg', classification: 'Saudável' },
  { name: 'Ovos Brancos', category: 'Hortifrúti', defaultUnit: 'Geral', classification: 'Essencial' },
  { name: 'Limão Taiti', category: 'Hortifrúti', defaultUnit: '500g', classification: 'Saudável' },
  { name: 'Abacaxi Pérola', category: 'Hortifrúti', defaultUnit: '1 Unidade', classification: 'Saudável' },
  { name: 'Uva Passa', category: 'Hortifrúti', defaultUnit: '100g', classification: 'Desejo' },
  { name: 'Azeitona Verde', category: 'Hortifrúti', defaultUnit: '1 Pote', classification: 'Desejo' },

  // MERCEARIA
  { name: 'Arroz Branco Tipo 1', category: 'Mercearia', defaultUnit: '1 kg', classification: 'Essencial' },
  { name: 'Feijão Carioca', category: 'Mercearia', defaultUnit: '1 kg', classification: 'Essencial' },
  { name: 'Açúcar Refinado', category: 'Mercearia', defaultUnit: '1 kg', classification: 'Essencial' },
  { name: 'Café em Pó', category: 'Mercearia', defaultUnit: '250g', classification: 'Essencial' },
  { name: 'Óleo de Soja', category: 'Mercearia', defaultUnit: '1 Litro', classification: 'Essencial' },
  { name: 'Macarrão Espaguete', category: 'Mercearia', defaultUnit: '500g', classification: 'Essencial' },
  { name: 'Extrato de Tomate', category: 'Mercearia', defaultUnit: '1 Unidade', classification: 'Essencial' },
  { name: 'Farinha de Milho (Fubá)', category: 'Mercearia', defaultUnit: '500g', classification: 'Essencial' },
  { name: 'Farinha de Trigo', category: 'Mercearia', defaultUnit: '1 kg', classification: 'Essencial' },
  { name: 'Leite Condensado', category: 'Mercearia', defaultUnit: '1 Unidade', classification: 'Desejo' },
  { name: 'Creme de Leite', category: 'Mercearia', defaultUnit: '1 Unidade', classification: 'Desejo' },
  { name: 'Sal Refinado', category: 'Mercearia', defaultUnit: '1 kg', classification: 'Essencial' },
  { name: 'Biscoito Cream Cracker', category: 'Mercearia', defaultUnit: '1 Pacote', classification: 'Essencial' },
  { name: 'Biscoito Recheado', category: 'Mercearia', defaultUnit: '1 Pacote', classification: 'Desejo' },

  // REFRIGERADOS
  { name: 'Leite Integral UHT', category: 'Refrigerados', defaultUnit: '1 Litro', classification: 'Essencial' },
  { name: 'Queijo Coalho', category: 'Refrigerados', defaultUnit: '500g', classification: 'Essencial' },
  { name: 'Manteiga com Sal', category: 'Refrigerados', defaultUnit: '200g', classification: 'Essencial' },
  { name: 'Iogurte Natural', category: 'Refrigerados', defaultUnit: '1 Unidade', classification: 'Saudável' },
  { name: 'Requeijão Cremoso', category: 'Refrigerados', defaultUnit: '1 Pote', classification: 'Desejo' },
  { name: 'Queijo Muçarela', category: 'Refrigerados', defaultUnit: '200g', classification: 'Essencial' },
  { name: 'Presunto Fatiado', category: 'Refrigerados', defaultUnit: '200g', classification: 'Desejo' },

  // LIMPEZA
  { name: 'Detergente Líquido', category: 'Limpeza', defaultUnit: '1 Unidade', classification: 'Limpeza' },
  { name: 'Sabão em Pó', category: 'Limpeza', defaultUnit: '1 kg', classification: 'Limpeza' },
  { name: 'Amaciante de Roupas', category: 'Limpeza', defaultUnit: '1 Litro', classification: 'Limpeza' },
  { name: 'Água Sanitária', category: 'Limpeza', defaultUnit: '1 Litro', classification: 'Limpeza' },
  { name: 'Desinfetante', category: 'Limpeza', defaultUnit: '1 Litro', classification: 'Limpeza' },
  { name: 'Esponja de Aço', category: 'Limpeza', defaultUnit: '1 Pacote', classification: 'Limpeza' },

  // HIGIENE
  { name: 'Papel Higiênico', category: 'Higiene', defaultUnit: '4 unidades', classification: 'Higiene' },
  { name: 'Creme Dental', category: 'Higiene', defaultUnit: '90g', classification: 'Higiene' },
  { name: 'Sabonete em Barra', category: 'Higiene', defaultUnit: '1 Unidade', classification: 'Higiene' },
  { name: 'Shampoo', category: 'Higiene', defaultUnit: '1 Unidade', classification: 'Higiene' },
  { name: 'Desodorante Roll-on', category: 'Higiene', defaultUnit: '1 Unidade', classification: 'Higiene' },

  // AÇOUGUE / PESCADOS
  { name: 'Frango Inteiro Resfriado', category: 'Açougue', defaultUnit: '1 kg', classification: 'Essencial' },
  { name: 'Carne Moida (Patinho)', category: 'Açougue', defaultUnit: '500g', classification: 'Essencial' },
  { name: 'Filé de Tilápia', category: 'Pescados', defaultUnit: '500g', classification: 'Saudável' },
  { name: 'Linguiça Calabresa', category: 'Refrigerados', defaultUnit: '1 Unidade', classification: 'Desejo' },

  // BEBIDAS
  { name: 'Água Mineral', category: 'Bebidas', defaultUnit: '1.5 Litros', classification: 'Saudável' },
  { name: 'Suco de Uva Integral', category: 'Bebidas', defaultUnit: '1 Litro', classification: 'Saudável' },
  { name: 'Refrigerante Cola', category: 'Bebidas', defaultUnit: '2 Litros', classification: 'Desejo' },
  { name: 'Cerveja Lata', category: 'Bebidas', defaultUnit: '1 Unidade', classification: 'Desejo' },
];

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Hortifrúti': return '🍎';
    case 'Mercearia': return '📦';
    case 'Refrigerados': return '🧀';
    case 'Limpeza': return '🧹';
    case 'Higiene': return '🧼';
    case 'Açougue': return '🥩';
    case 'Pescados': return '🐟';
    case 'Bebidas': return '🥤';
    case 'Matinais': return '🥣';
    case 'Conservas': return '🥫';
    case 'Congelados': return '❄️';
    case 'Utilidades': return '🍽️';
    case 'Bebês': return '🍼';
    case 'Pet': return '🐶';
    default: return '🛒';
  }
};
