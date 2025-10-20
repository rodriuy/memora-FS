
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/firebase'; // Importar useUser
import { auth, functions } from "@/firebase/client"; // Importar 'functions'
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { revalidateUser } = useUser();

  const handleLoginSuccess = async (authUser: FirebaseUser) => {
    const setupUserAndFamily = httpsCallable(functions, 'setupUserAndFamily');
    await setupUserAndFamily({ displayName: authUser.displayName });
    await revalidateUser?.();
    router.push('/dashboard');
  };

  const handleLogin = async () => {
    if (!auth) return;
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleLoginSuccess(result.user);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Fallo de Inicio de Sesión',
        description: 'Email o contraseña incorrectos.',
      });
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleLoginSuccess(result.user);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Fallo con Google',
        description: error.message,
      });
    }
  };


  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Entrar a Memora</CardTitle>
        <CardDescription>
          Introduce tu email para entrar a tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Contraseña</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleLogin} type="submit" className="w-full">
              Iniciar Sesión
          </Button>
          <Button onClick={handleGoogleLogin} variant="outline" className="w-full">
            Iniciar Sesión con Google
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          ¿No tienes una cuenta?{' '}
          <Link href="/signup" className="underline">
            Regístrate
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
