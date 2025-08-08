
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
  studentId: z.string().min(1, "El ID del estudiante es requerido."),
  teacherIds: z.array(z.string()).min(1, "Por favor, selecciona al menos un profesor para evaluar."),
  // La validación de las evaluaciones individuales se omite aquí para simplificar
  // y se confía en la validación del cliente.
  evaluations: z.any(),
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

type EvaluationFormData = z.infer<typeof evaluationSchema>;

export async function submitEvaluation(data: EvaluationFormData) {
  console.log("Iniciando submitEvaluation con datos:", JSON.stringify(data, null, 2));

  const validatedFields = evaluationSchema.safeParse(data);

  if (!validatedFields.success) {
    console.error("Falló la validación del servidor:", validatedFields.error.flatten());
    return {
      success: false,
      message: "La validación falló. Por favor, revisa tus respuestas.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { studentId, teacherIds, evaluations } = validatedFields.data;
  
  const studentDoc = await adminDb.collection("students").doc(studentId).get();
  if (!studentDoc.exists) {
      console.error(`Estudiante no encontrado con ID: ${studentId}`);
      return { success: false, message: "No se pudo encontrar la información del estudiante." };
  }
  const student = studentDoc.data() as Student;
  console.log(`Estudiante encontrado: ${student.name}`);

  try {
    const batch = adminDb.batch();
    const evaluationCollectionRef = adminDb.collection("evaluations");
    console.log(`Procesando evaluaciones para ${teacherIds.length} profesor(es).`);

    teacherIds.forEach((teacherId) => {
        const evaluationData = evaluations[teacherId];
        if (!evaluationData) {
            console.warn(`No se encontraron datos de evaluación para el profesor con ID: ${teacherId}`);
            return;
        }

        const scores = Object.fromEntries(
            Object.entries(evaluationData)
            .filter(([key]) => key.startsWith("q"))
            .map(([key, value]) => [key, Number(value)])
        );

        const newEvalRef = evaluationCollectionRef.doc();

        const docData: Omit<Evaluation, 'id' | 'createdAt'> & { createdAt: FieldValue } = {
            gradeId: student.gradeId,
            teacherId,
            studentId: studentId,
            scores,
            feedback: evaluationData.feedback || "",
            createdAt: FieldValue.serverTimestamp(),
        };
      
        batch.set(newEvalRef, docData);
        console.log(`Evaluación para el profesor ${teacherId} preparada para el batch.`);
    });

    await batch.commit();
    console.log("¡Batch de evaluaciones confirmado en Firestore con éxito!");

    revalidatePath("/dashboard");
    revalidatePath("/evaluation");

    return {
      success: true,
      message: "¡Evaluación enviada con éxito!",
    };

  } catch (error) {
    console.error("Error al confirmar el batch en Firestore:", error);
    return {
      success: false,
      message: "Ocurrió un error al guardar tu evaluación en la base de datos. Por favor, inténtalo de nuevo más tarde.",
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
  const studentSnapshot = await studentCollection.get();
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

export async function getDashboardData() {
  try {
    const [evaluations, grades, teachers] = await Promise.all([
      getEvaluations(),
      getGrades(),
      getTeachers(),
    ]);
    return { evaluations, grades, teachers };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Ensure we always return a valid object, even in case of an error.
    return { evaluations: [], grades: [], teachers: [] };
  }
}


export async function getEvaluationsByStudent(studentId: string): Promise<Evaluation[]> {
    if (!studentId) return [];
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

const studentUploadSchema = z.array(z.object({
    name: z.string().min(1),
    code: z.string().min(1),
    gradeName: z.string().min(1),
}));

export async function uploadStudents(studentsData: unknown) {
    const validatedFields = studentUploadSchema.safeParse(studentsData);

    if (!validatedFields.success) {
        return { success: false, message: "El formato de los datos de los estudiantes no es válido." };
    }

    try {
        const grades = await getGrades();
        const gradeMap = new Map(grades.map(g => [g.name, g.id]));

        const studentsCollectionRef = adminDb.collection("students");

        // 1. Delete all existing students
        const existingStudentsSnapshot = await studentsCollectionRef.get();
        if (!existingStudentsSnapshot.empty) {
            const deleteBatch = adminDb.batch();
            existingStudentsSnapshot.docs.forEach(doc => deleteBatch.delete(doc.ref));
            await deleteBatch.commit();
        }

        // 2. Add new students
        const addBatch = adminDb.batch();
        let studentCounter = 0;
        for (const student of validatedFields.data) {
            const gradeId = gradeMap.get(student.gradeName);
            if (!gradeId) {
                console.warn(`Grado no encontrado para '${student.gradeName}'. Saltando estudiante: ${student.name}`);
                continue;
            }
            const studentId = `s${++studentCounter}`;
            const studentDocRef = studentsCollectionRef.doc(studentId);
            const newStudent: Student = {
                id: studentId,
                name: student.name,
                code: student.code,
                gradeId: gradeId,
            };
            addBatch.set(studentDocRef, newStudent);
        }

        await addBatch.commit();
        
        revalidatePath("/dashboard");

        return { success: true, message: `${studentCounter} estudiantes cargados exitosamente.` };

    } catch (error) {
        console.error("Error al cargar estudiantes:", error);
        return { success: false, message: "Ocurrió un error en el servidor al cargar los estudiantes." };
    }
}
