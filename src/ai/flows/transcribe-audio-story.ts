
'use server';

/**
 * @fileOverview A flow for transcribing audio stories into text.
 *
 * - transcribeAudioStory - A function that transcribes an audio story.
 * - TranscribeAudioStoryInput - The input type for the transcribeAudioStory function.
 * - TranscribeAudioStoryOutput - The return type for the transcribeAudioStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeAudioStoryInputSchema = z.object({
  audioUrl: z
    .string()
    .describe(
      'The URL of the audio file to transcribe. This should be a publicly accessible URL or a Firebase Storage gs:// URL.'
    ),
});
export type TranscribeAudioStoryInput = z.infer<
  typeof TranscribeAudioStoryInputSchema
>;

const TranscribeAudioStoryOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text of the audio story.'),
});
export type TranscribeAudioStoryOutput = z.infer<
  typeof TranscribeAudioStoryOutputSchema
>;

export async function transcribeAudioStory(
  input: TranscribeAudioStoryInput
): Promise<TranscribeAudioStoryOutput> {
  return transcribeAudioStoryFlow(input);
}


const transcribeAudioStoryFlow = ai.defineFlow(
  {
    name: 'transcribeAudioStoryFlow',
    inputSchema: TranscribeAudioStoryInputSchema,
    outputSchema: TranscribeAudioStoryOutputSchema,
  },
  async input => {
    try {
      console.log(`Starting transcription for ${input.audioUrl}`);
      
      const { output } = await ai.generate({
          model: 'googleai/gemini-1.5-flash',
          prompt: `Please transcribe the following audio file. The language is primarily Spanish. Provide only the transcribed text.`,
          config: {
              // Gemini can access files directly from Google Cloud Storage
              // when provided a `gs://` URI.
              // We are assuming the input audioUrl will be a gs:// URI
              // which Firebase Storage provides.
              // Note: This requires appropriate permissions to be set up.
              input: {
                  media: [{ url: input.audioUrl }],
              }
          }
      });

      const transcription = output?.trim();

      if (!transcription) {
          throw new Error("Transcription failed: AI returned no text.");
      }
      
      console.log("Transcription successful.");
      return { transcription };
    } catch (error: any) {
      console.error("Genkit Transcription Flow Error:", error);
      throw new Error(`Fallo en la transcripción: ${error.message || 'Error desconocido de IA'}`);
    }
  }
);
