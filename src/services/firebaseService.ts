import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, auth } from '../contexts/AuthContext';
import { Alert, Patron, Classified, UserProfile } from '../types';

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

export const firebaseService = {
  // --- Alerts ---
  async createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'authorId'>) {
    const path = 'alerts';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...alert,
        authorId: auth.currentUser?.uid,
        timestamp: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async getRecentAlerts(city?: string) {
    const path = 'alerts';
    try {
      let q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(10));
      if (city) {
        q = query(q, where('city', '==', city));
      }
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Alert));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  // --- Patrons ---
  async registerPatron(patron: Omit<Patron, 'id' | 'ownerId' | 'isVerified' | 'rating' | 'createdAt'>) {
    const path = 'patrons';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...patron,
        ownerId: auth.currentUser?.uid,
        isVerified: false,
        rating: 0,
        createdAt: serverTimestamp()
      });
      
      // Update user identity
      const userRef = doc(db, 'users', auth.currentUser!.uid);
      await updateDoc(userRef, {
        'identities.isPatron': true,
        updatedAt: serverTimestamp()
      });

      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  // --- Marketplace ---
  async createAd(ad: Omit<Classified, 'id' | 'authorId' | 'createdAt' | 'status'>) {
    const path = 'classifieds';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...ad,
        authorId: auth.currentUser?.uid,
        status: 'active',
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async getClassifieds(category?: string) {
    const path = 'classifieds';
    try {
      let q = query(collection(db, path), where('status', '==', 'active'), orderBy('createdAt', 'desc'), limit(50));
      if (category) {
        q = query(q, where('category', '==', category));
      }
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Classified));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async getMyClassifieds() {
    const path = 'classifieds';
    try {
      const q = query(
        collection(db, path), 
        where('authorId', '==', auth.currentUser?.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Classified));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async updateAd(adId: string, updates: Partial<Classified>) {
    const path = `classifieds/${adId}`;
    try {
      const docRef = doc(db, 'classifieds', adId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async deleteAd(adId: string) {
    const path = `classifieds/${adId}`;
    try {
      const docRef = doc(db, 'classifieds', adId);
      await deleteDoc(docRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  }
};
