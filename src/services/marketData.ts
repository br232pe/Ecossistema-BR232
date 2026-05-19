export interface RegionalPrice {
  id: string;
  itemName: string;
  category: string;
  prices: {
    city: string;
    supermarket: string;
    value: number;
    isPatrono: boolean;
  }[];
  lastUpdated: string;
}

export const REGIONAL_MARKET_DATA: RegionalPrice[] = [
  {
    id: '1',
    itemName: 'Queijo Coalho (Kg)',
    category: 'Laticínios',
    prices: [
      { city: 'Recife', supermarket: 'Rede Capital', value: 48.90, isPatrono: false },
      { city: 'Gravatá', supermarket: 'Laticínios Serra', value: 39.90, isPatrono: true },
      { city: 'Sanharó', supermarket: 'Patrono Sanharó', value: 34.50, isPatrono: true },
    ],
    lastUpdated: '2026-05-19'
  },
  {
    id: '2',
    itemName: 'Arroz 5kg',
    category: 'Mercearia',
    prices: [
      { city: 'Gravatá', supermarket: 'Mercado Patrono', value: 24.50, isPatrono: true },
      { city: 'Caruaru', supermarket: 'Atacadão Agreste', value: 22.90, isPatrono: true },
      { city: 'Pesqueira', supermarket: 'Varejo Local', value: 26.00, isPatrono: false },
    ],
    lastUpdated: '2026-05-19'
  }
];

export const getPricesForItem = (itemName: string) => {
  return REGIONAL_MARKET_DATA.find(p => 
    itemName.toLowerCase().includes(p.itemName.toLowerCase()) || 
    p.itemName.toLowerCase().includes(itemName.toLowerCase())
  );
};
