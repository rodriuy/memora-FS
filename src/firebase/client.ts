import { initializeFirebase } from '@/firebase';

const { app, firestore: db, auth } = initializeFirebase();

export { app, db, auth };