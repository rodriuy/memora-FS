'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Upload, Mic, FileAudio, BrainCircuit, AlertCircle } from 'lucide-react'; // Importar AlertCircle
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// Asegúrate de importar deleteDoc
import { collection, doc, serverTimestamp, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { transcribeAudioStory } from '@/ai/flows/transcribe-audio-story';
import { firebaseConfig } from '@/firebase/config';
import { FamilyDataGuard } from '@/firebase/firestore/family-data-guard';

type Status = 'idle' | 'uploading' | 'transcribing' | 'complete' | 'error'; // Añadir estado 'error'

export default function NewStoryPage() {
  const { userData } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Estado para mensaje de error
  const [isPending, startTransition] = useTransition();

  const familyId = userData?.familyId;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !familyId) {
        toast({ variant: "destructive", title: "Error", description: "No se seleccionó archivo o no se cargaron los datos del usuario."})
        return;
    }
    if (!firestore) {
         toast({ variant: "destructive", title: "Error", description: "Servicio de base de datos no disponible."})
        return;
    }


    setFileName(file.name);
    setStatus('uploading');
    setErrorMessage(''); // Limpiar errores previos
    setProgress(0); // Reset progress

    let storyId: string | null = null; // Inicializar como null

    try {
        // 1. Create Firestore doc
        const storiesRef = collection(firestore, 'families', familyId, 'stories');
        const newStoryDocRefPromise = addDocumentNonBlocking(storiesRef, {
            title: 'Nueva Historia', // Placeholder title
            narrator: 'Desconocido',
            transcription: '',
            status: 'uploading',
            isDonated: false,
            audioUrl: '',
            imageId: `story-${Math.floor(Math.random() * 4) + 1}`,
            createdAt: serverTimestamp()
        });

        // Esperar a que el documento se cree para obtener el ID
        const newStoryDocRef = await newStoryDocRefPromise;
        if (!newStoryDocRef?.id) { // Verificar si newStoryDocRef o su id existen
          throw new Error("No se pudo crear el documento de la historia.");
        }
        storyId = newStoryDocRef.id;
        const storyDocRef = doc(firestore, 'families', familyId, 'stories', storyId); // Referencia con ID obtenido

        // 2. Upload to Storage
        const storage = getStorage();
        const bucket = firebaseConfig.projectId + '.appspot.com';
        const storagePath = `audio/${familyId}/${storyId}/${file.name}`;
        const gsUri = `gs://${bucket}/${storagePath}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // 3. Listen to progress
        uploadTask.on('state_changed',
          (snapshot) => {
            const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(currentProgress);
          },
          async (uploadError) => { // Error en la subida
            console.error("Upload failed:", uploadError);
            setErrorMessage("Error al subir el archivo. Inténtalo de nuevo.");
            setStatus('error'); // Cambiar estado a error
            toast({
                variant: "destructive",
                title: "Fallo en la Subida",
                description: "No se pudo subir el archivo de audio.",
            });
            // INTENTAR LIMPIAR: Eliminar el documento de Firestore si se creó
            if (storyId) {
                try {
                    await deleteDoc(storyDocRef);
                    console.log("Firestore document cleaned up after upload error.");
                } catch (deleteError) {
                    console.error("Failed to clean up Firestore doc after upload error:", deleteError);
                }
            }
          },
          async () => { // Subida completada
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              // 4. Update status to transcribing
              updateDocumentNonBlocking(storyDocRef, { audioUrl: downloadURL, status: 'transcribing' });
              setStatus('transcribing');
              setProgress(100); // Asegurar que la barra está llena
              toast({
                title: "¡Subida Completa!",
                description: "Tu historia está siendo transcrita por nuestra IA.",
              });

              // 5. Call Genkit flow for transcription
              const { transcription } = await transcribeAudioStory({ audioUrl: gsUri });

              // 6. Update document with transcription and final status
              updateDocumentNonBlocking(storyDocRef, {
                  transcription: transcription,
                  status: 'completed',
              });

              setStatus('complete');
              toast({
                  title: "¡Transcripción Completa!",
                  description: "Tu historia está lista para ser editada.",
              });
              router.push(`/stories/${storyId}/edit`);

            } catch (transcriptionError: any) { // Error en transcripción o pasos posteriores
               console.error("Transcription or final update failed:", transcriptionError);
               setErrorMessage(`Fallo en la transcripción: ${transcriptionError.message || 'Error desconocido de IA'}.`);
               setStatus('error');
               // Marcar el estado en Firestore como fallido
               updateDocumentNonBlocking(storyDocRef, { status: 'failed' });
               toast({
                  variant: "destructive",
                  title: "Fallo en la Transcripción",
                  description: "No se pudo transcribir el audio.",
              });
            }
          }
        );

    } catch (error: any) { // Error inicial (creación de doc, etc.)
        console.error("Story creation process failed:", error);
        setErrorMessage(`Error al iniciar el proceso: ${error.message || 'Error desconocido'}`);
        setStatus('error');
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo iniciar la creación de la historia.",
        });
        // No hay necesidad de limpiar Firestore aquí si storyId aún es null
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'idle':
        return (
          <div className="text-center">
            <label htmlFor="audio-upload" className="cursor-pointer">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50">
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="font-semibold">Haz clic para subir un archivo</p>
                <p className="text-sm text-gray-500">o arrastra y suelta un archivo de audio</p>
                <Input id="audio-upload" type="file" className="hidden" onChange={handleFileChange} accept="audio/*" />
              </div>
            </label>
            <p className="text-xs text-gray-500 mt-4">Formatos soportados: MP3, WAV, M4A, etc.</p>
          </div>
        );
      case 'uploading':
      case 'transcribing':
        return (
          <div className="w-full max-w-md text-center">
            <div className="flex items-center justify-center mb-4">
              {status === 'uploading' ? <FileAudio className="h-10 w-10 mr-3 text-primary" /> : <BrainCircuit className="h-10 w-10 mr-3 text-primary" />}
              <div>
                <p className="font-semibold">{status === 'uploading' ? 'Subiendo...' : 'Transcribiendo...'}</p>
                <p className="text-sm text-gray-500 truncate">{fileName}</p>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-500 mt-2">
              {status === 'uploading' ? 'Tu archivo se está subiendo. Por favor, espera.' : 'La IA está procesando tu historia. Esto puede tardar unos momentos.'}
            </p>
          </div>
        );
      case 'error': // Nuevo caso para estado de error
        return (
          <div className="flex flex-col items-center justify-center text-center p-8 text-destructive">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="font-semibold mb-2">Ocurrió un Error</p>
            <p className="text-sm mb-4">{errorMessage}</p>
            <Button variant="outline" onClick={() => { setStatus('idle'); setFileName(''); setProgress(0); }}>
              Intentar de nuevo
            </Button>
          </div>
        );
      case 'complete': // Navega, así que no se renderiza
            return null;
    }
  };

  return (
    <div className="p-4 md:p-8">
        <FamilyDataGuard>
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Añadir Nueva Historia</CardTitle>
                    <CardDescription>
                    Preserva una nueva memoria subiendo o grabando una historia de audio.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 min-h-[200px] flex items-center justify-center">
                    {renderContent()}
                </CardContent>
            </Card>
        </FamilyDataGuard>
    </div>
  );
}