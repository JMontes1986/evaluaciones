'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { getFeedbackSuggestions as getFeedbackSuggestionsFlow, type FeedbackAssistantInput } from '@/ai/flows/feedback-assistant';
import type { Grade, Teacher } from '@/lib/types';

const evaluationQuestions = [
  { id: 'q1', text: 'Demuestra un profundo conocimiento de la materia.' },
  { id: 'q2', text: 'Comunica los conceptos de forma clara y eficaz.' },
  { id: 'q3', text: 'Crea un ambiente de aprendizaje atractivo e inclusivo.' },
  { id: 'q4', text: 'Proporciona comentarios oportunos y constructivos sobre las tareas.' },
  { id: 'q5', text: 'Es accesible y está disponible para ayudar.' },
];

const evaluationSchema = z.object({
  gradeId: z.string().min(1, 'Por favor, selecciona un grado.'),
  teacherIds: z.array(z.string()).min(1, 'Por favor, selecciona al menos un profesor para evaluar.'),
  evaluations: z.record(
    z.string(),
    z.object({
      ...evaluationQuestions.reduce((acc, q) => {
        acc[q.id] = z.string().min(1, `Por favor, califica este criterio.`);
        return acc;
      }, {} as Record<string, z.ZodString>),
      feedback: z.string().min(1, 'Por favor, proporciona retroalimentación por escrito.'),
    })
  ),
});


export async function submitEvaluation(prevState: any, formData: FormData) {
  const rawData = {
    gradeId: formData.get('gradeId'),
    teacherIds: JSON.parse(formData.get('teacherIds') as string),
    evaluations: JSON.parse(formData.get('evaluations') as string)
  };

  const validatedFields = evaluationSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      message: 'La validación falló. Por favor, revisa tus respuestas.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { gradeId, teacherIds, evaluations } = validatedFields.data;
  const studentId = `student_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  try {
    const batch: Promise<any>[] = [];
    Object.entries(evaluations).forEach(([teacherId, evaluationData]) => {
      if (!teacherIds.includes(teacherId)) return;

      const scores = Object.fromEntries(
        Object.entries(evaluationData)
          .filter(([key]) => key.startsWith('q'))
          .map(([key, value]) => [key, Number(value)])
      );

      const docData = {
        gradeId,
        teacherId,
        studentId,
        scores,
        feedback: evaluationData.feedback,
        createdAt: serverTimestamp(),
      };
      batch.push(addDoc(collection(db, "evaluations"), docData));
    });

    await Promise.all(batch);

    revalidatePath('/dashboard');

    return {
      success: true,
      message: '¡Evaluación enviada con éxito!',
      errors: null,
    };

  } catch (error) {
    console.error("Error al guardar la evaluación:", error);
    return {
      success: false,
      message: 'Ocurrió un error al guardar tu evaluación. Por favor, inténtalo de nuevo más tarde.',
      errors: null,
    };
  }
}

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


export async function getGrades(): Promise<Grade[]> {
    const gradesCollection = collection(db, 'grades');
    const gradeSnapshot = await getDocs(gradesCollection);
    const gradeList = gradeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
    return gradeList.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getTeachers(): Promise<Teacher[]> {
    const teachersCollection = collection(db, 'teachers');
    const teacherSnapshot = await getDocs(teachersCollection);
    const teacherList = teacherSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
    return teacherList;
}