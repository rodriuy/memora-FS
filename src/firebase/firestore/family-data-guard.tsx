'use client';

import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Loader2 } from 'lucide-react';

interface FamilyDataGuardProps {
  children: React.ReactNode;
}

/**
 * A client-side component that acts as a guard for routes/components
 * that require the user to be part of a family.
 *
 * 1. Shows a loading state while the user data is being fetched.
 * 2. If the user has no familyId, it shows a prompt to create or join a family.
 * 3. If the user has a familyId, it renders the children components.
 */
export function FamilyDataGuard({ children }: FamilyDataGuardProps) {
  const { userData, isUserLoading } = useUser();

  // 1. Loading state
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando tu información...</p>
        </div>
      </div>
    );
  }

  // 2. User is loaded, but has no family
  if (!isUserLoading && !userData?.familyId) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] p-4">
        <Card className="max-w-lg w-full text-center">
          <CardHeader>
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle className="font-headline">Bienvenido/a a Memora</CardTitle>
            <CardDescription>
              Para empezar a guardar historias, necesitas crear o unirte a un círculo familiar.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/signup">Crear una Familia</Link>
            </Button>
            <Button variant="outline">Unirme con un Enlace (Próximamente)</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. User is loaded and has a family, render the protected content
  return <>{children}</>;
}