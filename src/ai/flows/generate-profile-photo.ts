
'use server';

/**
 * @fileOverview A flow to generate a passport-style profile photo from an existing image.
 *
 * - generateProfilePhoto - A function that handles the photo generation process.
 * - GenerateProfilePhotoInput - The input type for the generateProfilePhoto function.
 * - GenerateProfilePhotoOutput - The return type for the generateProfilePhoto function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { firebaseConfig } from '@/firebase/config';

const GenerateProfilePhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A user's photo to be converted, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userId: z.string().describe("The ID of the user for whom the photo is being generated."),
});
export type GenerateProfilePhotoInput = z.infer<typeof GenerateProfilePhotoInputSchema>;

const GenerateProfilePhotoOutputSchema = z.object({
  generatedPhotoUrl: z
    .string()
    .describe('The public URL of the generated passport-style photo in Firebase Storage.'),
});
export type GenerateProfilePhotoOutput = z.infer<typeof GenerateProfilePhotoOutputSchema>;

export async function generateProfilePhoto(
  input: GenerateProfilePhotoInput
): Promise<GenerateProfilePhotoOutput> {
  return generateProfilePhotoFlow(input);
}

const generateProfilePhotoFlow = ai.defineFlow(
  {
    name: 'generateProfilePhotoFlow',
    inputSchema: GenerateProfilePhotoInputSchema,
    outputSchema: GenerateProfilePhotoOutputSchema,
  },
  async ({ photoDataUri, userId }) => {
    try {
      // Generate the image using an image-to-image model
      const { media: generatedMedia } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-image-preview'),
        prompt: [
          { media: { url: photoDataUri } },
          { text: 'Generate a professional, front-facing passport-style portrait from the provided image. The background should be neutral and solid light gray. The subject should be looking directly at the camera with a neutral expression.' },
        ],
        config: {
          responseModalities: ['IMAGE'],
        },
      });

      if (!generatedMedia?.url) {
        throw new Error('Image generation failed to return media.');
      }

      // Upload the generated image to Firebase Storage
      const storage = getStorage();
      const storagePath = `avatars/${userId}/generated-portrait-${Date.now()}.png`;
      const storageRef = ref(storage, storagePath);

      // The generated media url is a data URI, we need to upload it as such
      const uploadResult = await uploadString(storageRef, generatedMedia.url, 'data_url');
      const downloadURL = await getDownloadURL(uploadResult.ref);

      return { generatedPhotoUrl: downloadURL };
    } catch (error: any) {
      console.error("Error in generateProfilePhotoFlow:", error);
      throw new Error(`Fallo en la generación de foto de perfil: ${error.message || 'Error desconocido'}`);
    }
  }
);
