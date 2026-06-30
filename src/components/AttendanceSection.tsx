import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Search, 
  Check, 
  X, 
  AlertCircle, 
  UserCheck,
  ClipboardList,
  Save
} from 'lucide-react';
import { Student, Attendance, User as UserType } from '../types';

interface AttendanceSectionProps {
  user: UserType | null;
  authToken: string;
}

export default function AttendanceSection({ user, authToken }: AttendanceSectionProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [search, setSearch] = useState('');
  const [remarksState, setRemarksState] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      const stuRes = await fetch('/api/students', { headers: { 'Authorization': `Bearer ${authToken}` } });
      const stuData = await stuRes.json();
      setStudents(stuData);

      const attRes = await fetch('/api/attendance', { headers: { 'Authorization': `Bearer ${authToken}` } });
      const attData = await attRes.json();
      setAttendance(attData);
    } catch (err) {
      console.error("Error loading attendance data:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [authToken]);

  const handleMarkStatus = async (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    setError(null);
    setSuccess(null);
    const remarks = remarksState[studentId] || "";

    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          studentId,
          date: selectedDate,
          status,
          remarks
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to record attendance');
      }

      // Refresh in-memory logs
      refreshData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveRemarks = (studentId: string, value: string) => {
    setRemarksState({
      ...remarksState,
      [studentId]: value
    });
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.enrollmentNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 sm:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-none">Attendance Manager</h1>
          <p className="text-slate-500 text-sm mt-1">Mark, view, and compile student attendance registries daily.</p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 p-2.5 rounded-xl shadow-sm">
          <Calendar className="h-4.5 w-4.5 text-indigo-500" />
          <input
            id="attendance-date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer bg-transparent"
          />
        </div>
      </div>

      {/* Info Warning */}
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

      {/* Roster Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="search-attendance-students"
            type="text"
            placeholder="Search roster by student name or roll ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium bg-slate-50/50"
          />
        </div>
      </div>

      {/* Attendance Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-indigo-600" />
            <h3 className="font-display font-bold text-slate-800 text-sm">Class Roster Presence Checklist</h3>
          </div>
          <span className="text-xs text-slate-400 font-bold uppercase">
            Date: {selectedDate}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-150 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-6">Student Roster</th>
                <th className="py-3 px-6">ID Number</th>
                <th className="py-3 px-6">Daily Status Tracker</th>
                <th className="py-3 px-6">Custom Remarks / Log Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400">
                    No active students assigned to the registry.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {
                  // Find current attendance log for selected date
                  const currentLog = attendance.find(a => a.studentId === stu.id && a.date === selectedDate);
                  const activeStatus = currentLog ? currentLog.status : null;
                  
                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center">
                            {stu.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{stu.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{stu.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-500">
                        {stu.enrollmentNo}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-1.5">
                          {/* Present */}
                          <button
                            id={`btn-att-present-${stu.id}`}
                            onClick={() => handleMarkStatus(stu.id, 'Present')}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                              activeStatus === 'Present'
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm shadow-emerald-100'
                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            Present
                          </button>

                          {/* Absent */}
                          <button
                            id={`btn-att-absent-${stu.id}`}
                            onClick={() => handleMarkStatus(stu.id, 'Absent')}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                              activeStatus === 'Absent'
                                ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-sm shadow-rose-100'
                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            Absent
                          </button>

                          {/* Late */}
                          <button
                            id={`btn-att-late-${stu.id}`}
                            onClick={() => handleMarkStatus(stu.id, 'Late')}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                              activeStatus === 'Late'
                                ? 'bg-amber-50 border-amber-400 text-amber-700 shadow-sm shadow-amber-100'
                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            Late
                          </button>

                          {/* Excused */}
                          <button
                            id={`btn-att-excused-${stu.id}`}
                            onClick={() => handleMarkStatus(stu.id, 'Excused')}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                              activeStatus === 'Excused'
                                ? 'bg-sky-50 border-sky-400 text-sky-700 shadow-sm shadow-sky-100'
                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2 max-w-xs">
                          <input
                            id={`input-remark-${stu.id}`}
                            type="text"
                            placeholder={currentLog?.remarks || "Add remarks..."}
                            value={remarksState[stu.id] ?? ""}
                            onChange={(e) => handleSaveRemarks(stu.id, e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-700 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          />
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
    </div>
  );
}
