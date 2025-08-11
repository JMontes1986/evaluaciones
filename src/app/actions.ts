
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
    await cookies().set("session", "admin_logged_in", { expires, httpOnly: true });
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
    await cookies().set("student_session", JSON.stringify({...studentData, id: studentId}), { expires, httpOnly: true });
    
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
  const validatedFields = evaluationSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "La validación falló. Por favor, revisa tus respuestas.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { studentId, teacherIds, evaluations } = validatedFields.data;
  
  const studentDoc = await adminDb.collection("students").doc(studentId).get();
  if (!studentDoc.exists) {
      return { success: false, message: "No se pudo encontrar la información del estudiante." };
  }
  const student = studentDoc.data() as Student;

  try {
    const batch = adminDb.batch();
    const evaluationCollectionRef = adminDb.collection("evaluations");

    teacherIds.forEach((teacherId) => {
        const evaluationData = evaluations[teacherId];
        if (!evaluationData) {
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
    });

    await batch.commit();

    revalidatePath("/dashboard/results");
    revalidatePath("/evaluation");

    return {
      success: true,
      message: "¡Evaluación enviada con éxito!",
    };

  } catch (error) {
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
    const teacherList = teacherSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id,
            name: data.name,
            subject: data.subject,
            grades: data.grades || [] // This now returns an array of grade IDs
        } as Teacher;
    });
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
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        } as Evaluation
    });
    return evaluationList;
}

export async function getDashboardData() {
  try {
    const [evaluations, grades, teachers, students] = await Promise.all([
      getEvaluations(),
      getGrades(),
      getTeachers(),
      getStudents(),
    ]);
    return { evaluations, grades, teachers, students };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return { evaluations: [], grades: [], teachers: [], students: [] };
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
    name: z.string().min(1, "El nombre no puede estar vacío."),
    code: z.string().min(1, "El código no puede estar vacío."),
    grade: z.string().min(1, "El grado no puede estar vacío."),
}));

export async function uploadStudents(studentsData: unknown) {
    const validatedFields = studentUploadSchema.safeParse(studentsData);

    if (!validatedFields.success) {
        return { success: false, message: "El formato de los datos de los estudiantes no es válido. Revisa el archivo CSV." };
    }

    try {
        const grades = await getGrades();
        const gradeMap = new Map(grades.map(g => [g.name, g.id]));

        const studentsCollectionRef = adminDb.collection("students");
        const existingStudentsSnapshot = await studentsCollectionRef.get();
        const existingCodes = new Set(existingStudentsSnapshot.docs.map(doc => doc.data().code));
        
        const addBatch = adminDb.batch();
        let studentCounter = 0;
        let skippedCounter = 0;
        let duplicateCounter = 0;
        
        for (const student of validatedFields.data) {
            if(existingCodes.has(student.code)) {
                duplicateCounter++;
                continue; 
            }

            const gradeId = gradeMap.get(student.grade);
            if (!gradeId) {
                skippedCounter++;
                continue;
            }
            
            const studentDocRef = studentsCollectionRef.doc();

            const newStudent: Omit<Student, 'id'> = {
                name: student.name,
                code: student.code,
                gradeId: gradeId,
            };
            addBatch.set(studentDocRef, newStudent);
            studentCounter++;
        }

        await addBatch.commit();
        
        revalidatePath("/dashboard/configuration");

        let message = `${studentCounter} estudiantes cargados exitosamente.`;
        if (duplicateCounter > 0) {
            message += ` ${duplicateCounter} estudiantes fueron omitidos porque su código ya existía.`;
        }
        if (skippedCounter > 0) {
            message += ` ${skippedCounter} estudiantes fueron omitidos debido a que su grado no fue encontrado.`;
        }

        return { success: true, message };

    } catch (error) {
        return { success: false, message: "Ocurrió un error en el servidor al procesar el archivo. Revisa los registros para más detalles." };
    }
}

const addStudentSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  code: z.string().min(1, "El código es requerido."),
  gradeId: z.string().min(1, "Por favor, selecciona un grado."),
});

export async function addStudent(prevState: any, formData: FormData) {
    const validatedFields = addStudentSchema.safeParse({
        name: formData.get("name"),
        code: formData.get("code"),
        gradeId: formData.get("gradeId"),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Datos inválidos. Revisa los campos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, code, gradeId } = validatedFields.data;

    try {
        const studentsCollection = adminDb.collection("students");
        
        const existingStudentQuery = await studentsCollection.where("code", "==", code).limit(1).get();
        if (!existingStudentQuery.empty) {
            return { 
                success: false, 
                message: `Ya existe un estudiante con el código ${code}.`,
                errors: { code: ['Este código ya está en uso.'] }
            };
        }

        const studentDocRef = studentsCollection.doc();
        const newStudent: Omit<Student, 'id'> = { name, code, gradeId };
        
        await studentDocRef.set(newStudent);
        
        revalidatePath("/dashboard/configuration");

        return { success: true, message: `Estudiante ${name} añadido exitosamente.` };

    } catch (error) {
        console.error("Error al añadir estudiante:", error);
        return { 
            success: false, 
            message: "Ocurrió un error en el servidor al añadir el estudiante."
        };
    }
}
