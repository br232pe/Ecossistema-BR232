import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../types';

const { firestoreDatabaseId, ...sanitizedConfig } = firebaseConfig as any;
const app = initializeApp(sanitizedConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firebase persistence failed-precondition (multiple tabs).');
    } else if (err.code === 'unimplemented') {
      console.warn('Firebase persistence unimplemented in current browser.');
    } else {
      console.warn('Firebase persistence error:', err);
    }
  });
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  accessToken: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  accessToken: null,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Proposta 1 (Inicialização Tolerante) - Sobrevivência de Malha na BR-232
    // Se a autenticação demorar mais de 5.0 segundos (ex: sinal doentio ou IndexedDB travado),
    // liberamos o carregamento da malha de forma tolerante para não deixar a tela rodando eternamente.
    const timeoutId = setTimeout(() => {
      setLoading((currLoading) => {
        if (currLoading) {
          console.warn('Alerta Ecossistema: Tempo limite de autenticação excedido na BR-232. Ativando Inicialização Tolerante.');
          return false;
        }
        return currLoading;
      });
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      let resolvedProfile: UserProfile | null = null;
      try {
        if (u) {
          try {
            // Fetch or create profile
            const userRef = doc(db, 'users', u.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              const dbData = userSnap.data();
              resolvedProfile = {
                ...dbData,
                displayName: u.displayName || u.email?.split('@')[0] || 'Motorista Anônimo',
                photoURL: u.photoURL || '',
                currentCity: dbData.currentCity || 'Recife'
              } as UserProfile;
            } else {
              // Create multimodal base profile with the keys including role, referredBy, and linkedTrunk
              const dbProfile = {
                uid: u.uid,
                email: u.email || '',
                identities: {
                  isConsumer: true,
                  isPatron: false,
                  isDriver: false,
                  isGuardian: false,
                  isSecretary: false,
                  isAssociationManager: false,
                  isTravelManager: false,
                  isServiceProvider: false,
                  isColumnist: false
                },
                stats: {
                  ip: 0,
                  merit: 0,
                  associationForce: 0,
                  totalKm: 0
                },
                role: 'user',
                referredBy: '',
                linkedTrunk: '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              };
              
              // Validate creation success according to rules
              await setDoc(userRef, dbProfile);
              console.log('Documento de perfil criado com sucesso para o UID:', u.uid);

              resolvedProfile = {
                ...dbProfile,
                displayName: u.displayName || u.email?.split('@')[0] || 'Motorista Anônimo',
                photoURL: u.photoURL || '',
                currentCity: 'Recife'
              } as UserProfile;
            }
          } catch (profileError) {
            console.error('Erro tolerado ao obter perfil no Firestore (Modo Offline/Instabilidade):', profileError);
            throw profileError; // Propagate for registration failure handling
          }
        }
        
        // Atualização atômica integrada para resolver o DOM de uma vez
        setUser(u);
        setProfile(resolvedProfile);
      } catch (authError) {
        console.error('Erro tolerado no detector de autenticação:', authError);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const [accessToken, setAccessToken] = useState<string | null>(null);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email login error:', error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      loginWithGoogle, 
      loginWithEmail, 
      registerWithEmail, 
      logout, 
      accessToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
