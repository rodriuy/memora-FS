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
    .describe("The URL of the audio file to transcribe, located in Firebase Storage."),
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

const transcribeAudioStoryPrompt = ai.definePrompt({
  name: 'transcribeAudioStoryPrompt',
  input: {schema: TranscribeAudioStoryInputSchema},
  output: {schema: TranscribeAudioStoryOutputSchema},
  prompt: `Transcribe the audio file at the given URL into text.\n\nAudio URL: {{{audioUrl}}}`,
});

const transcribeAudioStoryFlow = ai.defineFlow(
  {
    name: 'transcribeAudioStoryFlow',
    inputSchema: TranscribeAudioStoryInputSchema,
    outputSchema: TranscribeAudioStoryOutputSchema,
  },
  async input => {
    const {output} = await transcribeAudioStoryPrompt(input);
    return output!;
  }
);
