// src/ai/flows/feedback-assistant.ts
"use server";
/**
 * @fileOverview Provides an AI-powered feedback assistant for students to improve their evaluation clarity and objectivity.
 *
 * - getFeedbackSuggestions - A function that generates feedback suggestions based on the student's input.
 * - FeedbackAssistantInput - The input type for the getFeedbackSuggestions function.
 * - FeedbackAssistantOutput - The return type for the getFeedbackSuggestions function.
 */

import {ai} from "@/ai/genkit";
import {z} from "genkit";

const FeedbackAssistantInputSchema = z.object({
  evaluationText: z.string().describe("El texto de evaluación actual proporcionado por el estudiante."),
});
export type FeedbackAssistantInput = z.infer<typeof FeedbackAssistantInputSchema>;

const FeedbackAssistantOutputSchema = z.object({
  suggestions: z.array(
    z.string().describe("Una lista de sugerencias para mejorar el texto de la evaluación.")
  ).describe("Sugerencias para mejorar la claridad y objetividad del texto de la evaluación."),
});
export type FeedbackAssistantOutput = z.infer<typeof FeedbackAssistantOutputSchema>;

export async function getFeedbackSuggestions(input: FeedbackAssistantInput): Promise<FeedbackAssistantOutput> {
  return feedbackAssistantFlow(input);
}

const feedbackAssistantPrompt = ai.definePrompt({
  name: "feedbackAssistantPrompt",
  input: {schema: FeedbackAssistantInputSchema},
  output: {schema: FeedbackAssistantOutputSchema},
  prompt: `Eres un asistente de IA que ayuda a los estudiantes a proporcionar comentarios claros y objetivos para sus profesores. Revisa el texto de evaluación actual del estudiante y proporciona una lista de sugerencias para mejorar la claridad y objetividad de los comentarios. Concéntrate en sugerir ejemplos específicos o áreas de mejora.

Texto de Evaluación: {{{evaluationText}}}

Sugerencias (como un array JSON de strings):`,
});

const feedbackAssistantFlow = ai.defineFlow(
  {
    name: "feedbackAssistantFlow",
    inputSchema: FeedbackAssistantInputSchema,
    outputSchema: FeedbackAssistantOutputSchema,
  },
  async input => {
    const {output} = await feedbackAssistantPrompt(input);
    return output!;
  }
);
