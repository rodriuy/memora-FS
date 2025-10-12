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
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, doc, serverTimestamp } from 'firebase/firestore';

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const createFamilyAndUserDocs = async (user: any) => {
    const familyRef = collection(firestore, 'families');
    const userRef = doc(firestore, 'users', user.uid);

    try {
      const familyDoc = await addDocumentNonBlocking(familyRef, {
        adminId: user.uid,
        familyName: `${user.displayName}'s Family`,
        memberIds: [user.uid],
        subscriptionTier: 'free',
        createdAt: serverTimestamp(),
      });
      
      const familyId = familyDoc.id;

      await setDocumentNonBlocking(userRef, {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName,
        familyId: familyId,
      }, { merge: true });

      return familyId;
    } catch (error) {
      console.error("Error creating family/user docs:", error);
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: "Could not create initial user data.",
      });
      // Optionally delete the user account if setup fails
      await user.delete();
      throw error;
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
      await updateProfile(userCredential.user, { displayName });
      
      // We need to reload user to get the display name
      await userCredential.user.reload();
      const updatedUser = auth.currentUser;

      if(updatedUser) {
        await createFamilyAndUserDocs(updatedUser);
      }

      toast({
        title: "Account Created",
        description: "Welcome to Memora!",
      });
      router.push('/');
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

      // In a real app, you'd check if the user is new or existing.
      // For this implementation, we assume a new user is created.
      await createFamilyAndUserDocs(user);
      
      toast({
        title: "Account Created",
        description: "Welcome to Memora!",
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google Signup Failed',
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
