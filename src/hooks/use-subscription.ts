
import { useState, useEffect } from 'react';
import { subscription as mockSubscription } from '@/lib/data';

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
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    // In a real app, you would fetch this from your backend
    setSubscription(mockSubscription);
  }, []);

  const isPremium = subscription?.tier === 'premium';

  return { subscription, isPremium };
}
