import { collection, getDocs, query, where } from 'firebase/firestore';
import { db as firestore } from '../../services/firebase';
import { StoredPatron } from '../../types';

// Haversine formula to calculate distance between two points in km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export const patronService = {
  async getNearestPatron(userLat: number, userLng: number): Promise<StoredPatron | null> {
    try {
      const patronsRef = collection(firestore, 'patrons');
      const q = query(patronsRef, where('status', '==', 'ativo'));
      const querySnapshot = await getDocs(q);
      
      let nearest: StoredPatron | null = null;
      let minDistance = Infinity;

      querySnapshot.forEach((doc) => {
        const data = doc.data() as StoredPatron;
        // Nota: Se o BD real usar GeoPoint, precisamos ajustar aqui.
        // Assumindo que data.coordinates existe conforme o tipo StoredPatron
        if (data.coordinates) {
          const dist = getDistance(userLat, userLng, data.coordinates.lat, data.coordinates.lng);
          
          if (dist < minDistance) {
            minDistance = dist;
            nearest = { ...data, id: doc.id };
          }
        }
      });

      return nearest;
    } catch (error) {
      console.error('Error fetching nearest patron:', error);
      return null;
    }
  }
};
