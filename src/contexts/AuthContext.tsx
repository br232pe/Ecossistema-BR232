import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../types';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  accessToken: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  accessToken: null,
  loginWithGoogle: async () => {},
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
              resolvedProfile = userSnap.data() as UserProfile;
            } else {
              // Create multimodal base profile
              const newProfile: Partial<UserProfile> = {
                uid: u.uid,
                email: u.email || '',
                displayName: u.displayName || 'Motorista Anônimo',
                photoURL: u.photoURL || '',
                currentCity: 'Recife', // Default
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
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              };
              
              await setDoc(userRef, newProfile);
              resolvedProfile = newProfile as UserProfile;
            }
          } catch (profileError) {
            console.error('Erro tolerado ao obter perfil no Firestore (Modo Offline/Instabilidade):', profileError);
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
    provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
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

  const logout = async () => {
    await signOut(auth);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, logout, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
