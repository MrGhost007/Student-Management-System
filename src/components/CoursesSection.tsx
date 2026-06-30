import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  User, 
  Award, 
  Users,
  X 
} from 'lucide-react';
import { Course, Teacher, Department, User as UserType } from '../types';

interface CoursesSectionProps {
  user: UserType | null;
  authToken: string;
}

export default function CoursesSection({ user, authToken }: CoursesSectionProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    departmentId: '',
    teacherId: '',
    credits: 3,
    maxCapacity: 30
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      const courseRes = await fetch('/api/courses', { headers: { 'Authorization': `Bearer ${authToken}` } });
      const courseData = await courseRes.json();
      setCourses(courseData);

      const teachRes = await fetch('/api/teachers', { headers: { 'Authorization': `Bearer ${authToken}` } });
      const teachData = await teachRes.json();
      setTeachers(teachData);

      const deptRes = await fetch('/api/departments', { headers: { 'Authorization': `Bearer ${authToken}` } });
      const deptData = await deptRes.json();
      setDepartments(deptData);
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [authToken]);

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      departmentId: departments[0]?.id || '',
      teacherId: teachers[0]?.id || '',
      credits: 3,
      maxCapacity: 30
    });
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c: Course) => {
    setEditingCourse(c);
    setFormData({
      code: c.code,
      name: c.name,
      description: c.description,
      departmentId: c.departmentId,
      teacherId: c.teacherId,
      credits: c.credits,
      maxCapacity: c.maxCapacity
    });
    setError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const url = editingCourse ? `/api/courses/${editingCourse.id}` : '/api/courses';
    const method = editingCourse ? 'PUT' : 'POST';

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
        throw new Error(data.error || 'Failed to save course');
      }

      setSuccess(editingCourse ? 'Course updated successfully!' : 'New course created and assigned!');
      setIsFormOpen(false);
      refreshData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course? All grades and active enrollments will be lost.")) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete course');
      }

      setSuccess('Course deleted successfully.');
      refreshData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.code.toLowerCase().includes(search.toLowerCase()) ||
                          c.description.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || c.departmentId === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 sm:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-none">Academic Courses</h1>
          <p className="text-slate-500 text-sm mt-1">Review, create, and allocate active syllabus topics.</p>
        </div>

        {user?.role === 'ADMIN' && (
          <button
            id="btn-add-course"
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create Course</span>
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

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="search-courses"
            type="text"
            placeholder="Search by code, title or syllabus info..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium bg-slate-50/50"
          />
        </div>

        <div className="flex gap-2">
          <select
            id="filter-course-dept"
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

      {/* Course List Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200/80 p-12 text-center text-slate-400 font-medium rounded-2xl">
            No active courses found matching your criteria.
          </div>
        ) : (
          filteredCourses.map(c => {
            const dept = departments.find(d => d.id === c.departmentId);
            const teacher = teachers.find(t => t.id === c.teacherId);
            const slotsFilledPercent = Math.min(Math.round((c.currentEnrollment / c.maxCapacity) * 100), 100);
            
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                        {c.code}
                      </span>
                      <h3 className="font-display font-semibold text-slate-900 text-base mt-2.5">{c.name}</h3>
                    </div>
                    <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-xl text-xs font-bold">
                      <Award className="h-3.5 w-3.5 text-indigo-500" />
                      <span>{c.credits} Credits</span>
                    </span>
                  </div>

                  <p className="text-slate-500 text-xs leading-relaxed mb-6 line-clamp-2">
                    {c.description || 'No detailed syllabus summary has been specified for this semester.'}
                  </p>

                  {/* Core Meta Details */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2.5 text-xs">
                      <User className="h-4 w-4 text-slate-400" />
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Instructor</span>
                        <span className="font-semibold text-slate-700 mt-0.5 block">
                          {teacher ? teacher.name : 'TBD / Staff Assigned'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs">
                      <BookOpen className="h-4 w-4 text-slate-400" />
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Division</span>
                        <span className="font-semibold text-slate-700 mt-0.5 block">
                          {dept ? dept.name : 'General Studies'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capacity Monitor */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                      <Users className="h-3.5 w-3.5" />
                      <span>Enrolled Capacity</span>
                    </div>
                    <span className={`font-semibold ${slotsFilledPercent >= 90 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {c.currentEnrollment} / {c.maxCapacity} slots
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        slotsFilledPercent >= 90 
                          ? 'bg-rose-500' 
                          : slotsFilledPercent >= 75 
                            ? 'bg-amber-500' 
                            : 'bg-indigo-600'
                      }`} 
                      style={{ width: `${slotsFilledPercent}%` }}
                    ></div>
                  </div>

                  {/* Admin controls */}
                  {user?.role === 'ADMIN' && (
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/40 mt-1">
                      <button
                        id={`btn-edit-course-${c.id}`}
                        onClick={() => handleOpenEdit(c)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-all cursor-pointer"
                        title="Edit Course"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        id={`btn-delete-course-${c.id}`}
                        onClick={() => handleDelete(c.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                        title="Delete Course"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT COURSE FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-display font-bold text-lg text-slate-900">
                {editingCourse ? 'Edit Course Syllabus' : 'Create Academic Course'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Course Code</label>
                  <input
                    id="form-course-code"
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="CS-101"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Course Name</label>
                  <input
                    id="form-course-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Data Science Intro"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Syllabus Description</label>
                <textarea
                  id="form-course-desc"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summarize course goals, core libraries and grading rubrics..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Credits Allocation</label>
                  <input
                    id="form-course-credits"
                    type="number"
                    required
                    min={1}
                    max={6}
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Class Enrollment Cap</label>
                  <input
                    id="form-course-capacity"
                    type="number"
                    required
                    min={5}
                    max={100}
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Department</label>
                  <select
                    id="form-course-dept"
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Assigned Teacher</label>
                  <select
                    id="form-course-teacher"
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
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
                  id="btn-course-submit"
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  {editingCourse ? 'Save Changes' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
