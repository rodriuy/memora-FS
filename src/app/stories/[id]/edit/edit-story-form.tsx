
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { Story } from '@/lib/types';
import { BrainCircuit, CheckCircle, Hourglass, Save } from 'lucide-react';
import { useRouter, notFound } from 'next/navigation';

export default function EditStoryForm({ id }: { id: string }) {
  const { userData } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [narrator, setNarrator] = useState('');
  const [transcription, setTranscription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const familyId = userData?.familyId;

  const storyDocRef = useMemoFirebase(() => familyId ? doc(firestore, 'families', familyId, 'stories', id) : null, [firestore, familyId, id]);
  const { data: story, isLoading: storyLoading } = useDoc<Story>(storyDocRef);

  useEffect(() => {
    if (story) {
      setTitle(story.title === 'New Story' ? '' : story.title);
      setNarrator(story.narrator === 'Unknown' ? '' : story.narrator);
      setTranscription(story.transcription);
    }
  }, [story]);

  if (storyLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Hourglass className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading your story...</p>
      </div>
    );
  }

  if (!story && !storyLoading) {
    notFound();
  }

  const handleSave = async () => {
    if (!storyDocRef) return;
    setIsSaving(true);

    try {
      await updateDoc(storyDocRef, {
        title,
        narrator,
        transcription,
      });
      
      toast({
        title: "Story Saved",
        description: "Your story has been successfully updated.",
      });

      router.push(`/stories/${id}`);

    } catch (error) {
      console.error("Failed to save story:", error);
      toast({
        variant: 'destructive',
        title: "Save Failed",
        description: "There was an error saving your story. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isTranscriptionComplete = story?.status === 'completed';

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            {isTranscriptionComplete ? <CheckCircle className="h-6 w-6 text-green-500" /> : <BrainCircuit className="h-6 w-6 text-primary animate-pulse" />}
            <CardTitle className="font-headline">
              {isTranscriptionComplete ? 'Transcription Complete' : 'Transcription in Progress'}
            </CardTitle>
          </div>
          <CardDescription>
            {isTranscriptionComplete ? 'Review the AI-generated text and add the final details to your story.' : 'Our AI is currently transcribing your audio. The result will appear below automatically.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Story Title</Label>
              <Input id="title" placeholder="e.g., El primer viaje a la playa" value={title} onChange={(e) => setTitle(e.target.value)} disabled={!isTranscriptionComplete} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="narrator">Narrator</Label>
              <Input id="narrator" placeholder="e.g., Abuelo Juan" value={narrator} onChange={(e) => setNarrator(e.target.value)} disabled={!isTranscriptionComplete} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="transcription">Transcription</Label>
            <Textarea
              id="transcription"
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              rows={15}
              className="font-mono text-sm"
              placeholder={!isTranscriptionComplete ? "The transcription will appear here once ready..." : "Edit transcription here..."}
              disabled={!isTranscriptionComplete}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={!isTranscriptionComplete || isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Story'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
