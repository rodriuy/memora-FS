
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Progress } from '@/components/ui/progress';
import { Upload, Mic, FileAudio, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, doc, serverTimestamp } from 'firebase/firestore';

type Status = 'idle' | 'uploading' | 'transcribing' | 'complete';

export default function NewStoryPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [familyId, setFamilyId] = useState<string | null>(null);

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userData } = useDoc(userDocRef);

  useEffect(() => {
    if (userData) {
      setFamilyId(userData.familyId);
    }
  }, [userData]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !familyId) {
        toast({ variant: "destructive", title: "Error", description: "No file selected or user data not loaded."})
        return;
    }

    setFileName(file.name);
    setStatus('uploading');

    // 1. Create a new story document in Firestore to get an ID
    const storiesRef = collection(firestore, 'families', familyId, 'stories');
    const newStoryDoc = await addDocumentNonBlocking(storiesRef, {
        title: 'New Story', // Placeholder title
        narrator: 'Unknown',
        transcription: '',
        status: 'uploading',
        isDonated: false,
        audioUrl: '',
        createdAt: serverTimestamp()
    });
    const storyId = newStoryDoc.id;

    // 2. Upload the file to Firebase Storage
    const storage = getStorage();
    const storagePath = `audio/${familyId}/${storyId}/${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // 3. Listen to upload progress
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "Could not upload the audio file. Please try again.",
        });
        setStatus('idle');
        // Maybe delete the Firestore doc here if upload fails
      },
      () => {
        // 4. On successful upload
        setStatus('transcribing');
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // The Cloud Function will be triggered by the file upload.
          // It will update the Firestore document with the audioUrl, transcription, and status.
          // For now, we'll just navigate to the story page where the user can see the progress.
          toast({
            title: "Upload Complete!",
            description: "Your story is now being transcribed by our AI.",
          });
          router.push(`/stories/${storyId}/edit`);
        });
      }
    );
  };

  const renderContent = () => {
    switch (status) {
      case 'idle':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label htmlFor="file-upload" className="cursor-pointer">
              <Card className="hover:border-primary transition-colors h-full flex flex-col items-center justify-center text-center p-8">
                <Upload className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="font-headline">Upload Audio File</CardTitle>
                <CardDescription>
                  Supports .mp3, .wav, .m4a
                </CardDescription>
                <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="audio/*" disabled={!familyId}/>
              </Card>
            </label>
            <Card className="h-full flex flex-col items-center justify-center text-center p-8 bg-muted/50 cursor-not-allowed">
              <Mic className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="font-headline text-muted-foreground">Record in Browser</CardTitle>
              <CardDescription>
                Feature coming soon
              </CardDescription>
            </Card>
          </div>
        );
      case 'uploading':
      case 'transcribing':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="flex items-center text-lg font-semibold mb-4">
                {status === 'uploading' ? <FileAudio className="h-6 w-6 mr-2" /> : <BrainCircuit className="h-6 w-6 mr-2 text-primary" />}
                {status === 'uploading' ? 'Uploading' : 'Sent for Transcription'}...
            </div>
            <p className="text-muted-foreground mb-4">{fileName}</p>
            <Progress value={progress} className="w-full max-w-md" />
            <p className="text-sm text-primary mt-2">
                {status === 'uploading' ? 'Uploading your memory...' : 'AI is listening...'}
            </p>
          </div>
        );
        case 'complete': // This state is handled by navigating away, but kept for clarity
            return null;
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle className="font-headline text-2xl">Add a New Story</CardTitle>
            <CardDescription>
            Preserve a new memory by uploading or recording an audio story.
            </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
            {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
