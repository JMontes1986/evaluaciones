
"use server";

import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import type { Evaluation, Grade, Teacher, Student } from "@/lib/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { evaluationQuestions } from "@/lib/types";


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
  if (username === "administrador" && password === "G3m3ll1.2024*") {
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

    const studentsCollection = adminDb.collection("students");
    const q = studentsCollection.where("code", "==", code);
    const studentSnapshot = await q.get();

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

  // Extraer los datos del formulario directamente.
  const rawData = {
    teacherIds: JSON.parse(formData.get("teacherIds") as string),
    evaluations: JSON.parse(formData.get("evaluations") as string)
  };
  
  const validatedFields = evaluationSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.flatten());
    return {
      success: false,
      message: "La validación falló. Por favor, revisa tus respuestas.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { teacherIds, evaluations } = validatedFields.data;

  try {
    const batch = adminDb.batch();
    const evaluationCollectionRef = adminDb.collection("evaluations");

    // Iterar solo sobre los profesores seleccionados que tienen datos.
    teacherIds.forEach((teacherId) => {
        const evaluationData = evaluations[teacherId];
        if (!evaluationData) return; // Si no hay datos para este profesor, saltar.

        const scores = Object.fromEntries(
            Object.entries(evaluationData)
            .filter(([key]) => key.startsWith("q"))
            .map(([key, value]) => [key, Number(value)])
        );

        // Crear una nueva referencia de documento para cada evaluación en la colección raíz 'evaluations'.
        const newEvalRef = evaluationCollectionRef.doc();

        const docData: Omit<Evaluation, 'id' | 'createdAt'> & { createdAt: FieldValue } = {
            gradeId: student.gradeId,
            teacherId,
            studentId: student.id,
            scores,
            feedback: evaluationData.feedback || "",
            createdAt: FieldValue.serverTimestamp(),
        };
      
        batch.set(newEvalRef, docData);
    });

    await batch.commit();

    revalidatePath("/dashboard");
    revalidatePath("/evaluation");

    return {
      success: true,
      message: "¡Evaluación enviada con éxito!",
      errors: null,
    };

  } catch (error) {
    console.error("Error submitting evaluation to Firestore:", error);
    return {
      success: false,
      message: "Ocurrió un error al guardar tu evaluación en la base de datos. Por favor, inténtalo de nuevo más tarde.",
      errors: null,
    };
  }
}

export async function getGrades(): Promise<Grade[]> {
    const gradesCollection = adminDb.collection("grades");
    const gradeSnapshot = await gradesCollection.get();
    const gradeList = gradeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
    
    return gradeList.sort((a, b) => {
        const numA = parseInt(a.name.replace("°", ""));
        const numB = parseInt(b.name.replace("°", ""));
        return numA - numB;
    });
}

export async function getTeachers(): Promise<Teacher[]> {
    const teachersCollection = adminDb.collection("teachers");
    const teacherSnapshot = await teachersCollection.get();
    const teacherList = teacherSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
    return teacherList;
}

export async function getStudents(): Promise<Student[]> {
  const studentsCollection = adminDb.collection("students");
  const studentSnapshot = await studentsCollection.get();
  return studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
}

export async function getEvaluations(): Promise<Evaluation[]> {
    const evaluationsCollection = adminDb.collection("evaluations");
    const evaluationSnapshot = await evaluationsCollection.get();
    const evaluationList = evaluationSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            // Convert Timestamp to ISO string
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        } as Evaluation
    });
    return evaluationList;
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
    const evaluationsCollection = adminDb.collection("evaluations");
    const q = evaluationsCollection.where("studentId", "==", studentId);
    const evaluationSnapshot = await q.get();

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
