// src/ai/flows/feedback-assistant.ts
'use server';
/**
 * @fileOverview Provides an AI-powered feedback assistant for students to improve their evaluation clarity and objectivity.
 *
 * - getFeedbackSuggestions - A function that generates feedback suggestions based on the student's input.
 * - FeedbackAssistantInput - The input type for the getFeedbackSuggestions function.
 * - FeedbackAssistantOutput - The return type for the getFeedbackSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FeedbackAssistantInputSchema = z.object({
  evaluationText: z.string().describe('The current evaluation text provided by the student.'),
});
export type FeedbackAssistantInput = z.infer<typeof FeedbackAssistantInputSchema>;

const FeedbackAssistantOutputSchema = z.object({
  suggestions: z.array(
    z.string().describe('A list of suggestions to improve the evaluation text.')
  ).describe('Suggestions to improve the evaluation text for clarity and objectivity.'),
});
export type FeedbackAssistantOutput = z.infer<typeof FeedbackAssistantOutputSchema>;

export async function getFeedbackSuggestions(input: FeedbackAssistantInput): Promise<FeedbackAssistantOutput> {
  return feedbackAssistantFlow(input);
}

const feedbackAssistantPrompt = ai.definePrompt({
  name: 'feedbackAssistantPrompt',
  input: {schema: FeedbackAssistantInputSchema},
  output: {schema: FeedbackAssistantOutputSchema},
  prompt: `You are an AI assistant that helps students provide clear and objective feedback for their teachers. Review the student's current evaluation text and provide a list of suggestions to improve the clarity and objectivity of the feedback. Focus on suggesting specific examples or areas for improvement.

Evaluation Text: {{{evaluationText}}}

Suggestions (as a JSON array of strings):`,
});

const feedbackAssistantFlow = ai.defineFlow(
  {
    name: 'feedbackAssistantFlow',
    inputSchema: FeedbackAssistantInputSchema,
    outputSchema: FeedbackAssistantOutputSchema,
  },
  async input => {
    const {output} = await feedbackAssistantPrompt(input);
    return output!;
  }
);
