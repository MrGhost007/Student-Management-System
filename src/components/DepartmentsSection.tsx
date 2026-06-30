import React, { useEffect, useState } from 'react';
import { Building, Award, User, BookOpen, Plus, X } from 'lucide-react';
import { Department, Teacher, Course, User as UserType } from '../types';

interface DepartmentsSectionProps {
  user: UserType | null;
  authToken: string;
}

export default function DepartmentsSection({ user, authToken }: DepartmentsSectionProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    headTeacherId: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      const deptRes = await fetch('/api/departments', { headers: { 'Authorization': `Bearer ${authToken}` } });
      const deptData = await deptRes.json();
      setDepartments(deptData);

      const teachRes = await fetch('/api/teachers', { headers: { 'Authorization': `Bearer ${authToken}` } });
      const teachData = await teachRes.json();
      setTeachers(teachData);

      const courseRes = await fetch('/api/courses', { headers: { 'Authorization': `Bearer ${authToken}` } });
      const courseData = await courseRes.json();
      setCourses(courseData);
    } catch (err) {
      console.error("Error refreshing departments data:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [authToken]);

  const handleOpenCreate = () => {
    setFormData({
      code: '',
      name: '',
      headTeacherId: teachers[0]?.id || ''
    });
    setError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create department');
      }

      setSuccess('Academic division created successfully.');
      setIsFormOpen(false);
      refreshData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 sm:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-none">Departments</h1>
          <p className="text-slate-500 text-sm mt-1">Review divisions, heads of study, and curriculum allocations.</p>
        </div>

        {user?.role === 'ADMIN' && (
          <button
            id="btn-add-dept"
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create Department</span>
          </button>
        )}
      </div>

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

      {/* Departments Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const headTeacher = teachers.find(t => t.id === dept.headTeacherId);
          const deptCourses = courses.filter(c => c.departmentId === dept.id);
          
          return (
            <div key={dept.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden">
              {/* Little absolute accent */}
              <div className="absolute top-0 right-0 h-1.5 w-full bg-indigo-600"></div>

              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                  <Building className="h-6 w-6" />
                </div>
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-lg uppercase">
                  {dept.code}
                </span>
              </div>

              <h3 className="font-display font-bold text-lg text-slate-900 mb-2 leading-tight">{dept.name}</h3>
              
              {/* Leader Info */}
              <div className="flex gap-2.5 items-center p-3 rounded-xl bg-slate-50 border border-slate-150/50 text-xs text-slate-600 mb-4 mt-4">
                <User className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase leading-none">Head of Division</p>
                  <p className="font-semibold text-slate-700 mt-1 leading-none">
                    {headTeacher ? headTeacher.name : 'Unassigned / Faculty Head'}
                  </p>
                </div>
              </div>

              {/* Courses list assigned */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">
                  <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                  <span>Assigned Courses ({deptCourses.length})</span>
                </div>

                <div className="space-y-1.5">
                  {deptCourses.length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium italic">No courses currently cataloged.</p>
                  ) : (
                    deptCourses.slice(0, 3).map(c => (
                      <div key={c.id} className="flex justify-between text-xs text-slate-600 font-medium">
                        <span>{c.name}</span>
                        <span className="font-mono text-slate-400">{c.code}</span>
                      </div>
                    ))
                  )}
                  {deptCourses.length > 3 && (
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wide mt-1">
                      + {deptCourses.length - 3} more syllabi
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE DEPARTMENT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-display font-bold text-lg text-slate-900">Create Academic Department</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Div Code</label>
                  <input
                    id="dept-form-code"
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. ME"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Division Name</label>
                  <input
                    id="dept-form-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Mechanical Engineering"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Assigned Head Instructor</label>
                <select
                  id="dept-form-head"
                  value={formData.headTeacherId}
                  onChange={(e) => setFormData({ ...formData, headTeacherId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
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
                  id="btn-dept-submit"
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Confirm Creation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
