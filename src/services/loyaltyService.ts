import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, auth } from '../contexts/AuthContext';
import { LoyaltyTransaction, Patron } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const loyaltyService = {
  // Encontra patronos num raio de 1km (Simulação de Geofencing para LTS)
  async findNearbyPatrons(lat: number, lng: number): Promise<Patron[]> {
    const path = 'patrons';
    try {
      const q = query(collection(db, path), where('isVerified', '==', true));
      const snap = await getDocs(q);
      const patrons = snap.docs.map(d => ({ id: d.id, ...d.data() } as Patron));
      
      return patrons.filter(p => {
        if (!p.location) return false;
        const d = Math.sqrt(Math.pow(p.location.lat - lat, 2) + Math.pow(p.location.lng - lng, 2));
        return d < 0.01; // Aprox 1km
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  // Semeia patronos iniciais para teste (Somente se necessário)
  async seedInitialPatrons() {
    if (!auth.currentUser) return;

    const patrons = [
      {
        name: 'Posto Cruzeiro (Gravatá)',
        category: 'Combustível',
        city: 'Gravatá',
        km: 80,
        isVerified: true,
        ownerId: 'SYSTEM', // Usado para patronos oficiais seeded
        rating: 4.8,
        location: { lat: -8.201, lng: -35.567 },
        loyaltyConfig: { dailyCode: '2321', pointsPerPurchase: 10 },
        createdAt: serverTimestamp()
      },
      {
        name: 'Rei da Coxinha (Bezerros)',
        category: 'Restaurante',
        city: 'Bezerros',
        km: 104,
        isVerified: true,
        ownerId: 'SYSTEM',
        rating: 5.0,
        location: { lat: -8.239, lng: -35.795 },
        loyaltyConfig: { dailyCode: '1040', pointsPerPurchase: 15 },
        createdAt: serverTimestamp()
      }
    ];

    const path = 'patrons';
    for (const p of patrons) {
      try {
        const q = query(collection(db, path), where('name', '==', p.name));
        const snap = await getDocs(q);
        // Só tenta adicionar se for o admin ou se os dados forem compatíveis com as regras
        // No protótipo, apenas logamos se falhar.
        if (snap.empty && auth.currentUser.uid === 'TmvUfFzSjZf7j5M6y3zB9pXN2sD2') { // Exemplo de UID de admin se soubermos
           await addDoc(collection(db, path), p);
        }
      } catch (e) {
        console.warn('Seeding skipped or failed due to permissions:', e);
      }
    }
  },

  async startTransition(userId: string, patronId: string) {
    const path = 'loyalty_transactions';
    const txData: Omit<LoyaltyTransaction, 'id'> = {
      userId,
      patronId,
      weights: {
        proximity: true,
        entry: false,
        permanence: false,
        conversion: false
      },
      status: 'pending',
      kmEarned: 0,
      timeSpentSeconds: 0,
      createdAt: serverTimestamp()
    };
    try {
      return await addDoc(collection(db, path), txData);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async updateTelemetry(txId: string, entry: boolean, permanence: boolean, timeSeconds: number) {
    const path = `loyalty_transactions/${txId}`;
    try {
      const txRef = doc(db, 'loyalty_transactions', txId);
      return await updateDoc(txRef, {
        'weights.entry': entry,
        'weights.permanence': permanence,
        timeSpentSeconds: timeSeconds,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async confirmPurchase(txId: string, providedCode: string, patronCode: string, points: number) {
    if (providedCode !== patronCode) {
      throw new Error("Código de Voz Inválido.");
    }

    const path = `loyalty_transactions/${txId}`;
    try {
      const txRef = doc(db, 'loyalty_transactions', txId);
      return await updateDoc(txRef, {
        'weights.conversion': true,
        status: 'completed',
        kmEarned: points,
        completedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async getRecentTransactions(userId: string) {
    const path = 'loyalty_transactions';
    try {
      const q = query(
        collection(db, path), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as LoyaltyTransaction));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  }
};
