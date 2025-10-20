
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
import React, { Suspense } from 'react';
import { useState } from 'react';
import { useUser } from '@/firebase'; // Importar useUser
import { useToast } from '@/hooks/use-toast';
import { auth, functions } from "@/firebase/client"; // Importar 'functions'
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estado para gestionar la carga después de llamar a la función
  const [isSettingUp, setIsSettingUp] = useState(false);

  const familyIdFromInvite = searchParams.get('familyId');

  // Usamos el hook useUser para poder revalidar los datos
  // y saber cuándo está listo para la redirección.
  const { revalidateUser } = useUser();

  const handleSuccess = async () => {
    await revalidateUser?.(); // Forzar la recarga de los datos del usuario
    router.push('/dashboard');
  };
  const handleSignup = async () => {
    if (!displayName || !email || !password) {
        toast({
            variant: "destructive",
            title: "Faltan campos",
            description: "Por favor, completa todos los campos requeridos.",
        });
        return;
    }

    setIsSettingUp(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });

      // Llama a la Cloud Function
      const setupUserAndFamily = httpsCallable(functions, 'setupUserAndFamily'); // Usar la instancia importada
      await setupUserAndFamily({ 
        displayName, 
        familyName: familyName || null, 
        familyIdFromInvite: familyIdFromInvite || null });

      toast({
        title: "Cuenta Creada",
        description: "¡Bienvenido/a a Memora! Te estamos redirigiendo...",
      });
      await handleSuccess();
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast({
          variant: 'destructive',
          title: 'Email ya registrado',
          description: 'Este email ya está en uso. Por favor, intenta iniciar sesión.',
        });
      } else {
        console.error("Signup Error:", error);
        toast({
            variant: 'destructive',
            title: 'Fallo en el registro',
            description: error.message,
        });
      }
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    setIsSettingUp(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Llama a la Cloud Function
      const setupUserAndFamily = httpsCallable(functions, 'setupUserAndFamily'); // Usar la instancia importada
      await setupUserAndFamily({ 
        displayName: user.displayName || 'Usuario Anónimo', 
        familyName: familyName || null, 
        familyIdFromInvite: familyIdFromInvite || null });
      
      toast({
        title: "Sesión Iniciada",
        description: "¡Bienvenido/a a Memora!",
      });
      await handleSuccess();
    } catch (error: any) {
       console.error("Google Signup Error:", error);
       toast({
         variant: 'destructive',
         title: 'Fallo en el inicio con Google',
         description: error.message,
       });
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-xl font-headline">
            {familyIdFromInvite ? 'Únete a la Familia' : 'Regístrate en Memora'}
        </CardTitle>
        <CardDescription>
          {familyIdFromInvite ? 'Estás a un paso de unirte al círculo familiar.' : 'Ingresa tu información para crear una cuenta y empezar a preservar la historia de tu familia.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="display-name">Tu Nombre</Label>
            <Input 
              id="display-name" 
              placeholder="Ej: Juan Pérez" 
              required 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
           {!familyIdFromInvite && (
            <div className="grid gap-2">
                <Label htmlFor="family-name">Nombre de la Familia (Opcional)</Label>
                <Input 
                id="family-name" 
                placeholder="Ej: Familia Pérez" 
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                />
            </div>
           )}
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
            <Label htmlFor="password">Contraseña</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleSignup} type="submit" className="w-full" disabled={isSettingUp}>
              {familyIdFromInvite ? 'Unirme y Crear Cuenta' : 'Crear una cuenta'}
          </Button>
          <Button onClick={handleGoogleSignup} variant="outline" className="w-full" disabled={isSettingUp}>
            Registrarse con Google
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="underline">
            Iniciar sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
