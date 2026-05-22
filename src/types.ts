export enum CityType {
  TRONCO = "TRONCO", // Recife, Jaboatão, Moreno
  GALHO = "GALHO",   // Vitória, Gravatá, Bezerros, Caruaru
  RAIZ = "RAIZ"      // Belo Jardim, Arcoverde, Serra Talhada...
}

export interface UserIdentities {
  isConsumer: boolean;
  isPatron: boolean;
  isDriver: boolean;
  isGuardian: boolean;
  isSecretary: boolean;
  isAssociationManager: boolean;
  isTravelManager: boolean;
  isServiceProvider: boolean;
  isColumnist: boolean;
}

export interface UserStats {
  ip: number; // Índice de Pertencimento (0-100)
  merit: number; // 65% of IP
  associationForce: number; // 35% of IP
  totalKm: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  currentCity: string;
  identities: UserIdentities;
  stats: UserStats;
  createdAt: any;
  updatedAt: any;
}

export interface Patron {
  id: string;
  ownerId: string;
  name: string;
  category: string;
  city: string;
  km: number;
  description?: string;
  isVerified: boolean;
  rating: number;
  location?: {
    lat: number;
    lng: number;
  };
  loyaltyConfig?: {
    dailyCode: string; // CDV - Código Dinâmico de Voz
    pointsPerPurchase: number;
  };
  createdAt: any;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  patronId: string;
  weights: {
    proximity: boolean; // 3%
    entry: boolean;     // 7%
    permanence: boolean; // 10%
    conversion: boolean; // 80%
  };
  status: 'pending' | 'completed' | 'auditing';
  kmEarned: number;
  timeSpentSeconds: number;
  createdAt: any;
  completedAt?: any;
}

export interface Alert {
  id: string;
  authorId: string;
  category: string;
  city: string;
  km: number;
  description: string;
  timestamp: any;
}

export interface Classified {
  id: string;
  authorId: string;
  title: string;
  category: string;
  vibe?: string; // Segmentação por "Vibe" / Intenção (Ex: Urgente, Familiar, Premium)
  price: string;
  description: string;
  status: 'active' | 'sold' | 'expired';
  phone: string;
  whatsappMessage?: string;
  city: string;
  isPatrono?: boolean; // Selo de Procedência Patrona
  trustScore?: number; // Trust Factor (0-100)
  createdAt: any;
}

export interface BlogPost {
  id?: string;
  authorId: string;
  authorName: string;
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  category: string;
  status: 'draft' | 'published';
  publishedAt?: any;
  createdAt: any;
}

export interface ServiceAnnouncement {
  id: string;
  providerId: string;
  title: string;
  category: string;
  subCategory?: string;
  vibe?: string; // Intenção (Ex: Emergência, Cotidiano, Lazer)
  description: string;
  city: string;
  neighborhood: string;
  whatsapp: string;
  pricingModel: 'free' | 'top' | 'emergency';
  isUrgent: boolean;
  isPatrono?: boolean; // Selo de Procedência Patrona
  availability?: string;
  rating: number;
  createdAt: any;
  expiresAt: any;
}

export interface MnemeList {
  id: string;
  name: string;
  ownerId: string;
  authorizedUsers: string[]; // UIDs para compartilhamento familiar
  supermarketName?: string;
  supermarketLocation?: { lat: number; lng: number };
  status?: 'active' | 'archived';
  totalSpent?: number;
  archivedAt?: any;
  createdAt: any;
  updatedAt: any;
}

export interface MnemeItem {
  id: string;
  listId: string;
  name: string;
  quantity: string;
  category: string; // Seção do supermercado (Hortifruti, Limpeza, etc.)
  brand?: string;
  weightVolume?: string;
  vibe?: string; // Segmentação (Ex: Necessidade, Desejo, Saudável)
  isCompleted: boolean;
  notes?: string;
  price?: number;
  nutriScore?: string; // Inteligência Nutricional
  addedBy: string;
  createdAt: any;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: string;
  location?: string;
  cityName: string;
}
