import { initializeFirebase } from '@/firebase';

const { firestore: db, auth } = initializeFirebase();

export { db, auth };