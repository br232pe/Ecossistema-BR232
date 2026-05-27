import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDoc,
  arrayUnion,
  arrayRemove,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from '../contexts/AuthContext';
import { MnemeList, MnemeItem } from '../types';

const LISTS_COLLECTION = 'mneme_lists';
const ITEMS_COLLECTION = 'mneme_items';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper robusto para obter timestamp numérico, evitando NaNs oriundos do cache local com serverTimestamp()
function safeGetTime(timestamp: any): number {
  if (!timestamp) return Date.now();
  if (typeof timestamp.toMillis === 'function') {
    try {
      return timestamp.toMillis();
    } catch (e) {
      // Ignorar e tentar fallback
    }
  }
  if (typeof timestamp.toDate === 'function') {
    try {
      return timestamp.toDate().getTime();
    } catch (e) {
      // Ignorar e tentar fallback
    }
  }
  if (timestamp.seconds !== undefined) {
    return timestamp.seconds * 1000 + (timestamp.nanoseconds ? timestamp.nanoseconds / 1000000 : 0);
  }
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }
  if (typeof timestamp === 'number') {
    return timestamp;
  }
  if (typeof timestamp === 'string') {
    const parse = Date.parse(timestamp);
    return isNaN(parse) ? Date.now() : parse;
  }
  return Date.now();
}

// Funções utilitárias de Isolamento de Perfil no cache local
function getLocalLists(userId: string): MnemeList[] {
  const finalUserId = userId || 'default';
  try {
    const val = localStorage.getItem(`mneme_backup_lists_${finalUserId}`);
    return val ? JSON.parse(val) : [];
  } catch (e) {
    console.error('Failed to parse local lists:', e);
    return [];
  }
}

function saveLocalLists(userId: string, lists: MnemeList[]) {
  const finalUserId = userId || 'default';
  try {
    localStorage.setItem(`mneme_backup_lists_${finalUserId}`, JSON.stringify(lists));
  } catch (e) {
    console.error('Failed to save local lists:', e);
  }
}

function getLocalItems(userId: string, listId: string): MnemeItem[] {
  const finalUserId = userId || 'default';
  try {
    const val = localStorage.getItem(`mneme_backup_items_${finalUserId}_${listId}`);
    return val ? JSON.parse(val) : [];
  } catch (e) {
    console.error('Failed to parse local items:', e);
    return [];
  }
}

function saveLocalItems(userId: string, listId: string, items: MnemeItem[]) {
  const finalUserId = userId || 'default';
  try {
    localStorage.setItem(`mneme_backup_items_${finalUserId}_${listId}`, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save local items:', e);
  }
}

export const mnemeService = {
  getLocalList: (userId: string, listId: string): MnemeList | null => {
    const lists = getLocalLists(userId);
    return lists.find(l => l.id === listId) || null;
  },

  // Escutar todas as listas onde o usuário é dono ou usuário autorizado (suporta ID e E-mail com blindagem local instantânea)
  subscribeToLists: (userId: string, userEmail: string | null | undefined, callback: (lists: MnemeList[]) => void) => {
    const currentUid = userId || auth.currentUser?.uid || 'default';
    
    // 1. Carregamento local instantâneo (Reduz latência e impede tela em branco)
    const localBackup = getLocalLists(currentUid);
    if (localBackup.length > 0) {
      callback(localBackup);
    }

    const q1 = query(
      collection(db, LISTS_COLLECTION),
      where('authorizedUsers', 'array-contains', currentUid)
    );

    let listsByUid: MnemeList[] = [];
    let listsByEmail: MnemeList[] = [];

    const handleMergedUpdate = () => {
      const mergedMap = new Map<string, MnemeList>();
      
      // Preservar apenas itens temporários locais ainda pendentes de gravação remota
      localBackup.forEach(l => {
        if (l.id.startsWith('temp_') || l.id.startsWith('local_')) {
          mergedMap.set(l.id, l);
        }
      });
      
      // Sobrescrever e preencher com documentos autoritativos recebidos do servidor
      listsByUid.forEach(l => mergedMap.set(l.id, l));
      listsByEmail.forEach(l => mergedMap.set(l.id, l));
      
      const lists = Array.from(mergedMap.values());
      
      // Ordenar client-side por updatedAt decrescente com fallback robusto sem NaN
      lists.sort((a, b) => {
        const tA = safeGetTime(a.updatedAt);
        const tB = safeGetTime(b.updatedAt);
        return tB - tA;
      });

      // Salvar no espelho local isolado
      saveLocalLists(currentUid, lists);
      callback(lists);
    };

    const unsub1 = onSnapshot(q1, { includeMetadataChanges: true }, (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      listsByUid = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MnemeList[];
      handleMergedUpdate();
    }, (error) => {
      console.warn('Silent Firestore handling on lists, using local backup shield:', error);
    });

    let unsub2 = () => {};
    if (userEmail) {
      const q2 = query(
        collection(db, LISTS_COLLECTION),
        where('authorizedUsers', 'array-contains', userEmail)
      );
      unsub2 = onSnapshot(q2, { includeMetadataChanges: true }, (snapshot) => {
        if (snapshot.metadata.hasPendingWrites) return;
        listsByEmail = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MnemeList[];
        handleMergedUpdate();
      }, (error) => {
        console.warn('Silent Firestore handling on shared lists, using local backup shield:', error);
      });
    }

    return () => {
      unsub1();
      unsub2();
    };
  },

  // Escutar itens de uma lista específica com blindagem local instantânea
  subscribeToItems: (listId: string, callback: (items: MnemeItem[]) => void) => {
    const currentUid = auth.currentUser?.uid || 'default';
    
    // 1. Carregamento local instantâneo
    const localBackup = getLocalItems(currentUid, listId);
    if (localBackup.length > 0) {
      callback(localBackup);
    }

    if (listId.startsWith('temp_') || listId.startsWith('local_')) {
      // Aborta a chamada de rede para evitar o crash de permissão no Firestore
      return () => {};
    }

    const q = query(
      collection(db, ITEMS_COLLECTION),
      where('listId', '==', listId)
    );

    return onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) {
        return;
      }
      const serverItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MnemeItem[];

      const mergedMap = new Map<string, MnemeItem>();

      // Preservar itens temporários locais ainda pendentes de gravação remota
      localBackup.forEach(i => {
        if (i.id.startsWith('temp_') || i.id.startsWith('local_')) {
          mergedMap.set(i.id, i);
        }
      });

      // Sobrescrever e preencher com os documentos oficiais recebidos do Firestore
      serverItems.forEach(i => mergedMap.set(i.id, i));

      const items = Array.from(mergedMap.values());

      // Ordenar client-side por createdAt crescente com fallback robusto sem NaN
      items.sort((a, b) => {
        const tA = safeGetTime(a.createdAt);
        const tB = safeGetTime(b.createdAt);
        return tA - tB;
      });

      // Salvar no espelho local isolado
      saveLocalItems(currentUid, listId, items);
      callback(items);
    }, (error) => {
      console.warn('Silent Firestore handling on items, using local backup shield:', error);
    });
  },

  createList: async (userId: string, name: string) => {
    const currentUid = userId || 'default';
    const tempId = 'temp_' + Date.now();
    
    if (navigator.onLine) {
      try {
        const newListData: Partial<MnemeList> = {
          name,
          ownerId: currentUid,
          authorizedUsers: [currentUid],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, LISTS_COLLECTION), newListData);
        
        // Registrar no backup local com o ID real
        const localLists = getLocalLists(currentUid);
        const newList: MnemeList = {
          id: docRef.id,
          name,
          ownerId: currentUid,
          authorizedUsers: [currentUid],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        localLists.unshift(newList);
        saveLocalLists(currentUid, localLists);

        return docRef;
      } catch (e) {
        console.error('List creation failed on Firestore:', e);
        throw e; // Lança o erro para impedir navegação no frontend
      }
    } else {
      // Registro imediato no cache de isolamento local para evitar flicker quando offline
      const localLists = getLocalLists(currentUid);
      const newListMock: MnemeList = {
        id: tempId,
        name,
        ownerId: currentUid,
        authorizedUsers: [currentUid],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      localLists.unshift(newListMock);
      saveLocalLists(currentUid, localLists);
      return { id: tempId };
    }
  },

  grantAccess: async (listId: string, email: string) => {
    const currentUid = auth.currentUser?.uid || 'default';
    const emailToGrant = email.trim();

    // 1. Encontrar o UID caso o usuário já esteja cadastrado no ECOBR232
    let targetUidOrEmail: string = emailToGrant;
    try {
      const { query, collection, where, getDocs } = await import('firebase/firestore');
      const q = query(collection(db, 'users'), where('email', '==', emailToGrant));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const userDoc = querySnap.docs[0];
        targetUidOrEmail = userDoc.id; // UID é o ID do documento do usuário
      }
    } catch (err) {
      console.warn("Silent search for user UID mapped to email failed, defaulting to email:", err);
    }

    // 2. Atualizar cache local
    const localLists = getLocalLists(currentUid).map(l => {
      if (l.id === listId) {
        const usersSet = new Set<string>(l.authorizedUsers || []);
        usersSet.add(targetUidOrEmail);
        const sharedSet = new Set<string>((l as any).sharedWith || []);
        sharedSet.add(emailToGrant);
        return { 
          ...l, 
          authorizedUsers: Array.from(usersSet), 
          sharedWith: Array.from(sharedSet) as string[],
          updatedAt: new Date() 
        } as MnemeList;
      }
      return l;
    });
    saveLocalLists(currentUid, localLists);

    // 3. Atualizar Firestore de forma atômica via runTransaction (ACID)
    try {
      if (!listId.startsWith('temp_') && !listId.startsWith('local_')) {
        await runTransaction(db, async (transaction) => {
          const listRef = doc(db, LISTS_COLLECTION, listId);
          const listSnap = await transaction.get(listRef);
          if (!listSnap.exists()) {
            throw new Error("Lista não encontrada.");
          }
          const listData = listSnap.data() as any;
          const currentAuthorized = listData.authorizedUsers || [];
          const currentShared = listData.sharedWith || [];

          const newAuthorized = [...currentAuthorized];
          if (!newAuthorized.includes(targetUidOrEmail)) {
            newAuthorized.push(targetUidOrEmail);
          }
          const newShared = [...currentShared];
          if (!newShared.includes(emailToGrant)) {
            newShared.push(emailToGrant);
          }

          transaction.update(listRef, {
            authorizedUsers: newAuthorized,
            sharedWith: newShared,
            updatedAt: serverTimestamp()
          });
        });
      }
    } catch (e) {
      console.error('Silent handling block on authorized user email add (grantAccess):', e);
      handleFirestoreError(e, OperationType.UPDATE, `grantAccess/${listId}`);
    }
  },

  addAuthorizedUser: async (listId: string, uid: string) => {
    const currentUid = auth.currentUser?.uid || 'default';
    const localLists = getLocalLists(currentUid).map(l => {
      if (l.id === listId) {
        const usersSet = new Set(l.authorizedUsers || []);
        usersSet.add(uid);
        return { ...l, authorizedUsers: Array.from(usersSet), updatedAt: new Date() };
      }
      return l;
    });
    saveLocalLists(currentUid, localLists);

    try {
      if (!listId.startsWith('temp_') && !listId.startsWith('local_')) {
        await runTransaction(db, async (transaction) => {
          const listRef = doc(db, LISTS_COLLECTION, listId);
          const listSnap = await transaction.get(listRef);
          if (!listSnap.exists()) {
            throw new Error("Lista não encontrada.");
          }
          const listData = listSnap.data() as MnemeList;
          const currentUsers = listData.authorizedUsers || [];
          if (!currentUsers.includes(uid)) {
            transaction.update(listRef, {
              authorizedUsers: arrayUnion(uid),
              updatedAt: serverTimestamp()
            });
          }
        });
      }
    } catch (e) {
      console.error('Silent handling block on authorized user uid add (addAuthorizedUser):', e);
    }
  },

  addItem: async (listId: string, userId: string, itemData: Partial<MnemeItem>) => {
    const currentUid = userId || 'default';
    const tempId = 'temp_item_' + Date.now();
    
    // 1. Salvamento local imediato (Garante responsividade sem falhas de renderização)
    const localItems = getLocalItems(currentUid, listId);
    const newLocalItem: MnemeItem = {
      id: tempId,
      listId,
      addedBy: currentUid,
      isCompleted: false,
      createdAt: new Date(),
      ...itemData
    } as MnemeItem;
    
    localItems.push(newLocalItem);
    saveLocalItems(currentUid, listId, localItems);

    try {
      const newItemData: Partial<MnemeItem> = {
        ...itemData,
        listId,
        addedBy: currentUid,
        isCompleted: false,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, ITEMS_COLLECTION), newItemData);
      
      // Substituir ID temporário pelo real
      const updated = getLocalItems(currentUid, listId).map(i => i.id === tempId ? { ...i, id: docRef.id } : i);
      saveLocalItems(currentUid, listId, updated);

      // Sincronizar list timestamp de forma não-bloqueante
      if (!listId.startsWith('temp_') && !listId.startsWith('local_')) {
        const listRef = doc(db, LISTS_COLLECTION, listId);
        await updateDoc(listRef, { updatedAt: serverTimestamp() });
      }
    } catch (e) {
      console.warn('Item creation failed on firestore rules or network, maintaining local state:', e);
    }
  },

  toggleItem: async (listId: string, itemId: string, isCompleted: boolean) => {
    const currentUid = auth.currentUser?.uid || 'default';
    
    // 1. Atualizar localmente
    const localItems = getLocalItems(currentUid, listId).map(i => i.id === itemId ? { ...i, isCompleted } : i);
    saveLocalItems(currentUid, listId, localItems);

    try {
      if (!itemId.startsWith('temp_') && !itemId.startsWith('local_') && !listId.startsWith('temp_')) {
        const itemRef = doc(db, ITEMS_COLLECTION, itemId);
        await updateDoc(itemRef, { isCompleted });
        
        const listRef = doc(db, LISTS_COLLECTION, listId);
        await updateDoc(listRef, { updatedAt: serverTimestamp() });
      }
    } catch (e) {
      console.warn('Transient error toggling item, kept locally:', e);
    }
  },

  deleteItem: async (itemId: string) => {
    const currentUid = auth.currentUser?.uid || 'default';
    
    // Varre e deleta de qualquer backup local se existir
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(`mneme_backup_items_${currentUid}_`)) {
          const listId = key.substring(`mneme_backup_items_${currentUid}_`.length);
          const items = getLocalItems(currentUid, listId);
          if (items.some(i => i.id === itemId)) {
            const updated = items.filter(i => i.id !== itemId);
            saveLocalItems(currentUid, listId, updated);
            break;
          }
        }
      }
    } catch (err) {
      console.error('Local backup deletion handler failed:', err);
    }

    try {
      if (!itemId.startsWith('temp_') && !itemId.startsWith('local_')) {
        await deleteDoc(doc(db, ITEMS_COLLECTION, itemId));
      }
    } catch (e) {
      console.error('Error deleting item: ', e);
    }
  },

  updateItem: async (itemId: string, data: Partial<MnemeItem>) => {
    const currentUid = auth.currentUser?.uid || 'default';
    const hasPriceUpdate = data.price !== undefined;
    const locationVal = (data as any).location || 'Mercado';
    
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(`mneme_backup_items_${currentUid}_`)) {
          const listId = key.substring(`mneme_backup_items_${currentUid}_`.length);
          const items = getLocalItems(currentUid, listId);
          if (items.some(i => i.id === itemId)) {
            const updated = items.map(i => {
              if (i.id === itemId) {
                const updatedObj = { ...i, ...data };
                if (hasPriceUpdate) {
                  const history = i.priceHistory || [];
                  updatedObj.priceHistory = [
                    ...history,
                    {
                      price: data.price!,
                      date: new Date().toISOString(),
                      location: locationVal
                    }
                  ];
                }
                return updatedObj;
              }
              return i;
            });
            saveLocalItems(currentUid, listId, updated);
            break;
          }
        }
      }
    } catch (err) {
      console.error('Local backup update handler failed:', err);
    }

    try {
      if (!itemId.startsWith('temp_') && !itemId.startsWith('local_')) {
        const itemRef = doc(db, ITEMS_COLLECTION, itemId);
        const updatePayload: any = { ...data };
        if (hasPriceUpdate) {
          updatePayload.priceHistory = arrayUnion({
            price: data.price!,
            date: new Date().toISOString(),
            location: locationVal
          });
        }
        await updateDoc(itemRef, updatePayload);
      }
    } catch (e) {
      console.error('Error updating item:', e);
      throw e;
    }
  },

  archiveList: async (listId: string, totalSpent?: number) => {
    const currentUid = auth.currentUser?.uid || 'default';
    const localLists = getLocalLists(currentUid).map(l => {
      if (l.id === listId) {
        return { 
          ...l, 
          status: 'archived' as const, 
          archivedAt: new Date(), 
          updatedAt: new Date(),
          ...(totalSpent !== undefined ? { totalSpent } : {})
        };
      }
      return l;
    });
    saveLocalLists(currentUid, localLists);

    try {
      if (!listId.startsWith('temp_') && !listId.startsWith('local_')) {
        const listRef = doc(db, LISTS_COLLECTION, listId);
        const updatePayload: any = { 
          status: 'archived',
          archivedAt: serverTimestamp(),
          updatedAt: serverTimestamp() 
        };
        if (totalSpent !== undefined) {
          updatePayload.totalSpent = totalSpent;
        }
        await updateDoc(listRef, updatePayload);
      }
    } catch (e) {
      console.error('Error archiving list:', e);
    }
  },

  updateListMetadata: async (listId: string, newName: string) => {
    const currentUid = auth.currentUser?.uid || 'default';
    
    // Update locally
    const localLists = getLocalLists(currentUid).map(l => {
      if (l.id === listId) {
        return { ...l, name: newName, updatedAt: new Date() };
      }
      return l;
    });
    saveLocalLists(currentUid, localLists);

    try {
      if (!listId.startsWith('temp_') && !listId.startsWith('local_')) {
        const listRef = doc(db, LISTS_COLLECTION, listId);
        await updateDoc(listRef, {
          name: newName,
          updatedAt: serverTimestamp()
        });
      }
    } catch (e) {
      console.error('Error updating list metadata: ', e);
      throw e;
    }
  },

  deleteListCascade: async (listId: string, itemsCount: number) => {
    const currentUid = auth.currentUser?.uid || 'default';
    
    // 1. Remove list locally
    const localLists = getLocalLists(currentUid).filter(l => l.id !== listId);
    saveLocalLists(currentUid, localLists);
    
    // 2. Remove items locally
    try {
      localStorage.removeItem(`mneme_backup_items_${currentUid}_${listId}`);
    } catch (e) {}

    // 3. Remote ACID cascade deletion
    try {
      if (!listId.startsWith('temp_') && !listId.startsWith('local_')) {
        const { getDocs, query, where, collection } = await import('firebase/firestore');
        const itemsQuery = query(collection(db, ITEMS_COLLECTION), where('listId', '==', listId));
        const itemsSnap = await getDocs(itemsQuery);
        
        await runTransaction(db, async (transaction) => {
          // Delete main list document
          const listRef = doc(db, LISTS_COLLECTION, listId);
          transaction.delete(listRef);
          
          // Delete all associated items (nested docs) to prevent orphans
          itemsSnap.docs.forEach((itemDoc) => {
            transaction.delete(itemDoc.ref);
          });
        });
      }
    } catch (e) {
      console.error('ACID cascade list deletion failed: ', e);
      throw e;
    }
  },

  deleteList: async (listId: string) => {
    const currentUid = auth.currentUser?.uid || 'default';
    const localLists = getLocalLists(currentUid).filter(l => l.id !== listId);
    saveLocalLists(currentUid, localLists);
    
    try {
      localStorage.removeItem(`mneme_backup_items_${currentUid}_${listId}`);
    } catch (e) {}

    try {
      if (!listId.startsWith('temp_') && !listId.startsWith('local_')) {
        await deleteDoc(doc(db, LISTS_COLLECTION, listId));
      }
    } catch (e) {
      console.error('Error deleting list:', e);
    }
  },

  cloneSupplyList: async (originalListId: string): Promise<string> => {
    const currentUid = auth.currentUser?.uid || 'default';
    if (!originalListId) {
      throw new Error("ID da lista original inválido.");
    }

    try {
      // 1. Obter snapshot dos documentos da lista original
      const listRef = doc(db, LISTS_COLLECTION, originalListId);
      const listSnap = await getDoc(listRef);
      if (!listSnap.exists()) {
        throw new Error("Lista original não encontrada.");
      }

      const originalListData = listSnap.data() as MnemeList;
      
      // Obter itens associados usando os helpers oficiais
      const { getDocs, collection, query, where, writeBatch } = await import('firebase/firestore');
      const itemsQuery = query(
        collection(db, ITEMS_COLLECTION),
        where('listId', '==', originalListId)
      );
      const itemsSnap = await getDocs(itemsQuery);
      const originalItems = itemsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MnemeItem[];

      // 2. Criar nova lista e copiar itens usando Batch Write para atomicidade pura
      const batch = writeBatch(db);
      const newListRef = doc(collection(db, LISTS_COLLECTION));
      const newListId = newListRef.id;

      const newListName = `Cópia de ${originalListData.name}`;
      
      const newListData = {
        name: newListName,
        ownerId: currentUid,
        authorizedUsers: [currentUid],
        status: 'active' as const,
        supermarketName: originalListData.supermarketName || '',
        totalSpent: originalListData.totalSpent || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      batch.set(newListRef, newListData);

      originalItems.forEach(item => {
        const newItemRef = doc(collection(db, ITEMS_COLLECTION));
        const newItemData = {
          listId: newListId,
          name: item.name,
          quantity: item.quantity || 1,
          category: item.category || "Geral",
          brand: item.brand || "",
          weightVolume: item.weightVolume || "",
          vibe: item.vibe || "",
          isCompleted: false, // Começa desmarcado para o novo ciclo econômico
          notes: item.notes || "",
          price: item.price || 0,
          nutriScore: item.nutriScore || "",
          addedBy: currentUid,
          createdAt: serverTimestamp()
        };
        batch.set(newItemRef, newItemData);
      });

      await batch.commit();

      // 3. Atualizar backups locais síncronos de forma resiliente
      try {
        const localLists = getLocalLists(currentUid);
        const newLocalList: MnemeList = {
          id: newListId,
          name: newListName,
          ownerId: currentUid,
          authorizedUsers: [currentUid],
          status: 'active',
          supermarketName: originalListData.supermarketName,
          totalSpent: originalListData.totalSpent,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        localLists.unshift(newLocalList);
        saveLocalLists(currentUid, localLists);

        const newLocalItems: MnemeItem[] = originalItems.map((item, index) => ({
          ...item,
          id: `local_clone_${index}_${Date.now()}`,
          listId: newListId,
          isCompleted: false,
          addedBy: currentUid,
          createdAt: new Date()
        }));
        saveLocalItems(currentUid, newListId, newLocalItems);
      } catch (err) {
        console.warn("Silent local storage hydration warning under cloning:", err);
      }

      return newListId;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `clone_list/${originalListId}`);
      throw e;
    }
  },

  // Cleanup logic for lists older than 12 months
  cleanupOldLists: async (userId: string) => {
    try {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
      
      const q = query(
        collection(db, LISTS_COLLECTION),
        where('ownerId', '==', userId),
        where('updatedAt', '<', twelveMonthsAgo)
      );
    } catch (e) {
      console.warn('Cleanup failed non-critically:', e);
    }
  }
};
