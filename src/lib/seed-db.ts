
import { collection, writeBatch, getDocs, doc, query } from "firebase/firestore";
import { db } from "./firebase"; // Asegúrate que la ruta a tu configuración de firebase sea correcta
import type { Grade, Teacher, Student } from "./types";

const initialGrades: Grade[] = [
  { id: "g1", name: "3°" },
  { id: "g2", name: "4°" },
  { id: "g3", name: "5°" },
  { id: "g4", name: "6°" },
  { id: "g5", name: "7°" },
  { id: "g6", name: "8°" },
  { id: "g7", name: "9°" },
  { id: "g8", name: "10°" },
  { id: "g9", name: "11°" },
];

const initialTeachers: Omit<Teacher, "id">[] = [
  { name: "Natalia Valencia Benítez", subject: "Ciencias Naturales", grades: ["g1"] },
];

const initialStudents: Omit<Student, "id">[] = [
    { name: "ALZATE CLAVIJO JUAN ALEJANDRO", code: "5566", gradeId: "g1" }
];


async function seedDatabase() {
  console.log("🌱 Empezando a poblar la base de datos...");
  let exitCode = 0;

  try {
    // ---- Poblar Grados ----
    const gradesCollection = collection(db, "grades");
    const gradesBatch = writeBatch(db);
    console.log("🗑️ Borrando grados existentes...");
    const existingGrades = await getDocs(query(gradesCollection));
    existingGrades.forEach(doc => gradesBatch.delete(doc.ref));
    await gradesBatch.commit();
    
    const newGradesBatch = writeBatch(db);
    console.log("📚 Añadiendo grados...");
    initialGrades.forEach((grade) => {
      const docRef = doc(gradesCollection, grade.id);
      newGradesBatch.set(docRef, grade);
    });
    await newGradesBatch.commit();
    console.log("✅ Grados añadidos con éxito.");

    // ---- Poblar Profesores ----
    const teachersCollection = collection(db, "teachers");
    const teachersBatch = writeBatch(db);
    console.log("🗑️ Borrando profesores existentes...");
    const existingTeachers = await getDocs(query(teachersCollection));
    existingTeachers.forEach(doc => teachersBatch.delete(doc.ref));
    await teachersBatch.commit();

    const newTeachersBatch = writeBatch(db);
    console.log("👩‍🏫 Añadiendo profesores...");
    initialTeachers.forEach((teacher, index) => {
      const teacherId = `t${index + 1}`;
      const docRef = doc(teachersCollection, teacherId);
      newTeachersBatch.set(docRef, { ...teacher, id: teacherId });
    });
    await newTeachersBatch.commit();
    console.log("✅ Profesores añadidos con éxito.");

    // ---- Poblar Estudiantes ----
    const studentsCollection = collection(db, "students");
    const studentsBatch = writeBatch(db);
    console.log("🗑️ Borrando estudiantes existentes...");
    const existingStudents = await getDocs(query(studentsCollection));
    existingStudents.forEach(doc => studentsBatch.delete(doc.ref));
    await studentsBatch.commit();

    const newStudentsBatch = writeBatch(db);
    console.log("👨‍🎓 Añadiendo estudiantes...");
    initialStudents.forEach((student, index) => {
        const studentId = `s${index + 1}`;
        const docRef = doc(studentsCollection, studentId);
        newStudentsBatch.set(docRef, { ...student, id: studentId });
    });
    await newStudentsBatch.commit();
    console.log("✅ Estudiantes añadidos con éxito.");

    console.log("✨ ¡Base de datos poblada exitosamente!");

  } catch (error) {
    console.error("❌ Error poblando la base de datos:", error);
    exitCode = 1;
  } finally {
    // Terminar el proceso
    process.exit(exitCode);
  }
}

seedDatabase();
