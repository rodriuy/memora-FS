'use server';

/**
 * @fileOverview A flow to generate an animated photo from a static image.
 *
 * - generateAnimatedPhoto - A function that handles the photo animation process.
 * - GenerateAnimatedPhotoInput - The input type for the generateAnimatedPhoto function.
 * - GenerateAnimatedPhotoOutput - The return type for the generateAnimatedPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAnimatedPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to animate, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  animationPrompt: z
    .string()
    .describe('A description of the desired animation for the photo.'),
});
export type GenerateAnimatedPhotoInput = z.infer<typeof GenerateAnimatedPhotoInputSchema>;

const GenerateAnimatedPhotoOutputSchema = z.object({
  animatedPhotoDataUri: z
    .string()
    .describe('The animated photo, as a data URI in base64 format.'),
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
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: input.animationPrompt},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate animated photo.');
    }

    return {animatedPhotoDataUri: media.url};
  }
);
