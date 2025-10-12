
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
        throw new Error('Expected the model to return an operation');
    }

    // Wait until the operation completes.
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        operation = await ai.checkOperation(operation);
    }

    if (operation.error) {
        console.error("Video generation error:", operation.error);
        throw new Error('Failed to generate video: ' + operation.error.message);
    }

    const video = operation.output?.message?.content.find(p => !!p.media);
    if (!video || !video.media?.url) {
        throw new Error('Failed to find the generated video in the operation output');
    }

    // The URL from VEO is a temporary download link. We need to fetch it and convert to a data URI.
    const fetch = (await import('node-fetch')).default;
    const videoDownloadResponse = await fetch(
        `${video.media.url}&key=${process.env.GEMINI_API_KEY}`
    );

    if (!videoDownloadResponse.ok || !videoDownloadResponse.body) {
        throw new Error(`Failed to download generated video: ${videoDownloadResponse.statusText}`);
    }

    const videoBuffer = await videoDownloadResponse.arrayBuffer();
    const base64Video = Buffer.from(videoBuffer).toString('base64');
    const videoDataUri = `data:video/mp4;base64,${base64Video}`;

    return { animatedPhotoDataUri: videoDataUri };
  }
);
