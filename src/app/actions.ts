'use server';

import { 
  getFeedbackSuggestions as getFeedbackSuggestionsFlow, 
  type FeedbackAssistantInput 
} from '@/ai/flows/feedback-assistant';
import { z } from 'zod';

const inputSchema = z.object({
  evaluationText: z.string().min(10, { message: 'Por favor, proporciona al menos 10 caracteres de retroalimentación para obtener sugerencias.' }),
});

export async function getFeedbackSuggestions(prevState: any, formData: FormData) {
  const evaluationText = formData.get('evaluationText') as string;

  const validatedFields = inputSchema.safeParse({ evaluationText });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'La validación falló',
      suggestions: null,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await getFeedbackSuggestionsFlow({ evaluationText: validatedFields.data.evaluationText });
    if (!result || !result.suggestions || result.suggestions.length === 0) {
      return {
        success: true,
        message: 'No hay sugerencias disponibles en este momento. ¡Tu retroalimentación se ve bien!',
        suggestions: ["Tu retroalimentación es clara y concisa. No hay sugerencias en este momento."],
        errors: null,
      }
    }
    return {
      success: true,
      message: 'Éxito',
      suggestions: result.suggestions,
      errors: null,
    }
  } catch (error) {
    console.error("Error en la retroalimentación de la IA:", error);
    return {
      success: false,
      message: 'Ocurrió un error al obtener sugerencias. Por favor, inténtalo de nuevo más tarde.',
      suggestions: null,
      errors: null,
    }
  }
}
