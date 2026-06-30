import React, { useEffect, useState } from 'react';
import { 
  User, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Building, 
  Phone, 
  Mail,
  X,
  Award
} from 'lucide-react';
import { Teacher, Department, User as UserType } from '../types';

interface TeachersSectionProps {
  user: UserType | null;
  authToken: string;
}

export default function TeachersSection({ user, authToken }: TeachersSectionProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    departmentId: '',
    status: 'Active' as 'Active' | 'On Leave'
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refreshData = async () => {
    try {
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
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      departmentId: departments[0]?.id || '',
      status: 'Active'
    });
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      name: t.name,
      email: t.email,
      phone: t.phone,
      specialization: t.specialization,
      departmentId: t.departmentId,
      status: t.status
    });
    setError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const url = editingTeacher ? `/api/teachers/${editingTeacher.id}` : '/api/teachers';
    const method = editingTeacher ? 'PUT' : 'POST';

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
        throw new Error(data.error || 'Failed to save teacher profile');
      }

      setSuccess(editingTeacher ? 'Teacher profile updated successfully!' : 'New teacher created successfully!');
      setIsFormOpen(false);
      refreshData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this teacher profile?")) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete teacher');
      }

      setSuccess('Teacher profile and security credentials deleted.');
      refreshData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.email.toLowerCase().includes(search.toLowerCase()) ||
                          t.specialization.toLowerCase().includes(search.toLowerCase()) ||
                          t.employeeNo.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || t.departmentId === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 sm:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-none">Teacher Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage specialist teachers profiles and assignments.</p>
        </div>

        {user?.role === 'ADMIN' && (
          <button
            id="btn-add-teacher"
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Teacher</span>
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

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="search-teachers"
            type="text"
            placeholder="Search by name, specialization, or Employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium bg-slate-50/50"
          />
        </div>

        <div className="flex gap-2">
          <select
            id="filter-teacher-dept"
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

      {/* Teachers Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200/80 p-12 text-center text-slate-400 font-medium rounded-2xl">
            No teacher profiles found matching filters.
          </div>
        ) : (
          filteredTeachers.map(t => {
            const dept = departments.find(d => d.id === t.departmentId);
            return (
              <div key={t.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Card Header Profile */}
                  <div className="flex items-center gap-3.5 mb-5">
                    <div className="h-12 w-12 rounded-full bg-indigo-50 border border-indigo-200/20 text-indigo-600 font-bold flex items-center justify-center text-lg shadow-inner shrink-0">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-slate-900 text-base">{t.name}</h3>
                      <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded uppercase mt-1 inline-block">
                        {t.employeeNo}
                      </span>
                    </div>
                  </div>

                  {/* Specialty Data */}
                  <div className="space-y-3.5 text-xs text-slate-600">
                    <div className="flex gap-2.5 items-start">
                      <Building className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Department</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{dept ? dept.name : 'Unassigned'}</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <Award className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Specialization</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{t.specialization}</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Contact Email</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{t.email}</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Contact Phone</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{t.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    t.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {t.status}
                  </span>

                  {user?.role === 'ADMIN' && (
                    <div className="flex gap-1.5">
                      <button
                        id={`btn-edit-teacher-${t.id}`}
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Edit Profile"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        id={`btn-delete-teacher-${t.id}`}
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Profile"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT TEACHER MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-display font-bold text-lg text-slate-900">
                {editingTeacher ? 'Edit Teacher Profile' : 'Add New Teacher'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Teacher Name</label>
                <input
                  id="form-teacher-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Aarav Sharma"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  id="form-teacher-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. teacher@school.edu"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Specialization</label>
                <input
                  id="form-teacher-spec"
                  type="text"
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g. Artificial Intelligence"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    id="form-teacher-phone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 555-0101"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    id="form-teacher-status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Department</label>
                <select
                  id="form-teacher-dept"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
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
                  id="btn-teacher-submit"
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  {editingTeacher ? 'Save Changes' : 'Register Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
