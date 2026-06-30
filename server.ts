import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import crypto from "crypto";

// Type definitions internally
interface DBUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  avatarUrl?: string;
  referenceId?: string; // Link to student or teacher record
}

interface DBStudent {
  id: string;
  name: string;
  email: string;
  enrollmentNo: string;
  phone: string;
  dob: string;
  departmentId: string;
  currentGpa: number;
  status: 'Active' | 'Inactive' | 'Suspended';
}

interface DBTeacher {
  id: string;
  name: string;
  email: string;
  employeeNo: string;
  phone: string;
  specialization: string;
  departmentId: string;
  status: 'Active' | 'On Leave';
}

interface DBCourse {
  id: string;
  code: string;
  name: string;
  description: string;
  departmentId: string;
  teacherId: string;
  credits: number;
  maxCapacity: number;
  currentEnrollment: number;
}

interface DBDepartment {
  id: string;
  code: string;
  name: string;
  headTeacherId?: string;
}

interface DBAttendance {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  remarks?: string;
}

interface DBEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string;
  status: 'Enrolled' | 'Dropped' | 'Completed';
  grade: 'A' | 'B' | 'C' | 'D' | 'F' | 'Pending';
}

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY || "";
let ai: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI:", err);
  }
}

// --- SIMULATED DATABASE ---
const departments: DBDepartment[] = [
  { id: "dept-1", code: "CS", name: "Computer Science" },
  { id: "dept-2", code: "EE", name: "Electrical Engineering" },
  { id: "dept-3", code: "MATH", name: "Mathematics" },
];

const teachers: DBTeacher[] = [
  { id: "teach-1", name: "Dr. Aarav Sharma", email: "teacher@school.edu", employeeNo: "EMP-2020-001", phone: "555-0101", specialization: "Artificial Intelligence", departmentId: "dept-1", status: "Active" },
  { id: "teach-2", name: "Prof. Rajesh Kumar", email: "chen@school.edu", employeeNo: "EMP-2018-024", phone: "555-0102", specialization: "Embedded Systems", departmentId: "dept-2", status: "Active" },
  { id: "teach-3", name: "Dr. Ananya Patel", email: "ross@school.edu", employeeNo: "EMP-2022-015", phone: "555-0103", specialization: "Abstract Algebra", departmentId: "dept-3", status: "Active" },
];

// Set heads of departments
departments[0].headTeacherId = "teach-1";
departments[1].headTeacherId = "teach-2";
departments[2].headTeacherId = "teach-3";

const students: DBStudent[] = [
  { id: "stu-1", name: "Aarav Mehta", email: "student@school.edu", enrollmentNo: "STU-2025-001", phone: "555-0201", dob: "2004-05-14", departmentId: "dept-1", currentGpa: 3.8, status: "Active" },
  { id: "stu-2", name: "Priya Patel", email: "emily@school.edu", enrollmentNo: "STU-2025-002", phone: "555-0202", dob: "2003-11-22", departmentId: "dept-1", currentGpa: 3.4, status: "Active" },
  { id: "stu-3", name: "Devendra Singh", email: "marcus@school.edu", enrollmentNo: "STU-2025-003", phone: "555-0203", dob: "2004-01-10", departmentId: "dept-2", currentGpa: 2.9, status: "Active" },
  { id: "stu-4", name: "Sanjana Iyer", email: "sophia@school.edu", enrollmentNo: "STU-2025-004", phone: "555-0204", dob: "2003-08-30", departmentId: "dept-3", currentGpa: 4.0, status: "Active" },
];

const courses: DBCourse[] = [
  { id: "course-1", code: "CS-101", name: "Introduction to Programming", description: "Fundamentals of computer science and software construction with TypeScript.", departmentId: "dept-1", teacherId: "teach-1", credits: 4, maxCapacity: 30, currentEnrollment: 2 },
  { id: "course-2", code: "CS-202", name: "Database Systems", description: "Relational database concepts, SQL, transactions, and performance tuning.", departmentId: "dept-1", teacherId: "teach-1", credits: 4, maxCapacity: 25, currentEnrollment: 2 },
  { id: "course-3", code: "EE-110", name: "Digital Circuit Design", description: "Introduction to logic gates, semiconductor physics, and circuit analysis.", departmentId: "dept-2", teacherId: "teach-2", credits: 3, maxCapacity: 20, currentEnrollment: 1 },
  { id: "course-4", code: "MATH-301", name: "Advanced Calculus", description: "Rigorous study of limits, derivatives, integrals, and series.", departmentId: "dept-3", teacherId: "teach-3", credits: 4, maxCapacity: 15, currentEnrollment: 1 },
];

const enrollments: DBEnrollment[] = [
  { id: "enr-1", studentId: "stu-1", courseId: "course-1", enrollmentDate: "2026-01-15", status: "Completed", grade: "A" },
  { id: "enr-2", studentId: "stu-1", courseId: "course-2", enrollmentDate: "2026-01-15", status: "Enrolled", grade: "Pending" },
  { id: "enr-3", studentId: "stu-2", courseId: "course-1", enrollmentDate: "2026-01-16", status: "Completed", grade: "B" },
  { id: "enr-4", studentId: "stu-2", courseId: "course-2", enrollmentDate: "2026-01-16", status: "Enrolled", grade: "Pending" },
  { id: "enr-5", studentId: "stu-3", courseId: "course-3", enrollmentDate: "2026-01-17", status: "Enrolled", grade: "Pending" },
  { id: "enr-6", studentId: "stu-4", courseId: "course-4", enrollmentDate: "2026-01-15", status: "Completed", grade: "A" },
];

const attendanceLogs: DBAttendance[] = [
  { id: "att-1", studentId: "stu-1", date: "2026-06-25", status: "Present", remarks: "On time" },
  { id: "att-2", studentId: "stu-1", date: "2026-06-26", status: "Present", remarks: "Active participation" },
  { id: "att-3", studentId: "stu-1", date: "2026-06-29", status: "Absent", remarks: "Doctor appointment" },
  { id: "att-4", studentId: "stu-2", date: "2026-06-25", status: "Present" },
  { id: "att-5", studentId: "stu-2", date: "2026-06-26", status: "Late", remarks: "Traffic delay" },
  { id: "att-6", studentId: "stu-2", date: "2026-06-29", status: "Present" },
  { id: "att-7", studentId: "stu-3", date: "2026-06-29", status: "Present" },
  { id: "att-8", studentId: "stu-4", date: "2026-06-29", status: "Present" },
];

// Helper to hash passwords securely using built-in crypto SHA256
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const users: DBUser[] = [
  { id: "usr-admin", name: "System Administrator", email: "admin@school.edu", passwordHash: hashPassword("admin123"), role: "ADMIN", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" },
  { id: "usr-teacher", name: "Dr. Aarav Sharma", email: "teacher@school.edu", passwordHash: hashPassword("teacher123"), role: "TEACHER", avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop", referenceId: "teach-1" },
  { id: "usr-student", name: "Aarav Mehta", email: "student@school.edu", passwordHash: hashPassword("student123"), role: "STUDENT", avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop", referenceId: "stu-1" },
];

// Simple, secure-by-nature token store
const sessionTokens = new Map<string, DBUser>();

// --- SIMULATED ORACLE PL/SQL PROCEDURES (BUSINESS LOGIC) ---

/**
 * PL/SQL: add_student(p_name, p_email, p_phone, p_dob, p_dept_id, p_password)
 * Handles auto-generating a sequence enrollment number and creating user account.
 */
function add_student_proc(name: string, email: string, phone: string, dob: string, departmentId: string, status: 'Active' | 'Inactive' | 'Suspended' = 'Active'): DBStudent {
  // Check if student email is already registered
  const existing = students.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error("A student with this email already exists");
  }

  const id = "stu-" + (students.length + 1);
  const sequenceNo = String(students.length + 1).padStart(3, "0");
  const enrollmentNo = `STU-2026-${sequenceNo}`;

  const newStudent: DBStudent = {
    id,
    name,
    email,
    enrollmentNo,
    phone: phone || "555-0000",
    dob: dob || "2005-01-01",
    departmentId,
    currentGpa: 0.0,
    status
  };

  students.push(newStudent);

  // Auto-create a Student User account if it doesn't exist
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!existingUser) {
    users.push({
      id: "usr-" + crypto.randomUUID(),
      name,
      email,
      passwordHash: hashPassword("student123"), // default password
      role: "STUDENT",
      referenceId: id
    });
  }

  return newStudent;
}

/**
 * PL/SQL: enroll_student_in_course(p_student_id, p_course_id)
 * Validates course existence, enrollment limits, and prevents double-enrollment.
 */
function enroll_student_in_course_proc(studentId: string, courseId: string): DBEnrollment {
  const student = students.find(s => s.id === studentId);
  const course = courses.find(c => c.id === courseId);

  if (!student) throw new Error("Student not found");
  if (!course) throw new Error("Course not found");

  // Check if already enrolled
  const alreadyEnrolled = enrollments.find(e => e.studentId === studentId && e.courseId === courseId && e.status !== "Dropped");
  if (alreadyEnrolled) {
    throw new Error("Student is already enrolled in this course");
  }

  // Check capacity limit
  if (course.currentEnrollment >= course.maxCapacity) {
    throw new Error(`Course is full. Maximum capacity is ${course.maxCapacity} students.`);
  }

  // Increment current enrollment
  course.currentEnrollment += 1;

  const enrollment: DBEnrollment = {
    id: "enr-" + (enrollments.length + 1),
    studentId,
    courseId,
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: "Enrolled",
    grade: "Pending"
  };

  enrollments.push(enrollment);
  return enrollment;
}

/**
 * PL/SQL: calculate_student_gpa(p_student_id)
 * Calculates and updates student GPA based on completed courses.
 * A = 4.0, B = 3.0, C = 2.0, D = 1.0, F = 0.0
 */
function calculate_student_gpa_proc(studentId: string): number {
  const student = students.find(s => s.id === studentId);
  if (!student) throw new Error("Student not found");

  const completedEnrollments = enrollments.filter(e => e.studentId === studentId && e.status === "Completed" && e.grade !== "Pending");
  
  if (completedEnrollments.length === 0) {
    student.currentGpa = 0.0;
    return 0.0;
  }

  const gradeValues: Record<string, number> = { 'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0 };
  
  let totalGradePoints = 0;
  let totalCredits = 0;

  for (const enr of completedEnrollments) {
    const course = courses.find(c => c.id === enr.courseId);
    if (course) {
      const gradeVal = gradeValues[enr.grade] ?? 0;
      totalGradePoints += (gradeVal * course.credits);
      totalCredits += course.credits;
    }
  }

  const finalGpa = totalCredits > 0 ? parseFloat((totalGradePoints / totalCredits).toFixed(2)) : 0.0;
  student.currentGpa = finalGpa;
  return finalGpa;
}

/**
 * PL/SQL: mark_attendance(p_student_id, p_date, p_status, p_remarks)
 */
function mark_attendance_proc(studentId: string, date: string, status: 'Present' | 'Absent' | 'Late' | 'Excused', remarks?: string): DBAttendance {
  const student = students.find(s => s.id === studentId);
  if (!student) throw new Error("Student not found");

  // Check if attendance already exists for this student on this day
  const existingIndex = attendanceLogs.findIndex(a => a.studentId === studentId && a.date === date);
  
  if (existingIndex !== -1) {
    attendanceLogs[existingIndex].status = status;
    attendanceLogs[existingIndex].remarks = remarks;
    return attendanceLogs[existingIndex];
  } else {
    const newLog: DBAttendance = {
      id: "att-" + (attendanceLogs.length + 1),
      studentId,
      date,
      status,
      remarks
    };
    attendanceLogs.push(newLog);
    return newLog;
  }
}

// --- EXPRESS APPLICATION SETUP ---
const app = express();
app.use(express.json());

// --- MIDDLEWARE FOR TOKEN VERIFICATION ---
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No session token provided." });
  }

  const user = sessionTokens.get(token);
  if (!user) {
    return res.status(403).json({ error: "Session expired or invalid token." });
  }

  req.user = user;
  next();
}

// Extend Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: DBUser;
    }
  }
}

// --- API ENDPOINTS ---

// Authentication API
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Please provide email and password" });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  // Create a session token
  const token = crypto.randomBytes(32).toString("hex");
  sessionTokens.set(token, user);

  // Return user info and token
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      referenceId: user.referenceId
    }
  });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const id = "usr-" + crypto.randomUUID();
  const newUser: DBUser = {
    id,
    name,
    email,
    passwordHash: hashPassword(password),
    role: role as any,
  };

  users.push(newUser);
  res.status(201).json({ message: "Registration successful. You can now login." });
});

app.get("/api/auth/profile", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

app.post("/api/auth/change-password", authenticateToken, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Please provide old and new passwords" });
  }

  const user = users.find(u => u.id === req.user?.id);
  if (!user || user.passwordHash !== hashPassword(oldPassword)) {
    return res.status(400).json({ error: "Incorrect old password" });
  }

  user.passwordHash = hashPassword(newPassword);
  res.json({ message: "Password updated successfully" });
});

// --- STUDENTS ENDPOINTS ---
app.get("/api/students", authenticateToken, (req, res) => {
  res.json(students);
});

app.get("/api/students/:id", authenticateToken, (req, res) => {
  const student = students.find(s => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student);
});

app.post("/api/students", authenticateToken, (req, res) => {
  const { name, email, phone, dob, departmentId, status } = req.body;
  try {
    const newStudent = add_student_proc(name, email, phone, dob, departmentId, status);
    res.status(201).json(newStudent);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/students/:id", authenticateToken, (req, res) => {
  const student = students.find(s => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });

  const { name, email, phone, dob, departmentId, status } = req.body;
  
  if (name) student.name = name;
  if (email) student.email = email;
  if (phone) student.phone = phone;
  if (dob) student.dob = dob;
  if (departmentId) student.departmentId = departmentId;
  if (status) student.status = status;

  // Recalculate GPA just in case
  calculate_student_gpa_proc(student.id);

  res.json(student);
});

app.delete("/api/students/:id", authenticateToken, (req, res) => {
  const index = students.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Student not found" });

  const student = students[index];
  students.splice(index, 1);

  // Remove corresponding user
  const userIndex = users.findIndex(u => u.email.toLowerCase() === student.email.toLowerCase() || u.referenceId === student.id);
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
  }

  // Remove enrollments
  const filteredEnrollments = enrollments.filter(e => e.studentId !== student.id);
  enrollments.length = 0;
  enrollments.push(...filteredEnrollments);

  res.json({ message: "Student record deleted successfully" });
});


// --- TEACHERS ENDPOINTS ---
app.get("/api/teachers", authenticateToken, (req, res) => {
  res.json(teachers);
});

app.post("/api/teachers", authenticateToken, (req, res) => {
  const { name, email, phone, specialization, departmentId, status } = req.body;
  
  const existing = teachers.find(t => t.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Teacher with this email already exists" });
  }

  const id = "teach-" + (teachers.length + 1);
  const employeeNo = `EMP-2026-${String(teachers.length + 1).padStart(3, "0")}`;

  const newTeacher: DBTeacher = {
    id,
    name,
    email,
    employeeNo,
    phone: phone || "555-0000",
    specialization: specialization || "Core Academics",
    departmentId,
    status: status || "Active"
  };

  teachers.push(newTeacher);

  // Create user
  users.push({
    id: "usr-" + crypto.randomUUID(),
    name,
    email,
    passwordHash: hashPassword("teacher123"),
    role: "TEACHER",
    referenceId: id
  });

  res.status(201).json(newTeacher);
});

app.put("/api/teachers/:id", authenticateToken, (req, res) => {
  const teacher = teachers.find(t => t.id === req.params.id);
  if (!teacher) return res.status(404).json({ error: "Teacher not found" });

  const { name, email, phone, specialization, departmentId, status } = req.body;
  if (name) teacher.name = name;
  if (email) teacher.email = email;
  if (phone) teacher.phone = phone;
  if (specialization) teacher.specialization = specialization;
  if (departmentId) teacher.departmentId = departmentId;
  if (status) teacher.status = status;

  res.json(teacher);
});

app.delete("/api/teachers/:id", authenticateToken, (req, res) => {
  const index = teachers.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Teacher not found" });

  const teacher = teachers[index];
  teachers.splice(index, 1);

  // Remove corresponding user
  const userIndex = users.findIndex(u => u.email.toLowerCase() === teacher.email.toLowerCase() || u.referenceId === teacher.id);
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
  }

  res.json({ message: "Teacher record deleted successfully" });
});


// --- COURSES ENDPOINTS ---
app.get("/api/courses", authenticateToken, (req, res) => {
  res.json(courses);
});

app.post("/api/courses", authenticateToken, (req, res) => {
  const { code, name, description, departmentId, teacherId, credits, maxCapacity } = req.body;
  
  const id = "course-" + (courses.length + 1);
  const newCourse: DBCourse = {
    id,
    code,
    name,
    description: description || "",
    departmentId,
    teacherId,
    credits: Number(credits) || 3,
    maxCapacity: Number(maxCapacity) || 30,
    currentEnrollment: 0
  };

  courses.push(newCourse);
  res.status(201).json(newCourse);
});

app.put("/api/courses/:id", authenticateToken, (req, res) => {
  const course = courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });

  const { code, name, description, departmentId, teacherId, credits, maxCapacity } = req.body;
  if (code) course.code = code;
  if (name) course.name = name;
  if (description) course.description = description;
  if (departmentId) course.departmentId = departmentId;
  if (teacherId) course.teacherId = teacherId;
  if (credits) course.credits = Number(credits);
  if (maxCapacity) course.maxCapacity = Number(maxCapacity);

  res.json(course);
});

app.delete("/api/courses/:id", authenticateToken, (req, res) => {
  const index = courses.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Course not found" });

  courses.splice(index, 1);
  res.json({ message: "Course deleted successfully" });
});

// Course Enrollment API
app.post("/api/courses/:id/enroll", authenticateToken, (req, res) => {
  const courseId = req.params.id;
  const { studentId } = req.body;

  try {
    const enrollment = enroll_student_in_course_proc(studentId, courseId);
    res.status(201).json({ message: "Student enrolled successfully", enrollment });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});


// --- DEPARTMENTS ENDPOINTS ---
app.get("/api/departments", authenticateToken, (req, res) => {
  res.json(departments);
});

app.post("/api/departments", authenticateToken, (req, res) => {
  const { code, name, headTeacherId } = req.body;
  const id = "dept-" + (departments.length + 1);
  const newDept: DBDepartment = {
    id,
    code,
    name,
    headTeacherId
  };
  departments.push(newDept);
  res.status(201).json(newDept);
});

app.put("/api/departments/:id", authenticateToken, (req, res) => {
  const dept = departments.find(d => d.id === req.params.id);
  if (!dept) return res.status(404).json({ error: "Department not found" });

  const { code, name, headTeacherId } = req.body;
  if (code) dept.code = code;
  if (name) dept.name = name;
  if (headTeacherId) dept.headTeacherId = headTeacherId;

  res.json(dept);
});


// --- ATTENDANCE ENDPOINTS ---
app.get("/api/attendance", authenticateToken, (req, res) => {
  res.json(attendanceLogs);
});

app.post("/api/attendance/mark", authenticateToken, (req, res) => {
  const { studentId, date, status, remarks } = req.body;
  if (!studentId || !date || !status) {
    return res.status(400).json({ error: "Student ID, Date and Status are required" });
  }

  try {
    const log = mark_attendance_proc(studentId, date, status, remarks);
    res.json(log);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- GRADES ENDPOINTS ---
app.get("/api/enrollments", authenticateToken, (req, res) => {
  res.json(enrollments);
});

app.put("/api/enrollments/:id/grade", authenticateToken, (req, res) => {
  const { grade, status } = req.body;
  const enrollment = enrollments.find(e => e.id === req.params.id);
  if (!enrollment) return res.status(404).json({ error: "Enrollment record not found" });

  if (grade) enrollment.grade = grade;
  if (status) enrollment.status = status;

  // Automatically recalculate GPA for student
  calculate_student_gpa_proc(enrollment.studentId);

  res.json(enrollment);
});


// --- REPORTS & DASHBOARD ENDPOINTS ---

// Dashboard Metrics
app.get("/api/reports/dashboard", authenticateToken, (req, res) => {
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalCourses = courses.length;
  const totalDepartments = departments.length;
  
  const gpaSum = students.reduce((sum, s) => sum + s.currentGpa, 0);
  const averageGpa = totalStudents > 0 ? parseFloat((gpaSum / totalStudents).toFixed(2)) : 0.0;

  const totalAttLogs = attendanceLogs.length;
  const presentLogs = attendanceLogs.filter(l => l.status === "Present" || l.status === "Late").length;
  const attendanceRate = totalAttLogs > 0 ? Math.round((presentLogs / totalAttLogs) * 100) : 100;

  res.json({
    totalStudents,
    totalTeachers,
    totalCourses,
    totalDepartments,
    averageGpa,
    attendanceRate
  });
});

// Student Academic Profile Report
app.get("/api/reports/student/:studentId", authenticateToken, (req, res) => {
  const studentId = req.params.studentId;
  const student = students.find(s => s.id === studentId);
  if (!student) return res.status(404).json({ error: "Student not found" });

  // Recalculate GPA to make sure it is updated
  const currentGpa = calculate_student_gpa_proc(studentId);

  // Get enrollments
  const studentEnrollments = enrollments.filter(e => e.studentId === studentId);
  
  // Completed Credits
  let completedCredits = 0;
  const coursesReport = studentEnrollments.map(enr => {
    const course = courses.find(c => c.id === enr.courseId);
    if (enr.status === "Completed" && enr.grade !== "Pending" && enr.grade !== "F") {
      completedCredits += (course?.credits || 0);
    }

    // Individual course attendance
    const courseAttLogs = attendanceLogs.filter(a => a.studentId === studentId); // simple mock: course overall
    const totalDays = courseAttLogs.length;
    const daysAttended = courseAttLogs.filter(a => a.status === "Present" || a.status === "Late").length;
    const attRate = totalDays > 0 ? Math.round((daysAttended / totalDays) * 100) : 100;

    return {
      courseId: enr.courseId,
      courseName: course?.name || "Unknown Course",
      courseCode: course?.code || "UNK",
      credits: course?.credits || 0,
      grade: enr.grade,
      attendanceRate: attRate
    };
  });

  // Total Attendance Rate
  const studentAttLogs = attendanceLogs.filter(a => a.studentId === studentId);
  const totalDays = studentAttLogs.length;
  const daysAttended = studentAttLogs.filter(a => a.status === "Present" || a.status === "Late").length;
  const totalAttendanceRate = totalDays > 0 ? Math.round((daysAttended / totalDays) * 100) : 100;

  res.json({
    studentId,
    studentName: student.name,
    enrollmentNo: student.enrollmentNo,
    gpa: currentGpa,
    completedCredits,
    attendanceRate: totalAttendanceRate,
    enrollments: coursesReport
  });
});

// AI Analyze Endpoint using Google GenAI SDK and gemini-3.5-flash
app.post("/api/reports/ai-analyze", authenticateToken, async (req, res) => {
  const { studentName, gpa, attendanceRate, completedCredits, coursesData } = req.body;

  if (!ai) {
    return res.json({
      summary: `**Direct Advisory Analysis for ${studentName}:**\n\n${studentName} is demonstrating strong academic commitment with a current cumulative GPA of **${gpa}** and a reliable attendance standing of **${attendanceRate}%**. They have successfully completed **${completedCredits}** academic credits to date.\n\n*Strengths & Focus*: Continuous engagement and prompt attendance have been key contributors to their steady progression. To raise or maintain this performance, further exploration of advanced electives and tutoring partnerships in their specialized department is highly recommended. (Note: Set a valid GEMINI_API_KEY in secrets to unlock dynamic, AI-generated custom reports).`
    });
  }

  try {
    const prompt = `You are a professional academic advisor at school. Analyze this student's progress and write a comprehensive analysis.
    
    Student Name: ${studentName}
    Current GPA: ${gpa} (out of 4.0)
    Attendance Rate: ${attendanceRate}%
    Completed Credits: ${completedCredits}
    Current/Past Courses & Grades: ${JSON.stringify(coursesData)}
    
    Please provide:
    1. A professional, detailed summary (2-3 paragraphs) assessing their performance.
    2. Strengths highlighted.
    3. Specific advice or steps to improve or maintain their GPA.
    Ensure the advice matches their exact performance levels. Use professional, constructive, and supportive language. Return the response as clear markdown text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert academic advisor system built to help teachers and students understand learning outcomes and set path-to-excellence actions.",
        temperature: 0.7,
      }
    });

    res.json({ summary: response.text });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.json({
      summary: `**Direct Advisory Analysis for ${studentName}:**\n\n${studentName} shows steady performance with a GPA of **${gpa}** and an attendance rating of **${attendanceRate}%**. They have successfully earned **${completedCredits}** credits. Advise them to maintain active communication with course instructors. (AI service temporarily experienced an error, but their academic indicators show great potential).`
    });
  }
});


// --- INITIALIZE VITE DEV SERVER OR STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
