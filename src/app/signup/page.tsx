
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
import { useAuth } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';


export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // This function is now responsible for creating docs if they don't exist
  // It's designed to be called safely on login or after signup.
  const setupUserAndFamilyIfNeeded = async (user: FirebaseUser) => {
    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    // If user document already exists, do nothing.
    if (userSnap.exists()) {
      return;
    }

    try {
      // Create family document first
      const familyDocRef = doc(collection(firestore, 'families'));
      await setDoc(familyDocRef, {
        adminId: user.uid,
        familyName: `${user.displayName || 'My'}'s Family`,
        memberIds: [user.uid],
        subscriptionTier: 'free',
        createdAt: serverTimestamp(),
      });

      // Then create the user document with the new familyId
      await setDoc(userRef, {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName,
        familyId: familyDocRef.id,
      });

    } catch (error) {
       console.error("Error creating family/user docs:", error);
       toast({
         variant: "destructive",
         title: "Setup Failed",
         description: "Could not create initial user data.",
       });
       // Optional: delete user if setup fails, to allow retry
       await user.delete();
       throw error; // Re-throw to be caught by the caller
    }
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
      // Set the display name right after creation
      await updateProfile(userCredential.user, { displayName });

      // After setting displayName, call the setup function
      // It's important to use the user object from the credential
      await setupUserAndFamilyIfNeeded(userCredential.user);

      toast({
        title: "Account Created",
        description: "Welcome to Memora! Redirecting you to the dashboard...",
      });
      // Redirect to dashboard where useUser hook will have the fresh user
      router.push('/dashboard');
    } catch (error: any) {
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

      // The setup function will check if the user is new and create docs if needed.
      // This makes it safe for both new signups and returning users.
      await setupUserAndFamilyIfNeeded(user);
      
      toast({
        title: "Signed In",
        description: "Welcome to Memora!",
      });
      router.push('/dashboard');
    } catch (error: any) {
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
