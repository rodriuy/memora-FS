
'use client';

import { notFound, useRouter } from 'next/navigation';
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
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { anonymizeStory } from '@/ai/flows/anonymize-story-for-donation';
import { generateAnimatedPhoto } from '@/ai/flows/generate-animated-photo';
import React, { useEffect, useState, useTransition } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, serverTimestamp, addDoc, updateDoc } from 'firebase/firestore';
import type { Story, User as MemoraUser } from '@/lib/types';
import Link from 'next/link';

// Helper function to convert image URL to data URI
async function toDataUri(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}


export default function StoryDetailPage({ id }: { id: string }) {
  const { user, userData } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isPending, startTransition] = useTransition();

  const familyId = userData?.familyId;

  const storyDocRef = useMemoFirebase(() => familyId ? doc(firestore, 'families', familyId, 'stories', id) : null, [firestore, familyId, id]);
  const { data: story, isLoading: storyLoading } = useDoc<Story>(storyDocRef);

  const familyDocRef = useMemoFirebase(() => familyId ? doc(firestore, 'families', familyId) : null, [firestore, familyId]);
  const { data: familyData } = useDoc(familyDocRef);
  const isPremium = familyData?.subscriptionTier === 'premium';

  const [isDonated, setIsDonated] = React.useState(story?.isDonated || false);
  const [isDonating, setIsDonating] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [animatedVideo, setAnimatedVideo] = useState<string | null>(null);

  useEffect(() => {
    if (story) {
        setIsDonated(story.isDonated);
    }
  }, [story]);

  if (storyLoading) {
    return <div>Loading story...</div>
  }

  if (!story && !storyLoading) {
    notFound();
  }

  const storyImage = PlaceHolderImages.find((p) => p.id === story.imageId)?.imageUrl || 'https://picsum.photos/seed/placeholder/400/300';
  const narratorAvatar = PlaceHolderImages.find((p) => p.id === 'user-1')?.imageUrl || '';

  const handleDonationToggle = async (checked: boolean) => {
    if (checked) {
        setIsDonating(true);
        try {
            if (!storyDocRef) throw new Error("Story reference not found");

            const { anonymizedText } = await anonymizeStory({ storyText: story.transcription });

            const donatedStoriesRef = collection(firestore, 'donatedStories');
            await addDoc(donatedStoriesRef, {
                storyId: story.id,
                anonTranscription: anonymizedText,
                originalFamilyId: familyId,
                donatedAt: serverTimestamp(),
            });

            await updateDoc(storyDocRef, { isDonated: true });
            
            startTransition(() => {
                setIsDonated(true);
            })

            toast({
                title: 'Story Donated',
                description: 'Thank you for contributing to Estudia Memora.',
            });
        } catch (error) {
            console.error("Donation failed:", error);
            toast({
                variant: 'destructive',
                title: 'Donation Failed',
                description: 'Could not anonymize and donate the story.',
            });
        } finally {
            setIsDonating(false);
        }
    }
  };

  const handleAnimatePhoto = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isPremium) {
        toast({ variant: 'destructive', title: 'Premium Feature', description: 'Please upgrade to animate photos.'});
        return;
    }
    const formData = new FormData(event.currentTarget);
    const prompt = formData.get('prompt') as string;
    
    setIsAnimating(true);
    setAnimatedVideo(null);

    try {
        const photoDataUri = await toDataUri(storyImage);

        const result = await generateAnimatedPhoto({ photoDataUri, animationPrompt: prompt });
        
        setAnimatedVideo(result.animatedPhotoDataUri);
        
        toast({
            title: 'Photo Animated!',
            description: 'Your animated video has been generated below.',
        });
    } catch (error: any) {
        console.error("Animation failed:", error);
        toast({
            variant: 'destructive',
            title: 'Animation Failed',
            description: error.message || 'Could not generate animated photo.',
        });
    } finally {
        setIsAnimating(false);
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
                <Link href={`/stories/${id}/edit`}>
                    <Button variant="outline" size="icon"><Edit className="h-4 w-4"/></Button>
                </Link>
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
                    {animatedVideo ? (
                        <div className='py-4'>
                            <video src={animatedVideo} controls autoPlay loop className="w-full rounded-md" />
                             <Button onClick={() => setAnimatedVideo(null)} className="w-full mt-4">Create another</Button>
                        </div>
                    ) : (
                        <form onSubmit={handleAnimatePhoto}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="prompt" className="text-right">Prompt</Label>
                                    <Input id="prompt" name="prompt" placeholder="e.g., a gentle smile and a nod" className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                <Button type="submit" disabled={isAnimating || !isPremium}>{isAnimating ? "Animating..." : "Generate Animation"}</Button>
                            </DialogFooter>
                        </form>
                    )}
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
                    <Switch id="donation-switch" onCheckedChange={handleDonationToggle} disabled={isDonating || isPending}/>
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
