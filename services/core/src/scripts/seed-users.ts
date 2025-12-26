import crypto from "crypto";
import { prisma } from "../lib/prisma";

type RoleType = "STUDENT" | "LECTURER";

interface SeedUser {
  fullName: string;
  email: string;
  role: RoleType;
  studentCode?: string;
  cohort?: string;
  major?: string;
  department?: string;
  specialty?: string;
}

const STUDENT_COUNT = 30;
const LECTURER_COUNT = 20;

const surnames = ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Vo", "Dang", "Do", "Bui", "Phan"];
const middles = ["Van", "Thi", "Quang", "Minh", "Anh", "Thanh", "Thu", "Hong"];
const endings = ["An", "Binh", "Chau", "Dung", "Giang", "Hieu", "Khanh", "Lam", "Nam", "Oanh", "Phuong", "Quyen", "Son", "Trang", "Vy"];

const buildName = (index: number) => {
  const s = surnames[index % surnames.length];
  const m = middles[Math.floor(index / surnames.length) % middles.length];
  const e = endings[Math.floor(index / (surnames.length * middles.length)) % endings.length];
  return `${s} ${m} ${e}`;
};

const studentMajors = [
  { code: "CS", cohort: "2022", department: "Computer Science Department" },
  { code: "ICT", cohort: "2023", department: "Information & Communication Technology Department" },
  { code: "DS", cohort: "2024", department: "Data Science Department" },
];

const students: SeedUser[] = Array.from({ length: STUDENT_COUNT }).map((_, idx) => {
  const majorIndex = idx % studentMajors.length;
  const meta = studentMajors[majorIndex];
  if (!meta) {
    throw new Error(`Invalid major index: ${majorIndex}`);
  }
  const studentNumber = (idx + 1).toString().padStart(3, "0");
  return {
    fullName: buildName(idx),
    email: `student${studentNumber}@usth.edu.vn`,
    role: "STUDENT",
    studentCode: `${meta.code}${meta.cohort}${studentNumber}`,
    cohort: meta.cohort,
    major: meta.code,
    department: meta.department,
    specialty: `${meta.code} Program`,
  };
});

const lecturers: SeedUser[] = Array.from({ length: LECTURER_COUNT }).map((_, idx) => {
  const number = (idx + 1).toString().padStart(2, "0");
  return {
    fullName: buildName(idx + STUDENT_COUNT),
    email: `lecturer${number}@usth.edu.vn`,
    role: "LECTURER",
    department: "ICT Department",
    specialty: "Academic Staff",
  };
});

const generatePassword = (length = 12) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let plain = "";
  for (let i = 0; i < length; i++) {
    plain += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const hashed = crypto.createHash("sha256").update(plain).digest("hex");
  return { plain, hashed };
};

async function main() {
  const entries = [...students, ...lecturers];
  const credentials: Array<{ email: string; password: string; role: RoleType }> = [];

  for (const entry of entries) {
    const { plain, hashed } = generatePassword();
    credentials.push({ email: entry.email, password: plain, role: entry.role });

    await prisma.user.upsert({
      where: { email: entry.email },
      update: {
        password: hashed,
        role: entry.role,
        fullName: entry.fullName,
        studentCode: entry.studentCode ?? null,
        cohort: entry.cohort ?? null,
        major: entry.major ?? null,
        department: entry.department ?? null,
        specialty: entry.specialty ?? null,
      },
      create: {
        email: entry.email,
        password: hashed,
        role: entry.role,
        fullName: entry.fullName,
        studentCode: entry.studentCode ?? null,
        cohort: entry.cohort ?? null,
        major: entry.major ?? null,
        department: entry.department ?? null,
        specialty: entry.specialty ?? null,
      },
    });
  }

  console.table(credentials);
}

main()
  .catch((error) => {
    console.error("[seed-users] Failed to seed users", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

