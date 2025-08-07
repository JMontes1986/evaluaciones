
"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where, collectionGroup, getDoc, doc } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import type { Evaluation, Grade, Teacher, Student } from "@/lib/types";
import { getFeedbackSuggestions as getFeedbackSuggestionsAI } from "@/ai/flows/feedback-assistant";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const evaluationQuestions = [
  { id: "q1", text: "Demuestra dominio en los temas explicados en clase" },
  { id: "q2", text: "Presenta los temas con claridad" },
  { id: "q3", text: "Comunica el propósito de cada clase." },
  { id: "q4", text: "Responde las preguntas planteadas por los estudiantes." },
  { id: "q5", text: "Es puntual para iniciar y finalizar   las clases." },
  { id: "q6", text: "Explica los criterios de evaluación de la materia." },
  { id: "q7", text: "Representa figura de autoridad y controla la disciplina del grupo." },
  { id: "q8", text: "Revisa con frecuencia módulos y cuadernos" },
  { id: "q9", text: "Da a conocer oportunamente los resultados de las evaluaciones." },
  { id: "q10", text: "Indica normas de comportamiento en clase claras para todos" },
  { id: "q11", text: "El docente es respetado por los estudiantes del curso" },
  { id: "q12", text: "Realiza clases lúdicas y dinámicas" },
  { id: "q13", text: "Utiliza las herramientas tecnológicas del aula para dinamizar los procesos de enseñanza aprendizaje." },
  { id: "q14", text: "Actualiza el sistema académico de manera periódica, ingresando notas, tareas y evaluaciones." },
  { id: "q15", text: "Demuestra planeación y organización en el desarrollo del contenido de la asignatura" },
  { id: "q16", text: "Demuestra en su cotidianidad liderazgo positivo con estudiantes" },
  { id: "q17", text: "Escucha y atiende oportunamente las inquietudes e ideas de los estudiantes" },
  { id: "q18", text: "Refuerza las actitudes positivas de los estudiantes" },
  { id: "q19", text: "Establece y hace seguimiento a las estrategias que favorecen la sana convivencia escolar." },
  { id: "q20", text: "Promueve en sus estudiantes valores y actitud franciscana y lo demuestra con su ejemplo." },
  { id: "q21", text: "Relaciona los contenidos de su área con los contenidos de otras asignaturas" },
  { id: "q22", text: "El docente realiza la socialización y retroalimentación de las pruebas de seguimiento y/o simulacros." },
  { id: "q23", text: "El docente realiza evaluaciones claras, que se relacionan directamente con los aprendizajes orientados durante las clases." }
];

const evaluationSchema = z.object({
  teacherIds: z.array(z.string()).min(1, "Por favor, selecciona al menos un profesor para evaluar."),
  evaluations: z.record(
    z.string(),
    z.object({
      ...evaluationQuestions.reduce((acc, q) => {
        acc[q.id] = z.string().min(1, `Por favor, califica este criterio.`);
        return acc;
      }, {} as Record<string, z.ZodString>),
      feedback: z.string().optional(),
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
    const studentId = studentSnapshot.docs[0].id;
    const expires = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours
    cookies().set("student_session", JSON.stringify({...studentData, id: studentId}), { expires, httpOnly: true });
    
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
  const studentSession = cookies().get("student_session")?.value;

  if (!studentSession) {
    return {
      success: false,
      message: "No se ha encontrado una sesión de estudiante. Por favor, inicia sesión de nuevo.",
      errors: null,
    };
  }

  const student: Student = JSON.parse(studentSession);

  const rawData = {
    teacherIds: JSON.parse(formData.get("teacherIds") as string),
    evaluations: JSON.parse(formData.get("evaluations") as string)
  };

  const validatedFields = evaluationSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      message: "La validación falló. Por favor, revisa tus respuestas.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { teacherIds, evaluations } = validatedFields.data;

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
        gradeId: student.gradeId,
        teacherId,
        studentId: student.id,
        scores,
        feedback: evaluationData.feedback || "",
        createdAt: serverTimestamp(),
      };
      
      const evaluationCollectionRef = collection(db, "students", student.id, "evaluations");
      batch.push(addDoc(evaluationCollectionRef, docData));
    });

    await Promise.all(batch);

    revalidatePath("/dashboard");
    revalidatePath("/evaluation");

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

export async function getStudents(): Promise<Student[]> {
  const studentsCollection = collection(db, "students");
  const studentSnapshot = await getDocs(studentsCollection);
  return studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
}

export async function getEvaluations(): Promise<Evaluation[]> {
    const allStudents = await getStudents();
    const allEvaluations: Evaluation[] = [];
    
    for (const student of allStudents) {
        const studentEvals = await getEvaluationsByStudent(student.id);
        allEvaluations.push(...studentEvals);
    }
    
    return allEvaluations;
}

export async function getDashboardData(): Promise<{evaluations: Evaluation[], grades: Grade[], teachers: Teacher[]}> {
  try {
    const [evaluations, grades, teachers] = await Promise.all([
      getEvaluations(),
      getGrades(),
      getTeachers(),
    ]);
    return { evaluations, grades, teachers };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return { evaluations: [], grades: [], teachers: [] };
  }
}


export async function getEvaluationsByStudent(studentId: string): Promise<Evaluation[]> {
    const evaluationsCollection = collection(db, `students/${studentId}/evaluations`);
    const q = query(evaluationsCollection);
    const evaluationSnapshot = await getDocs(q);
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

    
