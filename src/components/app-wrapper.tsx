
'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { MainLayout } from './layout/main-layout';

export function AppWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isLandingPage = pathname === '/';

  if (isAuthPage) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        {children}
      </main>
    );
  }
  
  if (isLandingPage) {
      return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}
