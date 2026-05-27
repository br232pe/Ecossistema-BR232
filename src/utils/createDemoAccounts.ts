import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../contexts/AuthContext';

/**
 * Função utilitária administrativa para registrar o usuário demo daspromo@ecobr232.com
 * e gravá-lo no Firestore com a role 'promoter_branch'.
 */
export async function provisionDemoPromoter(): Promise<{ success: boolean; message: string }> {
  const email = 'daspromo@ecobr232.com';
  const password = 'DAs@2026#Mo';

  try {
    // 1. Criar o usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const u = userCredential.user;

    // 2. Montar o perfil com role 'promoter_branch'
    const profileData = {
      uid: u.uid,
      email: u.email || '',
      displayName: 'Promotor Galho Demo',
      currentCity: 'Recife',
      identities: {
        isColumnist: false
      },
      stats: {
        reputation: 5,
        ratingCount: 1,
        associationForce: 0,
        totalKm: 0
      },
      role: 'promoter_branch',
      referredBy: '',
      linkedTrunk: '',
      planTier: 'bronze',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // 3. Salvar o perfil no Firestore (users/{uid})
    const userRef = doc(db, 'users', u.uid);
    await setDoc(userRef, profileData);

    return { 
      success: true, 
      message: `Usuário demo ${email} registrado com sucesso. UID: ${u.uid}` 
    };
  } catch (error: any) {
    console.error('Erro ao provisionar usuário demo:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      return { 
        success: false, 
        message: 'O usuário daspromo@ecobr232.com já está cadastrado no sistema Firebase.' 
      };
    }
    
    return { 
      success: false, 
      message: error.message || 'Erro desconhecido ao cadastrar usuário' 
    };
  }
}
