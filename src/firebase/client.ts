import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { firebaseConfig } from './config';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, 'us-central1'); // Especifica la región aquí

// En desarrollo, conecta a los emuladores.
// La variable `process.env.NEXT_PUBLIC_USE_EMULATORS` la puedes definir en tu .env.local
const USE_EMULATORS = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';

if (USE_EMULATORS) {
  console.log('Connecting to Firebase Emulators...');
  // Asegúrate de que no se conecten múltiples veces (importante para HMR de Next.js)
  if (typeof window !== 'undefined') {
    // @ts-ignore - emulatorConfig es una propiedad interna que nos ayuda a saber si ya está conectado
    if (!auth.emulatorConfig) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectFunctionsEmulator(functions, 'localhost', 5001);
    }
  }
}

export { app, auth, db, functions };