
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
    { name: "ARCILA DÍAZ SAMANTHA", code: "5540", gradeId: "g1" },
    { name: "ARÍAS GONZÁLEZ DAMIAN", code: "5741", gradeId: "g1" },
    { name: "BOTERO GIRALDO SANTIAGO", code: "5593", gradeId: "g1" },
    { name: "CALLE DÁVILA ANTONIO", code: "5502", gradeId: "g1" },
    { name: "CASAS GARCIA EMMANUEL", code: "5619", gradeId: "g1" },
    { name: "CASTRILLÓN OROZCO MARÍA PAZ", code: "5539", gradeId: "g1" },
    { name: "DUQUE VALENCIA SAMANTHA", code: "5519", gradeId: "g1" },
    { name: "FERNANDEZ RAMIREZ JUAN ANDRES", code: "5615", gradeId: "g1" },
    { name: "FRANCO MORENO JOAQUÍN", code: "5686", gradeId: "g1" },
    { name: "GALLEGO GARCIA GABRIELA", code: "5627", gradeId: "g1" },
    { name: "GARCÍA LEÓN KATHERINE", code: "5493", gradeId: "g1" },
    { name: "HOYOS MISAS LUCIA", code: "5491", gradeId: "g1" },
    { name: "ISAZA LONDOÑO ANTONIA", code: "5504", gradeId: "g1" },
    { name: "LÓPEZ CASTAÑO TOMÁS", code: "5526", gradeId: "g1" },
    { name: "MARTÍNEZ ALVAREZ VICTORIA", code: "5651", gradeId: "g1" },
    { name: "MUNEVAR GRANADOS VALERI LUCIANA", code: "5543", gradeId: "g1" },
    { name: "NARANJO LÓPEZ LUCIANA", code: "5562", gradeId: "g1" },
    { name: "OSORIO LOPERA ANTONIA", code: "5628", gradeId: "g1" },
    { name: "OSPINA ECHEVERRY EMILIANO", code: "5608", gradeId: "g1" },
    { name: "PATIÑO HIGUITA ISABELLA", code: "5705", gradeId: "g1" },
    { name: "PAVA GONZÁLEZ JUAN JOSÉ", code: "5671", gradeId: "g1" },
    { name: "RESTREPO LONDOÑO MARTÍN", code: "5735", gradeId: "g1" },
    { name: "RUANO MUÑOZ JOSÉ FERNANDO", code: "5658", gradeId: "g1" },
    { name: "SALAZAR CASTAÑEDA MATÍAS", code: "5503", gradeId: "g1" },
    { name: "SALAZAR QUINTERO SAMUEL", code: "5604", gradeId: "g1" },
    { name: "SANCHEZ ARBOLEDA ANTONIA", code: "5606", gradeId: "g1" },
    { name: "SERNA TRUJILLO FEDERICO", code: "5514", gradeId: "g1" },
    { name: "TRUJILLO AGUIRRE MARTIN", code: "5623", gradeId: "g1" },
    { name: "URUEÑA CRUZ DANNA ISABELLA", code: "5563", gradeId: "g1" }
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
