
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'
import { User as MemoraUser } from '@/lib/types';
import { useDoc, WithId } from './firestore/use-doc';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  userData: WithId<MemoraUser> | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState extends UserAuthState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser extends FirebaseContextState {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult extends UserAuthState {}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userData, isLoading: isUserDocLoading, error: userDocError } = useDoc<MemoraUser>(userDocRef);

  useEffect(() => {
    if (!auth) {
      setIsAuthLoading(false);
      setAuthError(new Error("Auth service not provided."));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setIsAuthLoading(false);
        setAuthError(null);
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUser(null);
        setIsAuthLoading(false);
        setAuthError(error);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  const isUserLoading = isAuthLoading || (user ? isUserDocLoading : false);
  const combinedError = authError || userDocError;

  const contextValue = useMemo((): FirebaseContextState => ({
    areServicesAvailable: !!(firebaseApp && firestore && auth),
    firebaseApp,
    firestore,
    auth,
    user,
    userData: userData ?? null,
    isUserLoading,
    userError: combinedError,
  }), [firebaseApp, firestore, auth, user, userData, isUserLoading, combinedError]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};


/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    ...context,
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
  };
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => {
  const { user, userData, isUserLoading, userError } = useFirebase();
  return { user, userData, isUserLoading, userError };
};
