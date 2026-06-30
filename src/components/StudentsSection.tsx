import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Award, 
  Calendar, 
  BookOpen, 
  Sparkles, 
  Check, 
  X, 
  PlusCircle,
  FileText,
  Loader2,
  Brain
} from 'lucide-react';
import { Student, Department, Course, Enrollment, User as UserType } from '../types';

interface StudentsSectionProps {
  user: UserType | null;
  authToken: string;
}

export default function StudentsSection({ user, authToken }: StudentsSectionProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  
  // Modals / Forms
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    departmentId: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Suspended'
  });

  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollStudentId, setEnrollStudentId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Grades Modal
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [selectedEnrollmentStudentName, setSelectedEnrollmentStudentName] = useState('');
  const [gradeValue, setGradeValue] = useState<'A' | 'B' | 'C' | 'D' | 'F' | 'Pending'>('Pending');

  // AI Advisory Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiReportData, setAiReportData] = useState<any | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      const stuRes = await fetch('/api/students', { headers: { 'Authorization': `Bearer ${authToken}` } });
      const stuData = await stuRes.json();
      setStudents(stuData);

      const deptRes = await fetch('/api/departments', { headers: { 'Authorization': `Bearer ${authToken}` } });
      const deptData = await deptRes.json();
      setDepartments(deptData);

      const courseRes = await fetch('/api/courses', { headers: { 'Authorization': `Bearer ${authToken}` } });
      const courseData = await courseRes.json();
      setCourses(courseData);

      const enrRes = await fetch('/api/enrollments', { headers: { 'Authorization': `Bearer ${authToken}` } });
      const enrData = await enrRes.json();
      setEnrollments(enrData);
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [authToken]);

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      dob: '2005-01-01',
      departmentId: departments[0]?.id || '',
      status: 'Active'
    });
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (stu: Student) => {
    setEditingStudent(stu);
    setFormData({
      name: stu.name,
      email: stu.email,
      phone: stu.phone,
      dob: stu.dob,
      departmentId: stu.departmentId,
      status: stu.status
    });
    setError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
    const method = editingStudent ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save student profile');
      }

      setSuccess(editingStudent ? 'Student profile updated successfully!' : 'New student created successfully!');
      setIsFormOpen(false);
      refreshData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student record? This will also remove their enrollment histories.")) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete student');
      }

      setSuccess('Student record purged successfully.');
      refreshData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Enrollment operations
  const handleOpenEnroll = (studentId: string) => {
    setEnrollStudentId(studentId);
    setSelectedCourseId(courses[0]?.id || '');
    setError(null);
    setIsEnrollModalOpen(true);
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollStudentId || !selectedCourseId) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/courses/${selectedCourseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ studentId: enrollStudentId })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Enrollment transaction failed');
      }

      setSuccess(data.message || 'Student enrolled successfully');
      setIsEnrollModalOpen(false);
      refreshData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Grade Entry
  const handleOpenGradeModal = (enr: Enrollment, studentName: string) => {
    setSelectedEnrollment(enr);
    setSelectedEnrollmentStudentName(studentName);
    setGradeValue(enr.grade);
    setIsGradeModalOpen(true);
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/enrollments/${selectedEnrollment.id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          grade: gradeValue,
          status: gradeValue === 'Pending' ? 'Enrolled' : 'Completed'
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update grade');
      }

      setSuccess('Grade recorded successfully and student GPA updated.');
      setIsGradeModalOpen(false);
      refreshData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // AI advisory generator
  const handleOpenAiAdvisory = async (stu: Student) => {
    setIsGeneratingAi(true);
    setAiAnalysisResult('');
    setIsAiModalOpen(true);
    setError(null);

    try {
      // 1. Fetch complete student performance report
      const repRes = await fetch(`/api/reports/student/${stu.id}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const repData = await repRes.json();
      setAiReportData(repData);

      // 2. Call the backend AI summary proxy
      const aiRes = await fetch('/api/reports/ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          studentName: stu.name,
          gpa: repData.gpa,
          attendanceRate: repData.attendanceRate,
          completedCredits: repData.completedCredits,
          coursesData: repData.enrollments
        })
      });
      const aiData = await aiRes.json();
      setAiAnalysisResult(aiData.summary);
    } catch (err: any) {
      console.error(err);
      setError("Unable to synthesize AI report at this moment.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Filters
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.email.toLowerCase().includes(search.toLowerCase()) ||
                          s.enrollmentNo.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || s.departmentId === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 sm:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-none">Student Registry</h1>
          <p className="text-slate-500 text-sm mt-1">Manage enrollments, grades, and academic tracking.</p>
        </div>

        {user?.role === 'ADMIN' && (
          <button
            id="btn-add-student"
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          {success}
        </div>
      )}

      {/* Filters Area */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="search-students"
            type="text"
            placeholder="Search by name, email or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium bg-slate-50/50"
          />
        </div>

        <div className="flex gap-2">
          <select
            id="filter-dept"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium bg-white"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Grid / List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Student Info</th>
                <th className="py-4 px-6">ID / Enrollment</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Current GPA</th>
                <th className="py-4 px-6">Course Enrollment</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium bg-white">
                    No student records found matching filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {
                  const dept = departments.find(d => d.id === stu.departmentId);
                  const activeEnrs = enrollments.filter(e => e.studentId === stu.id);
                  
                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-200/20 text-indigo-600 font-bold flex items-center justify-center shadow-inner">
                            {stu.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-slate-900 font-semibold">{stu.name}</h4>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">{stu.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">
                        {stu.enrollmentNo}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {dept ? dept.name : 'Unknown'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                          stu.currentGpa >= 3.5 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                            : stu.currentGpa >= 2.5 
                              ? 'bg-sky-50 text-sky-700 border border-sky-200/50' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                        }`}>
                          <Award className="h-3.5 w-3.5 shrink-0" />
                          <span>{stu.currentGpa.toFixed(2)}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1 max-w-[180px]">
                          {activeEnrs.map(enr => {
                            const course = courses.find(c => c.id === enr.courseId);
                            return (
                              <div key={enr.id} className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded border border-slate-200/40 text-xs">
                                <span className="truncate mr-2 text-slate-600 font-semibold">{course?.code || 'CS'}</span>
                                <button
                                  onClick={() => handleOpenGradeModal(enr, stu.name)}
                                  disabled={user?.role === 'STUDENT'}
                                  className={`px-1 rounded font-bold uppercase text-[10px] cursor-pointer ${
                                    enr.grade === 'Pending' 
                                      ? 'bg-amber-100 text-amber-800' 
                                      : 'bg-indigo-100 text-indigo-800'
                                  }`}
                                >
                                  {enr.grade}
                                </button>
                              </div>
                            );
                          })}
                          {user?.role !== 'STUDENT' && (
                            <button
                              id={`btn-enroll-${stu.id}`}
                              onClick={() => handleOpenEnroll(stu.id)}
                              className="text-[11px] text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1 cursor-pointer pt-1"
                            >
                              <PlusCircle className="h-3 w-3" />
                              <span>Enroll in course</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold leading-none ${
                          stu.status === 'Active' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : stu.status === 'Inactive' 
                              ? 'bg-slate-100 text-slate-800' 
                              : 'bg-rose-100 text-rose-800'
                        }`}>
                          {stu.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`btn-ai-${stu.id}`}
                            onClick={() => handleOpenAiAdvisory(stu)}
                            className="bg-slate-900 hover:bg-slate-800 text-slate-100 p-2 rounded-xl border border-slate-800 hover:text-white transition-all shadow-sm flex items-center gap-1 text-xs cursor-pointer"
                            title="Generate AI Academic Advisor Report"
                          >
                            <Brain className="h-4 w-4 text-indigo-400" />
                            <span>Advisory</span>
                          </button>
                          {user?.role === 'ADMIN' && (
                            <>
                              <button
                                id={`btn-edit-${stu.id}`}
                                onClick={() => handleOpenEdit(stu)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
                                title="Edit Record"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                id={`btn-delete-${stu.id}`}
                                onClick={() => handleDelete(stu.id)}
                                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-display font-bold text-lg text-slate-900">
                {editingStudent ? 'Edit Student Profile' : 'Add New Student'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  id="form-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aarav Mehta"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  id="form-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. john@school.edu"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    id="form-phone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 555-0100"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Date of Birth</label>
                  <input
                    id="form-dob"
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Department</label>
                  <select
                    id="form-dept"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    id="form-status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="btn-form-submit"
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  {editingStudent ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COURSE ENROLLMENT MODAL */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-display font-bold text-lg text-slate-900">Enroll Student in Course</h2>
              <button onClick={() => setIsEnrollModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Select Course</label>
                <select
                  id="enroll-course-select"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                >
                  {courses.map(c => {
                    const spacesLeft = c.maxCapacity - c.currentEnrollment;
                    return (
                      <option key={c.id} value={c.id} disabled={spacesLeft <= 0}>
                        {c.code} - {c.name} ({spacesLeft} slots left)
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-slate-400 mt-2">
                  Procedural capacity limits will trigger database errors if maximum enrollment cap is breached.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="btn-enroll-submit"
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRADE ENTRY MODAL */}
      {isGradeModalOpen && selectedEnrollment && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-display font-bold text-lg text-slate-900">Enter Academic Grade</h2>
              <button onClick={() => setIsGradeModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Student</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{selectedEnrollmentStudentName}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Assigned Grade</label>
                <select
                  id="grade-select"
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                >
                  <option value="Pending">Pending Evaluation</option>
                  <option value="A">Grade A (Excellent - 4.0)</option>
                  <option value="B">Grade B (Good - 3.0)</option>
                  <option value="C">Grade C (Satisfactory - 2.0)</option>
                  <option value="D">Grade D (Minimum Pass - 1.0)</option>
                  <option value="F">Grade F (Fail - 0.0)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-2">
                  Submitting will invoke simulated procedure `calculate_student_gpa()`.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGradeModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="btn-grade-submit"
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Submit Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI ADVISORY REPORT MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-400 animate-pulse" />
                <h2 className="font-display font-bold text-lg">Gemini AI Academic Advising Assistant</h2>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {isGeneratingAi ? (
                <div className="py-20 flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  <p className="text-sm font-semibold text-slate-500">Synthesizing school progress charts & generating advisory response...</p>
                </div>
              ) : (
                <>
                  {/* Student Academic Metrics */}
                  {aiReportData && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Student Name</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5 block">{aiReportData.studentName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">GPA Status</span>
                        <span className="text-sm font-bold text-indigo-600 mt-0.5 block">{aiReportData.gpa.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Attendance Rate</span>
                        <span className="text-sm font-bold text-slate-800 mt-0.5 block">{aiReportData.attendanceRate}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Credits Earned</span>
                        <span className="text-sm font-bold text-slate-800 mt-0.5 block">{aiReportData.completedCredits}</span>
                      </div>
                    </div>
                  )}

                  {/* Markdown Response rendering */}
                  <div className="space-y-4">
                    <h3 className="font-display font-semibold text-slate-900 border-b pb-2 text-sm uppercase tracking-wider text-slate-400">Advisory Analysis Report</h3>
                    <div className="prose prose-sm text-slate-600 max-w-none text-xs leading-relaxed space-y-4 whitespace-pre-line bg-indigo-50/20 p-4 rounded-xl border border-indigo-100/30">
                      {aiAnalysisResult}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
