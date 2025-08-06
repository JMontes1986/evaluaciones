
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

  try {
    // Poblar Grados
    const gradesBatch = writeBatch(db);
    const gradesCollection = collection(db, "grades");
    
    const existingGrades = await getDocs(gradesCollection);
    existingGrades.forEach(doc => gradesBatch.delete(doc.ref));
    
    console.log("📚 Añadiendo grados...");
    initialGrades.forEach((grade) => {
      const docRef = doc(gradesCollection, grade.id);
      gradesBatch.set(docRef, grade);
    });
    await gradesBatch.commit();
    console.log("✅ Grados añadidos con éxito.");

    // Poblar Profesores
    const teachersBatch = writeBatch(db);
    const teachersCollection = collection(db, "teachers");

    const existingTeachers = await getDocs(teachersCollection);
    existingTeachers.forEach(doc => teachersBatch.delete(doc.ref));

    console.log("👩‍🏫 Añadiendo profesores...");
    initialTeachers.forEach((teacher, index) => {
      const teacherId = `t${index + 1}`;
      const docRef = doc(teachersCollection, teacherId);
      teachersBatch.set(docRef, { ...teacher, id: teacherId });
    });
    await teachersBatch.commit();
    console.log("✅ Profesores añadidos con éxito.");

    // Poblar Estudiantes
    const studentsBatch = writeBatch(db);
    const studentsCollection = collection(db, "students");

    // Borra los estudiantes existentes antes de añadir los nuevos.
    const studentQuery = query(studentsCollection);
    const existingStudents = await getDocs(studentQuery);
    existingStudents.forEach(doc => studentsBatch.delete(doc.ref));

    console.log("👨‍🎓 Añadiendo estudiantes...");
    initialStudents.forEach((student, index) => {
        const studentId = `s${index + 1}`;
        const docRef = doc(studentsCollection, studentId);
        studentsBatch.set(docRef, { ...student, id: studentId });
    });
    await studentsBatch.commit();
    console.log("✅ Estudiantes añadidos con éxito.");


    console.log("✨ ¡Base de datos poblada exitosamente!");

  } catch (error) {
    console.error("❌ Error poblando la base de datos:", error);
  } finally {
    // Terminar el proceso
    process.exit(0);
  }
}

seedDatabase();
