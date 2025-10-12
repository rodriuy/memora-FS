
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { updateProfile } from 'firebase/auth';

export default function ProfilePage() {
    const { user, userData, isUserLoading, auth } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (userData) {
            setDisplayName(userData.displayName || '');
            setBio(userData.bio || '');
        }
    }, [userData]);

    const handleSave = async () => {
        if (!user || !firestore) return;
        setIsSaving(true);

        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            
            // Update Firestore document
            updateDocumentNonBlocking(userDocRef, {
                displayName,
                bio,
            });

            // Also update Firebase Auth profile
            if (auth?.currentUser && displayName !== auth.currentUser.displayName) {
                await updateProfile(auth.currentUser, { displayName });
            }
            
            toast({
                title: 'Perfil Actualizado',
                description: 'Tus cambios han sido guardados.',
            });

        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo guardar tu perfil.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isUserLoading || !userData) {
        return (
            <div className="p-4 md:p-8">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader className="text-center">
                        <Skeleton className="w-28 h-28 rounded-full mx-auto mb-4" />
                        <Skeleton className="h-8 w-48 mx-auto" />
                        <Skeleton className="h-5 w-64 mx-auto mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-24" />
                           <Skeleton className="h-24 w-full" />
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Skeleton className="h-10 w-32" />
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const avatarImage = PlaceHolderImages.find(p => p.id === userData.avatarId)?.imageUrl || `https://i.pravatar.cc/150?u=${user?.uid}`;

    return (
        <div className="p-4 md:p-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center items-center">
                     <Avatar className="w-28 h-28 mb-4 border-4 border-primary">
                        <AvatarImage src={avatarImage} alt={userData.displayName} />
                        <AvatarFallback>{userData.displayName?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="font-headline text-2xl">Mi Perfil</CardTitle>
                    <CardDescription>Personaliza la información de tu perfil público.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Nombre</Label>
                        <Input 
                            id="displayName" 
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            value={userData.email}
                            disabled
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Biografía</Label>
                        <Textarea 
                            id="bio"
                            placeholder="Cuéntanos un poco sobre ti..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
