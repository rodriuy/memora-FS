
'use server';

/**
 * @fileOverview A flow to generate an animated photo from a static image.
 *
 * - generateAnimatedPhoto - A function that handles the photo animation process.
 * - GenerateAnimatedPhotoInput - The input type for the generateAnimatedPhoto function.
 * - GenerateAnimatedPhotoOutput - The return type for the generateAnimatedPhoto function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import {Readable} from 'stream';
import * as fs from 'fs';

const GenerateAnimatedPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to animate, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  animationPrompt: z
    .string()
    .describe('A description of the desired animation for the photo.'),
});
export type GenerateAnimatedPhotoInput = z.infer<typeof GenerateAnimatedPhotoInputSchema>;

const GenerateAnimatedPhotoOutputSchema = z.object({
  animatedPhotoDataUri: z
    .string()
    .describe('The animated photo, as a data URI in video/mp4 base64 format.'),
});
export type GenerateAnimatedPhotoOutput = z.infer<typeof GenerateAnimatedPhotoOutputSchema>;

export async function generateAnimatedPhoto(
  input: GenerateAnimatedPhotoInput
): Promise<GenerateAnimatedPhotoOutput> {
  return generateAnimatedPhotoFlow(input);
}

const generateAnimatedPhotoFlow = ai.defineFlow(
  {
    name: 'generateAnimatedPhotoFlow',
    inputSchema: GenerateAnimatedPhotoInputSchema,
    outputSchema: GenerateAnimatedPhotoOutputSchema,
  },
  async input => {
    try { // Envolver toda la lógica
      let { operation } = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt: [
            { text: input.animationPrompt },
            { media: { url: input.photoDataUri } }
        ],
        config: {
            durationSeconds: 5,
            aspectRatio: '16:9',
            personGeneration: 'allow_adult',
        },
    });

      if (!operation) {
          throw new Error('Modelo no devolvió una operación para la generación de video.');
      }

      // Esperar a que la operación termine
      let attempts = 0;
      const maxAttempts = 12; // Esperar máx 1 minuto (12 * 5 segundos)
      while (!operation.done && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
          operation = await ai.checkOperation(operation);
          attempts++;
      }

       if (!operation.done) {
          throw new Error('La operación de generación de video excedió el tiempo límite.');
       }

      if (operation.error) {
          console.error("Error en la generación de video:", operation.error);
          throw new Error('Fallo al generar video: ' + (operation.error.message || 'Error desconocido de IA'));
      }

      const video = operation.output?.message?.content.find(p => !!p.media);
      if (!video || !video.media?.url) {
          throw new Error('No se encontró el video generado en la salida de la operación.');
      }

      // Descargar el video y convertir a data URI
      const fetch = (await import('node-fetch')).default;
      const videoDownloadUrl = `${video.media.url}&key=${process.env.GEMINI_API_KEY}`; // Asegúrate que GEMINI_API_KEY está configurado

      const videoDownloadResponse = await fetch(videoDownloadUrl);

      if (!videoDownloadResponse.ok || !videoDownloadResponse.body) {
          throw new Error(`Fallo al descargar el video generado: ${videoDownloadResponse.statusText} (URL: ${video.media.url})`); // Incluir URL base en error
      }

      const videoBuffer = await videoDownloadResponse.arrayBuffer();
      const base64Video = Buffer.from(videoBuffer).toString('base64');
      const videoDataUri = `data:video/mp4;base64,${base64Video}`;

      return { animatedPhotoDataUri: videoDataUri };

    } catch (error: any) { // Catch general
        console.error("generateAnimatedPhotoFlow Error:", error);
        // Lanzar un error más descriptivo que pueda ser capturado por el frontend
        throw new Error(`Fallo en la animación de la foto: ${error.message || 'Error desconocido'}`);
    }
  }
);
