
'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import Image from 'next/image';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { generateProfilePhoto } from '@/ai/flows/generate-profile-photo';
import { Upload, Wand2, Bot } from 'lucide-react';

// Helper to convert file to data URI
function toDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


function AvatarSelectionModal({ currentAvatarId, onSelectAvatar, onGenerate, isGenerating }: { currentAvatarId?: string, onSelectAvatar: (avatarId: string) => void, onGenerate: () => void, isGenerating: boolean }) {
    const userAvatars = PlaceHolderImages.filter(p => p.id.startsWith('user-'));

    return (
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Selecciona tu avatar</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 py-4">
                {userAvatars.map(avatar => (
                    <div key={avatar.id} className="cursor-pointer" onClick={() => onSelectAvatar(avatar.id)}>
                        <Avatar className={`w-20 h-20 border-4 ${currentAvatarId === avatar.id ? 'border-primary' : 'border-transparent'}`}>
                            <AvatarImage src={avatar.imageUrl} alt={avatar.description} />
                            <AvatarFallback>{avatar.id}</AvatarFallback>
                        </Avatar>
                    </div>
                ))}
            </div>
             <DialogFooter className="sm:justify-start border-t pt-4">
                <Button onClick={onGenerate} disabled={isGenerating}>
                    {isGenerating ? <Bot className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                    {isGenerating ? 'Generando Retrato...' : 'Generar Retrato con IA'}
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

export default function ProfilePage() {
    const { user, userData, isUserLoading, auth } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarId, setAvatarId] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (userData) {
            setDisplayName(userData.displayName || '');
            setBio(userData.bio || '');
            setAvatarId(userData.avatarId || '');
            setAvatarUrl(userData.avatarUrl || '');
        }
    }, [userData]);

    const handleSave = async () => {
        if (!user || !firestore) return;
        setIsSaving(true);

        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            
            updateDocumentNonBlocking(userDocRef, {
                displayName,
                bio,
                avatarId,
                avatarUrl,
            });

            if (auth?.currentUser && (displayName !== auth.currentUser.displayName || avatarUrl !== auth.currentUser.photoURL)) {
                await updateProfile(auth.currentUser, { displayName, photoURL: avatarUrl });
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
    
    const handleAvatarSelect = (selectedAvatarId: string) => {
        setAvatarId(selectedAvatarId);
        setAvatarUrl(''); // Clear custom URL when selecting a default avatar
        toast({ title: 'Avatar seleccionado', description: 'Haz clic en "Guardar Cambios" para aplicar.' });
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        try {
            const storage = getStorage();
            const storagePath = `avatars/${user.uid}/${file.name}`;
            const storageRef = ref(storage, storagePath);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', 
                (snapshot) => { /* Progress handling can be added here */ },
                (error) => {
                    throw error;
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setAvatarUrl(downloadURL);
                    setAvatarId(''); // Clear default avatar
                    toast({ title: 'Imagen subida', description: 'La nueva imagen está lista. Guarda los cambios para aplicarla.' });
                    setIsUploading(false);
                }
            );
        } catch (error) {
            console.error("Upload failed:", error);
            toast({ variant: 'destructive', title: 'Error de Subida', description: 'No se pudo subir la imagen.' });
            setIsUploading(false);
        }
    };

    const handleGenerateAiPortrait = async () => {
         if (!user) return;
        setIsGenerating(true);
        try {
            const currentAvatar = avatarUrl || PlaceHolderImages.find(p => p.id === (avatarId || 'user-1'))?.imageUrl;
            if (!currentAvatar) {
                throw new Error("No hay una foto de perfil base para generar el retrato.");
            }

            // We need to fetch the image and convert it to data URI for the AI
            const response = await fetch(currentAvatar);
            const blob = await response.blob();
            const photoDataUri = await new Promise<string>(resolve => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });

            const result = await generateProfilePhoto({ photoDataUri, userId: user.uid });
            setAvatarUrl(result.generatedPhotoUrl);
            setAvatarId('');
            toast({ title: '¡Retrato Generado!', description: 'Tu nuevo retrato de IA está listo. Guarda los cambios para aplicarlo.' });

        } catch (error) {
            console.error("AI Portrait generation failed:", error);
            toast({ variant: 'destructive', title: 'Error de IA', description: 'No se pudo generar el retrato.' });
        } finally {
            setIsGenerating(false);
        }
    }


    if (isUserLoading || !userData) {
        // Skeleton loader
        return (
            <div className="p-4 md:p-8">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader className="text-center items-center">
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
    
    const displayAvatar = avatarUrl || PlaceHolderImages.find(p => p.id === avatarId)?.imageUrl || `https://i.pravatar.cc/150?u=${user?.uid}`;

    return (
        <div className="p-4 md:p-8">
             <Dialog>
                <Card className="max-w-2xl mx-auto">
                    <CardHeader className="items-center text-center">
                         <div className="relative group w-28 h-28">
                            <Avatar className="w-28 h-28 mb-4 border-4 border-primary">
                                <AvatarImage src={displayAvatar} alt={userData.displayName} />
                                <AvatarFallback>{userData.displayName?.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                             <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">Elegir</Button>
                                </DialogTrigger>
                                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                    <Upload className="mr-2 h-4 w-4"/>
                                    {isUploading ? 'Subiendo...' : 'Subir'}
                                </Button>
                             </div>
                             <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>

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
                        <Button onClick={handleSave} disabled={isSaving || isUploading || isGenerating}>
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </CardFooter>
                </Card>
                <AvatarSelectionModal currentAvatarId={avatarId} onSelectAvatar={handleAvatarSelect} onGenerate={handleGenerateAiPortrait} isGenerating={isGenerating} />
            </Dialog>
        </div>
    );
}
