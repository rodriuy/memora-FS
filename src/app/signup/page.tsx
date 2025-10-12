
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
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, collection, serverTimestamp, writeBatch } from 'firebase/firestore';


export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const setupUserAndFamilyIfNeeded = async (user: FirebaseUser) => {
    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      console.log('User document already exists, skipping setup.');
      return;
    }

    // Use a batch write to create family and user docs atomically
    const batch = writeBatch(firestore);

    // 1. Define the family document reference and data
    const familyRef = doc(collection(firestore, 'families'));
    const familyData = {
      adminId: user.uid,
      familyName: `${user.displayName || 'My'}'s Family`,
      memberIds: [user.uid],
      subscriptionTier: 'free',
      createdAt: serverTimestamp(),
    };
    batch.set(familyRef, familyData);

    // 2. Define the user document data, now with the familyId
    const userData = {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName,
        familyId: familyRef.id,
        avatarId: `user-${Math.floor(Math.random() * 4) + 1}`,
    };
    batch.set(userRef, userData);
    
    // 3. Commit the batch
    // This is an await because it's part of the critical signup flow.
    // Errors here should be caught by the calling function.
    await batch.commit();
  };


  const handleSignup = async () => {
    if (!displayName || !email || !password) {
        toast({
            variant: "destructive",
            title: "Missing fields",
            description: "Please fill out all fields.",
        });
        return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, { displayName });

      await setupUserAndFamilyIfNeeded(userCredential.user);

      toast({
        title: "Account Created",
        description: "Welcome to Memora! Redirecting you to the dashboard...",
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Signup Error:", error);
      toast({
          variant: 'destructive',
          title: 'Signup Failed',
          description: error.message,
      });
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setupUserAndFamilyIfNeeded(user);
      
      toast({
        title: "Signed In",
        description: "Welcome to Memora!",
      });
      router.push('/dashboard');
    } catch (error: any) {
       console.error("Google Signup Error:", error);
       toast({
         variant: 'destructive',
         title: 'Google Sign-In Failed',
         description: error.message,
       });
    }
  };

  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Sign Up for Memora</CardTitle>
        <CardDescription>
          Enter your information to create an account and start preserving your family's history.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input 
              id="display-name" 
              placeholder="John Doe" 
              required 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleSignup} type="submit" className="w-full">
              Create an account
          </Button>
          <Button onClick={handleGoogleSignup} variant="outline" className="w-full">
            Sign up with Google
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
