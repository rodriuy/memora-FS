
'use client';

import { notFound } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Film, Gift, VenetianMask, Edit, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { anonymizeStory } from '@/ai/flows/anonymize-story-for-donation';
import { generateAnimatedPhoto } from '@/ai/flows/generate-animated-photo';
import React, { useEffect, useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Story } from '@/lib/types';


export default function StoryDetailPage({ params }: { params: { id: string } }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [familyId, setFamilyId] = useState<string | null>(null);

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userData } = useDoc(userDocRef);

  useEffect(() => {
    if (userData) {
      setFamilyId(userData.familyId);
    }
  }, [userData]);

  const storyDocRef = useMemoFirebase(() => familyId ? doc(firestore, 'families', familyId, 'stories', params.id) : null, [firestore, familyId, params.id]);
  const { data: story, isLoading: storyLoading } = useDoc<Story>(storyDocRef);

  const familyDocRef = useMemoFirebase(() => familyId ? doc(firestore, 'families', familyId) : null, [firestore, familyId]);
  const { data: familyData } = useDoc(familyDocRef);
  const isPremium = familyData?.subscriptionTier === 'premium';

  const [isDonated, setIsDonated] = React.useState(story?.isDonated || false);
  const [isDonating, setIsDonating] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  useEffect(() => {
    if (story) {
        setIsDonated(story.isDonated);
    }
  }, [story]);

  if (storyLoading) {
    return <div>Loading story...</div>
  }

  if (!story) {
    notFound();
  }

  const storyImage = PlaceHolderImages.find((p) => p.id === story.imageId)?.imageUrl || '';
  // This is a placeholder, in a real app you'd fetch narrator details
  const narratorAvatar = PlaceHolderImages.find((p) => p.id === 'user-1')?.imageUrl || '';

  const handleDonationToggle = async (checked: boolean) => {
    if (checked) {
        setIsDonating(true);
        try {
            // The logic for calling the cloud function will be added later
            // For now, we just update the document
            updateDocumentNonBlocking(storyDocRef!, { isDonated: true });

            setIsDonated(true);
            toast({
                title: 'Story Donated',
                description: 'Thank you for contributing to Estudia Memora.',
            });
        } catch (error) {
            console.error("Donation failed:", error);
            toast({
                variant: 'destructive',
                title: 'Donation Failed',
                description: 'Could not update the story for donation.',
            });
        } finally {
            setIsDonating(false);
        }
    }
  };

  const handleAnimatePhoto = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const prompt = formData.get('prompt') as string;
    
    if (!isPremium) {
        toast({ variant: 'destructive', title: 'Premium Feature', description: 'Please upgrade to animate photos.'});
        return;
    }

    setIsAnimating(true);
    try {
        // The logic for calling the HTTP function will be added later
        // In a real app, you'd convert the image URL to a data URI
        const mockPhotoDataUri = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAAFAAUDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAZEAADAQEBAAAAAAAAAAAAAAAAAQIDBQT/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AIbFslqbvYVDK4M2kXJ3p6gCUf//Z';
        const result = await generateAnimatedPhoto({ photoDataUri: mockPhotoDataUri, animationPrompt: prompt });
        console.log("Animated photo URI:", result.animatedPhotoDataUri);
        toast({
            title: 'Photo Animated!',
            description: 'Your animated photo is ready to view.',
        });
    } catch (error) {
        console.error("Animation failed:", error);
        toast({
            variant: 'destructive',
            title: 'Animation Failed',
            description: 'Could not generate animated photo.',
        });
    } finally {
        setIsAnimating(false);
        // Here you would typically close the dialog
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl font-headline">{story.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={narratorAvatar} />
                      <AvatarFallback>{story.narrator.charAt(0)}</AvatarFallback>
                    </Avatar>
                    Narrated by {story.narrator}
                  </CardDescription>
                </div>
                <Button variant="outline" size="icon"><Edit className="h-4 w-4"/></Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{story.transcription}</p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="relative aspect-video">
              <Image src={storyImage} alt={story.title} fill className="object-cover" data-ai-hint="family photo"/>
            </div>
            <CardContent className="p-4">
              <Dialog>
                <DialogTrigger asChild>
                    <Button className="w-full" disabled={!isPremium}>
                        <Film className="mr-2 h-4 w-4" /> Animate Photo
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-headline">Animate Photo</DialogTitle>
                        <DialogDescription>
                            Describe the animation you want to see. This is a premium feature.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAnimatePhoto}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="prompt" className="text-right">Prompt</Label>
                                <Input id="prompt" name="prompt" placeholder="e.g., a gentle smile and a nod" className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isAnimating || !isPremium}>{isAnimating ? "Animating..." : "Generate Animation"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
              </Dialog>
              {!isPremium && <p className="text-xs text-center text-muted-foreground mt-2">Upgrade to Premium to use this feature.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Gift className="h-5 w-5"/> Donate Story</CardTitle>
              <CardDescription>Anonymously share this story with the 'Estudia Memora' community.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 p-4 rounded-lg bg-secondary/50">
                <VenetianMask className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="donation-switch" className="flex-1">Donate this story</Label>
                {isDonated ? (
                    <div className="flex items-center gap-2 text-sm text-green-400">
                        <Check className="h-4 w-4" />
                        <span>Donated</span>
                    </div>
                ) : (
                    <Switch id="donation-switch" onCheckedChange={handleDonationToggle} disabled={isDonating}/>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                By donating, the text will be anonymized by AI to remove personal information before being shared.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
