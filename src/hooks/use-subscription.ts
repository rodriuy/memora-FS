
'use client';
import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';


type Subscription = {
  tier: 'free' | 'premium';
  stories: {
    current: number;
    limit: number | null;
  };
  photos: {
    current: number;
    limit: number | null;
  };
};

export function useSubscription() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [familyId, setFamilyId] = useState<string | null>(null);
  
  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userData } = useDoc(userDocRef);

  useEffect(() => {
    if (userData) {
      setFamilyId(userData.familyId);
    }
  }, [userData]);
  
  const familyDocRef = useMemoFirebase(() => familyId ? doc(firestore, 'families', familyId) : null, [firestore, familyId]);
  const { data: familyData } = useDoc(familyDocRef);

  const subscription: Subscription | null = familyData ? {
      tier: familyData.subscriptionTier,
      // Usage would be calculated from collections in a real app
      stories: { current: 0, limit: familyData.subscriptionTier === 'free' ? 5 : null },
      photos: { current: 0, limit: familyData.subscriptionTier === 'free' ? 20 : null },
  } : null;


  const isPremium = subscription?.tier === 'premium';

  return { subscription, isPremium };
}
