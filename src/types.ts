export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  referenceId?: string;
}

export interface Student {
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

export interface Teacher {
  id: string;
  name: string;
  email: string;
  employeeNo: string;
  phone: string;
  specialization: string;
  departmentId: string;
  status: 'Active' | 'On Leave';
}

export interface Course {
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

export interface Department {
  id: string;
  code: string;
  name: string;
  headTeacherId?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  remarks?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string;
  status: 'Enrolled' | 'Dropped' | 'Completed';
  grade: 'A' | 'B' | 'C' | 'D' | 'F' | 'Pending';
}

export interface AcademicReport {
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  gpa: number;
  completedCredits: number;
  attendanceRate: number;
  enrollments: {
    courseId: string;
    courseName: string;
    courseCode: string;
    credits: number;
    grade: string;
    attendanceRate: number;
  }[];
  aiSummary?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalDepartments: number;
  averageGpa: number;
  attendanceRate: number;
}
