
export const BR232_LIMITS = {
  MIN_KM: 0,
  MAX_KM: 553,
  START_CITY: 'Recife',
  END_CITY: 'Parnamirim'
};

export enum InfluenceZone {
  TRONCO = 'Tronco (Contato Direto)',
  GALHOS = 'Galhos (Lindeira 50km)',
  RAIZES = 'Raízes (Influência 100km)'
}

export interface CityDefinition {
  name: string;
  zone: InfluenceZone;
  baseKm?: number; 
  feederRoad?: string;
  region: 'RMR' | 'Zona da Mata' | 'Agreste' | 'Sertão';
}

export const BR232_TAXONOMY: CityDefinition[] = [
  { name: 'Recife', zone: InfluenceZone.TRONCO, baseKm: 0, region: 'RMR' },
  { name: 'Jaboatão dos Guararapes', zone: InfluenceZone.TRONCO, baseKm: 12, region: 'RMR' },
  { name: 'Moreno', zone: InfluenceZone.TRONCO, baseKm: 28, region: 'RMR' },
  { name: 'Vitória de Santo Antão', zone: InfluenceZone.TRONCO, baseKm: 50, region: 'Zona da Mata' },
  { name: 'Pombos', zone: InfluenceZone.TRONCO, baseKm: 62, region: 'Zona da Mata' },
  { name: 'Gravatá', zone: InfluenceZone.TRONCO, baseKm: 80, region: 'Agreste' },
  { name: 'Bezerros', zone: InfluenceZone.TRONCO, baseKm: 102, region: 'Agreste' },
  { name: 'Caruaru', zone: InfluenceZone.TRONCO, baseKm: 135, region: 'Agreste' },
  { name: 'São Caetano', zone: InfluenceZone.TRONCO, baseKm: 155, region: 'Agreste' },
  { name: 'Tacaimbó', zone: InfluenceZone.TRONCO, baseKm: 165, region: 'Agreste' },
  { name: 'Belo Jardim', zone: InfluenceZone.TRONCO, baseKm: 185, region: 'Agreste' },
  { name: 'Sanharó', zone: InfluenceZone.TRONCO, baseKm: 200, region: 'Agreste' },
  { name: 'Pesqueira', zone: InfluenceZone.TRONCO, baseKm: 215, region: 'Agreste' },
  { name: 'Arcoverde', zone: InfluenceZone.TRONCO, baseKm: 255, region: 'Sertão' },
  { name: 'Custódia', zone: InfluenceZone.TRONCO, baseKm: 335, region: 'Sertão' },
  { name: 'Sítio dos Nunes (Flores)', zone: InfluenceZone.TRONCO, baseKm: 365, region: 'Sertão' },
  { name: 'Serra Talhada', zone: InfluenceZone.TRONCO, baseKm: 415, region: 'Sertão' },
  { name: 'Salgueiro', zone: InfluenceZone.TRONCO, baseKm: 515, region: 'Sertão' },
  { name: 'Parnamirim', zone: InfluenceZone.TRONCO, baseKm: 553, region: 'Sertão' },
  { name: 'Santa Cruz do Capibaribe', zone: InfluenceZone.RAIZES, feederRoad: 'BR-104', region: 'Agreste' },
  { name: 'Garanhuns', zone: InfluenceZone.RAIZES, feederRoad: 'BR-423', region: 'Agreste' }
];

export enum AlertType {
  ACCIDENT = 'Acidente',
  CONGESTION = 'Lentidão',
  RAIN = 'Chuva Forte',
  WORKS = 'Obras'
}

/**
 * Categorias de anúncios disponíveis na malha BR-232.
 */
export enum AdCategory {
  FEIRA = 'Feira',
  PILOTO_SOLO = 'Piloto Solo',
  ASSOCIACAO = 'Associação'
}

/**
 * Níveis de classificação para Associações e frotas.
 */
export enum AssociationTier {
  TITAN = 'Titan',
  FACTOR = 'Factor',
  TWISTER = 'Twister',
  ALTA_CILINDRADA = 'Alta Cilindrada'
}

/**
 * FIDELIDADE CF-ECOBR 232
 */
export enum LoyaltyTier {
  FREE = 'Free',
  PRO = 'Pro',
  PROMASTER = 'ProMaster'
}

export interface LoyaltyCampaign {
  id: string;
  merchantName: string;
  tier: LoyaltyTier;
  title: string;
  goal: number;
  reward: string;
  rules: string;
  color: string;
  activeUsers: number;
}

export interface LoyaltyCard {
  id: string;
  campaignId: string;
  merchantName: string;
  title: string;
  currentStamps: number;
  goal: number;
  reward: string;
  color: string;
  lastStampDate: number;
  isCompleted: boolean;
  voucherCode?: string;
}

/**
 * MNĒMĒ - Módulo de Gestão Doméstica
 */
export enum MnemeTier {
  FREE = 'Free',
  SILVER = 'Silver',
  GOLD = 'Gold'
}

export interface MnemeItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  checked: boolean;
  estimatedPrice?: number;
  lastPricePaid?: number; // Para Anámnēsis
}

export interface MnemeList {
  id: string;
  title: string;
  createdAt: number;
  items: MnemeItem[];
  status: 'active' | 'archived';
  totalEstimated?: number;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: 'user' | 'admin' | 'merchant';
  mnemeTier: MnemeTier;
  loyaltyTier: LoyaltyTier;
  associationTier?: AssociationTier;
  createdAt: number;
  lastLogin: number;
  region?: string;
  bio?: string;
  phone?: string;
}

export interface ProductMock {
  ean: string;
  name: string;
  category: string;
  avgPrice: number;
}