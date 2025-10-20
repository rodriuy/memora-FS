'use server';

/**
 * @fileOverview Anonymizes a story for donation to Estudia Memora.
 *
 * - anonymizeStory - A function that handles the anonymization process.
 * - AnonymizeStoryInput - The input type for the anonymizeStory function.
 * - AnonymizeStoryOutput - The return type for the anonymizeStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnonymizeStoryInputSchema = z.object({
  storyText: z
    .string()
    .describe('The text of the story to be anonymized.'),
});
export type AnonymizeStoryInput = z.infer<typeof AnonymizeStoryInputSchema>;

const AnonymizeStoryOutputSchema = z.object({
  anonymizedText: z
    .string()
    .describe('The anonymized text of the story.'),
});
export type AnonymizeStoryOutput = z.infer<typeof AnonymizeStoryOutputSchema>;

export async function anonymizeStory(
  input: AnonymizeStoryInput
): Promise<AnonymizeStoryOutput> {
  return anonymizeStoryFlow(input);
}

const anonymizeStoryPrompt = ai.definePrompt({
  name: 'anonymizeStoryPrompt',
  input: {schema: AnonymizeStoryInputSchema},
  output: {schema: AnonymizeStoryOutputSchema},
  prompt: `You are an expert at anonymizing text while preserving its original meaning and context.

  Please anonymize the following story text, removing any personally identifiable information such as names, locations, and specific dates.  Replace them with generic terms or placeholders where appropriate to maintain readability.

  Original Story Text: {{{storyText}}}

  Anonymized Story Text:`,
});

const anonymizeStoryFlow = ai.defineFlow(
  {
    name: 'anonymizeStoryFlow',
    inputSchema: AnonymizeStoryInputSchema,
    outputSchema: AnonymizeStoryOutputSchema,
  },
  async input => {
    try {
      const {output} = await anonymizeStoryPrompt(input);
      return output!;
    } catch (error: any) {
      console.error("Error in anonymizeStoryFlow:", error);
      throw new Error(`Fallo en la anonimización: ${error.message || 'Error desconocido'}`);
    }
  }
);
