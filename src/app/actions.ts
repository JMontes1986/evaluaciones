'use server';

import { 
  getFeedbackSuggestions as getFeedbackSuggestionsFlow, 
  type FeedbackAssistantInput 
} from '@/ai/flows/feedback-assistant';
import { z } from 'zod';

const inputSchema = z.object({
  evaluationText: z.string().min(10, { message: 'Please provide at least 10 characters of feedback to get suggestions.' }),
});

export async function getFeedbackSuggestions(prevState: any, formData: FormData) {
  const evaluationText = formData.get('evaluationText') as string;

  const validatedFields = inputSchema.safeParse({ evaluationText });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed',
      suggestions: null,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await getFeedbackSuggestionsFlow({ evaluationText: validatedFields.data.evaluationText });
    if (!result || !result.suggestions || result.suggestions.length === 0) {
      return {
        success: true,
        message: 'No suggestions available at the moment. Your feedback looks good!',
        suggestions: ["Your feedback is clear and concise. No suggestions at this time."],
        errors: null,
      }
    }
    return {
      success: true,
      message: 'Success',
      suggestions: result.suggestions,
      errors: null,
    }
  } catch (error) {
    console.error("AI feedback error:", error);
    return {
      success: false,
      message: 'An error occurred while getting suggestions. Please try again later.',
      suggestions: null,
      errors: null,
    }
  }
}
