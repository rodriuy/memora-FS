
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
import { useToast } from '@/hooks/use-toast';
import { auth, db } from "@/firebase/client";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, type User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";


function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const familyIdFromInvite = searchParams.get('familyId');

  async function setupUserAndFamilyIfNeeded(authUser: FirebaseUser, displayName: string, email: string, familyName: string, familyId: string | null) {
    if (!authUser || !authUser.uid) throw new Error("authUser missing");

    const uid = authUser.uid;
    const userRef = doc(db, "users", uid);

    try {
      const existing = await getDoc(userRef);
      if (!existing.exists()) {
        await setDoc(userRef, {
          id: uid,
          name: displayName || null,
          email: email || null,
          familyId: null,
          createdAt: serverTimestamp()
        });
      } else {
        await updateDoc(userRef, {
          name: displayName || existing.data().name || null,
          email: email || existing.data().email || null,
        }).catch(() => {});
      }

      let finalFamilyId = familyId;
      if (!finalFamilyId) {
        const newFamilyRef = doc(collection(db, "families"));
        finalFamilyId = newFamilyRef.id;
        const finalFamilyName = familyName.trim() || `${displayName || 'Mi'}'s Familia`;

        await setDoc(newFamilyRef, {
          id: finalFamilyId,
          name: finalFamilyName,
          adminId: uid,
          memberIds: [uid],
          createdAt: serverTimestamp()
        });
        await updateDoc(userRef, { familyId: finalFamilyId }).catch(() => {});

      } else {
        const familyRef = doc(db, "families", finalFamilyId);
        const familyDoc = await getDoc(familyRef);
        if (familyDoc.exists()) {
            await updateDoc(familyRef, {
                memberIds: arrayUnion(uid)
            }).catch(() => {});
        }
        await updateDoc(userRef, { familyId: finalFamilyId }).catch(() => {});
      }

      return { ok: true };
    } catch (err: any) {
      console.error("signup/setupUserAndFamily error:", {
        message: err?.message,
        code: err?.code,
        stack: err?.stack,
      });
      throw err;
    }
  }


  const handleSignup = async () => {
    if (!displayName || !email || !password) {
        toast({
            variant: "destructive",
            title: "Faltan campos",
            description: "Por favor, completa todos los campos requeridos.",
        });
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });

      await setupUserAndFamilyIfNeeded(userCredential.user, displayName, email, familyName, familyIdFromInvite);

      toast({
        title: "Cuenta Creada",
        description: "¡Bienvenido/a a Memora! Te estamos redirigiendo...",
      });
      
      router.push('/dashboard');
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
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setupUserAndFamilyIfNeeded(user, user.displayName || '', user.email || '', familyName, familyIdFromInvite);
      
      toast({
        title: "Sesión Iniciada",
        description: "¡Bienvenido/a a Memora!",
      });
      router.push('/dashboard');
    } catch (error: any) {
       console.error("Google Signup Error:", error);
       toast({
         variant: 'destructive',
         title: 'Fallo en el inicio con Google',
         description: error.message,
       });
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
          <Button onClick={handleSignup} type="submit" className="w-full">
              {familyIdFromInvite ? 'Unirme y Crear Cuenta' : 'Crear una cuenta'}
          </Button>
          <Button onClick={handleGoogleSignup} variant="outline" className="w-full">
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
