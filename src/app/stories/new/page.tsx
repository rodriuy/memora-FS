
'use client';

import { useState } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Upload, Mic, FileAudio, CheckCircle, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { transcribeAudioStory } from '@/ai/flows/transcribe-audio-story';

type Status = 'idle' | 'uploading' | 'transcribing' | 'editing' | 'saving';

export default function NewStoryPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [transcription, setTranscription] = useState('');
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setStatus('uploading');

      // Simulate upload and transcription process
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += 10;
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(progressInterval);
          setStatus('transcribing');
          
          // Mock AI call
          transcribeAudioStory({ audioUrl: 'mock-url' })
            .then(result => {
                const mockTranscription = "Recuerdo como si fuera ayer la primera vez que vi el mar. Tenía apenas seis años y mis padres me llevaron a un pequeño pueblo costero. La inmensidad azul me dejó sin palabras y el sabor salado del aire es algo que nunca olvidaré...";
                setTranscription(mockTranscription);
                setStatus('editing');
            })
            .catch(error => {
                console.error("Transcription failed:", error);
                toast({
                    variant: "destructive",
                    title: "Transcription Failed",
                    description: "Could not transcribe the audio file. Please try again.",
                });
                setStatus('idle');
            });
        }
      }, 200);
    }
  };

  const handleSave = () => {
    setStatus('saving');
    toast({
        title: "Story Saved",
        description: "Your new story has been added to your collection.",
    });
    // In a real app, you would redirect or clear the form
    setTimeout(() => {
        setStatus('idle');
        setFileName('');
        setTranscription('');
        setProgress(0);
    }, 1500);
  }

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
                <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="audio/*" />
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
                {status === 'uploading' ? 'Uploading' : 'Transcribing with AI'}...
            </div>
            <p className="text-muted-foreground mb-4">{fileName}</p>
            <Progress value={progress} className="w-full max-w-md" />
            <p className="text-sm text-primary mt-2">{status.charAt(0).toUpperCase() + status.slice(1)}</p>
          </div>
        );
      case 'editing':
      case 'saving':
        return (
            <>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <CardTitle className="font-headline">Transcription Complete</CardTitle>
                </div>
                <CardDescription>Review the text and add details to your story.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Story Title</Label>
                        <Input id="title" placeholder="e.g., El primer viaje a la playa" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="narrator">Narrator</Label>
                        <Input id="narrator" placeholder="e.g., Abuelo Juan" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="transcription">Transcription</Label>
                    <Textarea
                    id="transcription"
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={status === 'saving'}>
                    {status === 'saving' ? 'Saving...' : 'Save Story'}
                </Button>
            </CardFooter>
            </>
        );
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-4xl mx-auto">
        {status !== 'editing' && status !== 'saving' && (
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Add a New Story</CardTitle>
                <CardDescription>
                Preserve a new memory by uploading or recording an audio story.
                </CardDescription>
            </CardHeader>
        )}
        <CardContent className="p-6">
            {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
