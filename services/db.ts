import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  setDoc, 
  getDoc,
  where,
  getDocFromServer
} from 'firebase/firestore';
import { db as firestore, auth } from './firebase';
import { LoyaltyCampaign, LoyaltyCard, LoyaltyTier, MnemeList, MnemeItem, ProductMock } from '../types';
import { handleFirestoreError, OperationType } from './errorHandlers';

// Interfaces de Dados Armazenados
export interface StoredAd {
  id: string;
  title: string;
  category: string;
  city: string;
  price?: string;
  phone?: string;
  img: string;
  isPremium: boolean;
  isVerified: boolean;
  createdAt: number;
  rating: number;
  userId: string;
}

export interface StoredAlert {
  id: string;
  type: string;
  km: number;
  location: string;
  timestamp: number;
  userId: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  pendingCredits: number;
  adCredits: number;
  commissionRate: number;
  campaignStart: number;
  campaignDurationDays: number;
  benefitExpiryMonths: number;
}

const COLLECTIONS = {
  ADS: 'ads',
  ALERTS: 'alerts',
  USERS: 'users',
  LOYALTY_CAMPAIGNS: 'loyalty_campaigns',
  LOYALTY_WALLET: 'loyalty_wallet',
  MNEME_LISTS: 'mneme_lists',
  LOYALTY_CARDS: 'loyalty_cards'
};

// Banco de Produtos Offline (Mock para o Scanner)
const OFFLINE_PRODUCTS_DB: ProductMock[] = [
  { ean: '7891000053508', name: 'Leite em Pó Ninho 400g', category: 'Mercearia', avgPrice: 18.90 },
  { ean: '7894900011517', name: 'Refrigerante Coca-Cola 2L', category: 'Bebidas', avgPrice: 9.50 },
  { ean: '7891000100103', name: 'Arroz Tio João 1kg', category: 'Mercearia', avgPrice: 6.20 },
  { ean: '7896051130089', name: 'Feijão Carioca Kicaldo 1kg', category: 'Mercearia', avgPrice: 8.90 },
  { ean: '7891991000833', name: 'Cerveja Budweiser 330ml', category: 'Bebidas', avgPrice: 4.50 },
  { ean: '7891150021389', name: 'Detergente Ypê 500ml', category: 'Limpeza', avgPrice: 2.50 },
];

// Implementação Atual: FIRESTORE (Multiplayer)
export const db = {
  ads: {
    async getAll(): Promise<StoredAd[]> {
      try {
        const q = query(collection(firestore, COLLECTIONS.ADS), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoredAd));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.ADS);
        return [];
      }
    },
    async save(ad: Omit<StoredAd, 'id' | 'createdAt' | 'rating' | 'isVerified'>): Promise<StoredAd> {
      try {
        const newAd = {
          ...ad,
          createdAt: Date.now(),
          rating: 5.0,
          isVerified: false
        };
        const docRef = await addDoc(collection(firestore, COLLECTIONS.ADS), newAd);
        return { id: docRef.id, ...newAd } as StoredAd;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.ADS);
        throw error;
      }
    },
    async delete(id: string): Promise<void> {
      try {
        await deleteDoc(doc(firestore, COLLECTIONS.ADS, id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.ADS}/${id}`);
      }
    }
  },
  alerts: {
    async getAll(): Promise<StoredAlert[]> {
      try {
        const q = query(collection(firestore, COLLECTIONS.ALERTS), orderBy('timestamp', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoredAlert));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.ALERTS);
        return [];
      }
    },
    async save(alert: Omit<StoredAlert, 'id' | 'timestamp'>): Promise<StoredAlert> {
      try {
        const newAlert = {
          ...alert,
          timestamp: Date.now()
        };
        const docRef = await addDoc(collection(firestore, COLLECTIONS.ALERTS), newAlert);
        return { id: docRef.id, ...newAlert } as StoredAlert;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.ALERTS);
        throw error;
      }
    },
    // Listener em tempo real
    subscribe(callback: (alerts: StoredAlert[]) => void) {
      const q = query(collection(firestore, COLLECTIONS.ALERTS), orderBy('timestamp', 'desc'), limit(50));
      return onSnapshot(q, (snapshot) => {
        const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoredAlert));
        callback(alerts);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.ALERTS);
      });
    }
  },
  loyalty: {
    async getMyCampaigns(): Promise<LoyaltyCampaign[]> {
      try {
        const q = query(collection(firestore, COLLECTIONS.LOYALTY_CAMPAIGNS));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoyaltyCampaign));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.LOYALTY_CAMPAIGNS);
        return [];
      }
    },
    async createCampaign(camp: Omit<LoyaltyCampaign, 'id' | 'activeUsers'>): Promise<LoyaltyCampaign> {
      try {
        const newCamp = { ...camp, activeUsers: 0 };
        const docRef = await addDoc(collection(firestore, COLLECTIONS.LOYALTY_CAMPAIGNS), newCamp);
        return { id: docRef.id, ...newCamp } as LoyaltyCampaign;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.LOYALTY_CAMPAIGNS);
        throw error;
      }
    },
    async getWallet(): Promise<LoyaltyCard[]> {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        const q = query(collection(firestore, COLLECTIONS.LOYALTY_CARDS), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoyaltyCard));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.LOYALTY_CARDS);
        return [];
      }
    },
    async addStamp(cardId: string): Promise<void> {
      try {
        const cardRef = doc(firestore, COLLECTIONS.LOYALTY_CARDS, cardId);
        const cardSnap = await getDoc(cardRef);
        if (cardSnap.exists()) {
          const data = cardSnap.data();
          const newStamps = (data.currentStamps || 0) + 1;
          const isCompleted = newStamps >= data.goal;
          await setDoc(cardRef, {
            ...data,
            currentStamps: newStamps,
            isCompleted,
            voucherCode: isCompleted ? `VCH-${Math.random().toString(36).substr(2, 6).toUpperCase()}` : data.voucherCode,
            lastStampDate: Date.now()
          }, { merge: true });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.LOYALTY_CARDS}/${cardId}`);
      }
    }
  },
  mneme: {
    async getLists(): Promise<MnemeList[]> {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        const q = query(collection(firestore, COLLECTIONS.MNEME_LISTS), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MnemeList));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.MNEME_LISTS);
        return [];
      }
    },
    async createList(title: string, items: MnemeItem[] = []): Promise<MnemeList> {
      try {
        const userId = auth.currentUser?.uid;
        const newList = {
          title,
          userId,
          createdAt: Date.now(),
          status: 'active',
          items,
          totalEstimated: items.reduce((acc, i) => acc + (i.estimatedPrice || 0), 0)
        };
        const docRef = await addDoc(collection(firestore, COLLECTIONS.MNEME_LISTS), newList);
        return { id: docRef.id, ...newList } as MnemeList;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.MNEME_LISTS);
        throw error;
      }
    },
    async updateList(list: MnemeList): Promise<void> {
      try {
        const { id, ...data } = list;
        await setDoc(doc(firestore, COLLECTIONS.MNEME_LISTS, id), data, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.MNEME_LISTS}/${list.id}`);
      }
    },
    async deleteList(id: string): Promise<void> {
      try {
        await deleteDoc(doc(firestore, COLLECTIONS.MNEME_LISTS, id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.MNEME_LISTS}/${id}`);
      }
    },
    async getProductByBarcode(ean: string): Promise<ProductMock | undefined> {
      return OFFLINE_PRODUCTS_DB.find(p => p.ean === ean);
    }
  },
  users: {
    async getAll() {
      try {
        const q = query(collection(firestore, COLLECTIONS.USERS));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.USERS);
        return [];
      }
    },
    async getProfile(userId: string) {
      try {
        const docRef = doc(firestore, COLLECTIONS.USERS, userId);
        const snap = await getDoc(docRef);
        return snap.exists() ? snap.data() : null;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.USERS}/${userId}`);
        return null;
      }
    },
    async updateProfile(userId: string, data: any) {
      try {
        await setDoc(doc(firestore, COLLECTIONS.USERS, userId), data, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.USERS}/${userId}`);
      }
    }
  }
};

async function testConnection() {
  try {
    await getDocFromServer(doc(firestore, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

