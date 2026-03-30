import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';

const SEED_PATRONS = [
  {
    name: "Rei das Coxinhas",
    tier: "Alta Cilindrada",
    city: "Gravatá",
    km: 71,
    coordinates: { lat: -8.2016, lng: -35.5186 },
    coverImage: "https://picsum.photos/seed/reidacoxinha/1920/1080",
    cta: "Ver Cardápio",
    isActive: true,
    isSponsor: true
  },
  {
    name: "Posto da Serra",
    tier: "Twister",
    city: "Gravatá",
    km: 75,
    coordinates: { lat: -8.2025, lng: -35.5200 },
    coverImage: "https://picsum.photos/seed/postodaserra/1920/1080",
    cta: "Abastecer Agora",
    isActive: true,
    isSponsor: true
  },
  {
    name: "Churrascaria da Paz",
    tier: "Factor",
    city: "Bezerros",
    km: 102,
    coordinates: { lat: -8.2384, lng: -35.7944 },
    coverImage: "https://picsum.photos/seed/churrascaria/1920/1080",
    cta: "Reservar Mesa",
    isActive: true,
    isSponsor: true
  },
  {
    name: "Museu do Barro",
    tier: "Titan",
    city: "Caruaru",
    km: 130,
    coordinates: { lat: -8.2833, lng: -35.9736 },
    coverImage: "https://picsum.photos/seed/museu/1920/1080",
    cta: "Ver Exposição",
    isActive: true,
    isSponsor: true
  }
];

export const seedPatrons = async () => {
  try {
    const patronsRef = collection(db, 'patrons');
    const existing = await getDocs(patronsRef);
    
    if (existing.empty) {
      console.log('Seeding patrons...');
      for (const patron of SEED_PATRONS) {
        await addDoc(patronsRef, patron);
      }
      console.log('Seeding complete!');
    } else {
      console.log('Patrons already seeded.');
    }
  } catch (error) {
    console.error('Error seeding patrons:', error);
  }
};
