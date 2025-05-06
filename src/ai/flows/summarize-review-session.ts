'use server';

/**
 * @fileOverview Summarizes the user's performance after a review session, 
 * highlighting words they struggled with to focus future study efforts.
 *
 * - summarizeReviewSession - A function that summarizes the review session.
 * - SummarizeReviewSessionInput - The input type for the summarizeReviewSession function.
 * - SummarizeReviewSessionOutput - The return type for the summarizeReviewSession function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeReviewSessionInputSchema = z.object({
  wordsStruggledWith: z
    .array(z.string())
    .describe('An array of words the user struggled with during the review session.'),
  totalWordsReviewed: z.number().describe('The total number of words reviewed in the session.'),
});
export type SummarizeReviewSessionInput = z.infer<typeof SummarizeReviewSessionInputSchema>;

const SummarizeReviewSessionOutputSchema = z.object({
  summary: z.string().describe('A summary of the review session performance.'),
});
export type SummarizeReviewSessionOutput = z.infer<typeof SummarizeReviewSessionOutputSchema>;

export async function summarizeReviewSession(
  input: SummarizeReviewSessionInput
): Promise<SummarizeReviewSessionOutput> {
  return summarizeReviewSessionFlow(input);
}

const summarizeReviewSessionPrompt = ai.definePrompt({
  name: 'summarizeReviewSessionPrompt',
  input: {schema: SummarizeReviewSessionInputSchema},
  output: {schema: SummarizeReviewSessionOutputSchema},
  prompt: `You are an AI assistant designed to provide helpful summaries of vocabulary review sessions.

  Provide a summary of the user's performance, highlighting the words they struggled with, so they can focus their future study efforts.
  The user struggled with the following words: {{wordsStruggledWith}}
  The user reviewed a total of {{totalWordsReviewed}} words.
  `,
});

const summarizeReviewSessionFlow = ai.defineFlow(
  {
    name: 'summarizeReviewSessionFlow',
    inputSchema: SummarizeReviewSessionInputSchema,
    outputSchema: SummarizeReviewSessionOutputSchema,
  },
  async input => {
    const {output} = await summarizeReviewSessionPrompt(input);
    return output!;
  }
);
