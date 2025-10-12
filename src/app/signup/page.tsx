
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
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, collection, serverTimestamp, writeBatch, arrayUnion } from 'firebase/firestore';


export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const familyIdFromInvite = searchParams.get('familyId');

  const setupUserAndFamilyIfNeeded = async (user: FirebaseUser) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      console.log('User document already exists, skipping setup.');
      return;
    }

    const batch = writeBatch(firestore);

    let finalFamilyId = familyIdFromInvite;

    // If user is NOT joining via invite link, create a new family
    if (!familyIdFromInvite) {
        const familyRef = doc(collection(firestore, 'families'));
        finalFamilyId = familyRef.id;
        const finalFamilyName = familyName.trim() || `${user.displayName || 'Mi'}'s Familia`;
        
        const familyData = {
          adminId: user.uid,
          familyName: finalFamilyName,
          memberIds: [user.uid],
          subscriptionTier: 'free',
          createdAt: serverTimestamp(),
        };
        batch.set(familyRef, familyData);
    } else {
        // If user IS joining via invite link, add them to existing family
        const familyRef = doc(firestore, 'families', familyIdFromInvite);
        batch.update(familyRef, {
            memberIds: arrayUnion(user.uid)
        });
    }

    const userData = {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName,
        familyId: finalFamilyId,
        avatarId: `user-${Math.floor(Math.random() * 4) + 1}`,
        bio: '',
    };
    batch.set(userRef, userData);
    
    await batch.commit();
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
    if (!auth) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, { displayName });

      // We need to reload user to get the displayName updated for setup
      await userCredential.user.reload();
      const updatedUser = auth.currentUser;

      if (updatedUser) {
        await setupUserAndFamilyIfNeeded(updatedUser);
      }

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
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setupUserAndFamilyIfNeeded(user);
      
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
