
"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import type { Evaluation, Grade, Teacher, Student } from "@/lib/types";
import { getFeedbackSuggestions as getFeedbackSuggestionsAI } from "@/ai/flows/feedback-assistant";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const evaluationQuestions = [
  { id: "q1", text: "Demuestra un profundo conocimiento de la materia." },
  { id: "q2", text: "Comunica los conceptos de forma clara y eficaz." },
  { id: "q3", text: "Crea un ambiente de aprendizaje atractivo e inclusivo." },
  { id: "q4", text: "Proporciona comentarios oportunos y constructivos sobre las tareas." },
  { id: "q5", text: "Es accesible y está disponible para ayudar." },
];

const evaluationSchema = z.object({
  gradeId: z.string().min(1, "Por favor, selecciona un grado."),
  teacherIds: z.array(z.string()).min(1, "Por favor, selecciona al menos un profesor para evaluar."),
  evaluations: z.record(
    z.string(),
    z.object({
      ...evaluationQuestions.reduce((acc, q) => {
        acc[q.id] = z.string().min(1, `Por favor, califica este criterio.`);
        return acc;
      }, {} as Record<string, z.ZodString>),
      feedback: z.string().min(1, "Por favor, proporciona retroalimentación por escrito."),
    })
  ),
});

const adminLoginSchema = z.object({
  username: z.string().min(1, { message: "El usuario es requerido." }),
  password: z.string().min(1, { message: "La contraseña es requerida." }),
});

const studentLoginSchema = z.object({
    code: z.string().min(1, { message: "El código es requerido." }),
});


export async function login(prevState: any, formData: FormData) {
  const validatedFields = adminLoginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Por favor, completa ambos campos.",
    };
  }

  const { username, password } = validatedFields.data;

  // WARNING: Hardcoded credentials. In a real-world scenario, use a secure authentication provider.
  if (username === "administrador" && password === "G3m3ll1.2022*") {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    cookies().set("session", "admin_logged_in", { expires, httpOnly: true });
    return redirect("/dashboard");
  } else {
    return {
      message: "Usuario o contraseña incorrectos.",
    };
  }
}

export async function studentLogin(prevState: any, formData: FormData) {
    const validatedFields = studentLoginSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Por favor, ingresa tu código.",
        };
    }

    const { code } = validatedFields.data;

    const studentsCollection = collection(db, "students");
    const q = query(studentsCollection, where("code", "==", code));
    const studentSnapshot = await getDocs(q);

    if (studentSnapshot.empty) {
        return { message: "Código de estudiante no encontrado." };
    }

    const studentData = studentSnapshot.docs[0].data() as Student;
    const expires = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours
    cookies().set("student_session", JSON.stringify(studentData), { expires, httpOnly: true });
    
    revalidatePath("/evaluation");
    redirect("/evaluation");
}


export async function logout() {
  cookies().set("session", "", { expires: new Date(0) });
  redirect("/login");
}

export async function studentLogout() {
  cookies().set("student_session", "", { expires: new Date(0) });
  revalidatePath("/evaluation");
  redirect("/evaluation");
}


export async function submitEvaluation(prevState: any, formData: FormData) {
  const rawData = {
    gradeId: formData.get("gradeId"),
    teacherIds: JSON.parse(formData.get("teacherIds") as string),
    evaluations: JSON.parse(formData.get("evaluations") as string)
  };

  const validatedFields = evaluationSchema.safeParse(rawData);
  const studentSession = cookies().get("student_session")?.value;

  if (!studentSession) {
      return {
          success: false,
          message: "No se ha encontrado una sesión de estudiante. Por favor, inicia sesión de nuevo.",
          errors: null,
      }
  }

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      message: "La validación falló. Por favor, revisa tus respuestas.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { gradeId, teacherIds, evaluations } = validatedFields.data;
  const student = JSON.parse(studentSession);


  try {
    const batch: Promise<any>[] = [];
    Object.entries(evaluations).forEach(([teacherId, evaluationData]) => {
      if (!teacherIds.includes(teacherId)) return;

      const scores = Object.fromEntries(
        Object.entries(evaluationData)
          .filter(([key]) => key.startsWith("q"))
          .map(([key, value]) => [key, Number(value)])
      );

      const docData = {
        gradeId,
        teacherId,
        studentId: student.id,
        scores,
        feedback: evaluationData.feedback,
        createdAt: serverTimestamp(),
      };
      batch.push(addDoc(collection(db, "evaluations"), docData));
    });

    await Promise.all(batch);

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "¡Evaluación enviada con éxito!",
      errors: null,
    };

  } catch (error) {
    console.error("Error al guardar la evaluación:", error);
    return {
      success: false,
      message: "Ocurrió un error al guardar tu evaluación. Por favor, inténtalo de nuevo más tarde.",
      errors: null,
    };
  }
}

export async function getGrades(): Promise<Grade[]> {
    const gradesCollection = collection(db, "grades");
    const gradeSnapshot = await getDocs(gradesCollection);
    const gradeList = gradeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
    
    return gradeList.sort((a, b) => {
        const numA = parseInt(a.name.replace("°", ""));
        const numB = parseInt(b.name.replace("°", ""));
        return numA - numB;
    });
}

export async function getTeachers(): Promise<Teacher[]> {
    const teachersCollection = collection(db, "teachers");
    const teacherSnapshot = await getDocs(teachersCollection);
    const teacherList = teacherSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
    return teacherList;
}

export async function getEvaluations(): Promise<Evaluation[]> {
    const evaluationsCollection = collection(db, "evaluations");
    const evaluationSnapshot = await getDocs(evaluationsCollection);
    const evaluationList = evaluationSnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
      } as Evaluation
    });
    return evaluationList;
}


export async function getFeedbackSuggestions(prevState: any, formData: FormData) {
  const evaluationText = formData.get("evaluationText") as string;
  if (!evaluationText || evaluationText.trim().length < 10) {
    return {
      success: false,
      message: "Por favor, introduce un texto de evaluación más largo para obtener sugerencias.",
      suggestions: null,
    };
  }

  try {
    const result = await getFeedbackSuggestionsAI({ evaluationText });
    return {
      success: true,
      message: "Sugerencias generadas con éxito.",
      suggestions: result.suggestions,
    };
  } catch (error) {
    console.error("Error getting feedback suggestions:", error);
    return {
      success: false,
      message: "No se pudieron generar sugerencias. Inténtalo de nuevo.",
      suggestions: null,
    };
  }
}
