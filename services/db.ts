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
  getDocFromServer,
  increment,
  updateDoc
} from 'firebase/firestore';
import { db as firestore, auth } from './firebase';
import { 
  LoyaltyCampaign, 
  LoyaltyCard, 
  LoyaltyTier, 
  MnemeList, 
  MnemeItem, 
  ProductMock,
  StoredAlert,
  StoredArticle,
  StoredClassified,
  ConfigPlan,
  StoredPatron,
  UserProfile
} from '../types';
import { handleFirestoreError, OperationType } from './errorHandlers';

// Interfaces de Dados Armazenados (Removidas daqui pois já estão em types.ts)

const COLLECTIONS = {
  CLASSIFIEDS: 'classifieds',
  ALERTS: 'alerts',
  ARTICLES: 'articles',
  USERS: 'users',
  CONFIG_PLANS: 'config_plans',
  PATRONS: 'patrons',
  LOYALTY_CAMPAIGNS: 'loyalty_campaigns',
  LOYALTY_CARDS: 'loyalty_cards',
  MNEME_LISTS: 'mneme_lists'
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
  classifieds: {
    async getAll(): Promise<StoredClassified[]> {
      try {
        const q = query(collection(firestore, COLLECTIONS.CLASSIFIEDS), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoredClassified));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.CLASSIFIEDS);
        return [];
      }
    },
    async save(ad: Omit<StoredClassified, 'id' | 'timestamp' | 'ratingAvg' | 'status'>): Promise<StoredClassified> {
      try {
        const newAd = {
          ...ad,
          timestamp: Date.now(),
          ratingAvg: 5.0,
          status: 'ativo'
        };
        const docRef = await addDoc(collection(firestore, COLLECTIONS.CLASSIFIEDS), newAd);
        return { id: docRef.id, ...newAd } as StoredClassified;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.CLASSIFIEDS);
        throw error;
      }
    },
    async delete(id: string): Promise<void> {
      try {
        await deleteDoc(doc(firestore, COLLECTIONS.CLASSIFIEDS, id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.CLASSIFIEDS}/${id}`);
      }
    }
  },
  // Alias para compatibilidade com código antigo
  get ads() { return this.classifieds; },

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
    async save(alert: Omit<StoredAlert, 'id' | 'timestamp' | 'status'>): Promise<StoredAlert> {
      try {
        const newAlert = {
          ...alert,
          timestamp: Date.now(),
          status: 'ativo'
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
  articles: {
    async getAll(): Promise<StoredArticle[]> {
      try {
        const q = query(collection(firestore, COLLECTIONS.ARTICLES), orderBy('publishedAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoredArticle));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.ARTICLES);
        return [];
      }
    }
  },
  config: {
    async getPlans(): Promise<ConfigPlan[]> {
      try {
        const q = query(collection(firestore, COLLECTIONS.CONFIG_PLANS));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConfigPlan));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.CONFIG_PLANS);
        return [];
      }
    }
  },
  patrons: {
    async getAll(): Promise<StoredPatron[]> {
      try {
        const q = query(collection(firestore, COLLECTIONS.PATRONS));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoredPatron));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.PATRONS);
        return [];
      }
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
        const docRef = doc(firestore, COLLECTIONS.LOYALTY_CARDS, cardId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as LoyaltyCard;
          await updateDoc(docRef, {
            currentStamps: increment(1),
            lastStampDate: Date.now(),
            isCompleted: (data.currentStamps + 1) >= data.goal
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.LOYALTY_CARDS}/${cardId}`);
      }
    },
    async createCampaign(data: Omit<LoyaltyCampaign, 'id' | 'activeUsers'>): Promise<void> {
      try {
        await addDoc(collection(firestore, COLLECTIONS.LOYALTY_CAMPAIGNS), {
          ...data,
          merchantId: auth.currentUser?.uid,
          activeUsers: 0,
          createdAt: Date.now()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.LOYALTY_CAMPAIGNS);
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
    async createList(title: string, items: any[]): Promise<{ id: string }> {
      try {
        const docRef = await addDoc(collection(firestore, COLLECTIONS.MNEME_LISTS), {
          title,
          items,
          userId: auth.currentUser?.uid,
          createdAt: Date.now(),
          status: 'active'
        });
        return { id: docRef.id };
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.MNEME_LISTS);
        throw error;
      }
    },
    async deleteList(id: string): Promise<void> {
      try {
        await deleteDoc(doc(firestore, COLLECTIONS.MNEME_LISTS, id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.MNEME_LISTS}/${id}`);
      }
    },
    async updateList(id: string, data: Partial<MnemeList>): Promise<void> {
      try {
        await updateDoc(doc(firestore, COLLECTIONS.MNEME_LISTS, id), data);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.MNEME_LISTS}/${id}`);
      }
    },
    async getProductByBarcode(ean: string): Promise<ProductMock | undefined> {
      return OFFLINE_PRODUCTS_DB.find(p => p.ean === ean);
    }
  },
  users: {
    async getAll(): Promise<UserProfile[]> {
      try {
        const q = query(collection(firestore, COLLECTIONS.USERS));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.USERS);
        return [];
      }
    },
    async getProfile(userId: string): Promise<UserProfile | null> {
      try {
        const docRef = doc(firestore, COLLECTIONS.USERS, userId);
        const snap = await getDoc(docRef);
        return snap.exists() ? snap.data() as UserProfile : null;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.USERS}/${userId}`);
        return null;
      }
    },
    async updateProfile(userId: string, data: Partial<UserProfile>) {
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

