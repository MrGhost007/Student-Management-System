import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  Building, 
  TrendingUp, 
  Calendar, 
  Award, 
  Activity,
  ArrowUpRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { DashboardStats, User as UserType } from '../types';

interface DashboardOverviewProps {
  user: UserType | null;
  authToken: string;
  setTab: (tab: string) => void;
}

export default function DashboardOverview({ user, authToken, setTab }: DashboardOverviewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [studentPerformance, setStudentPerformance] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch overall stats
        const statsRes = await fetch('/api/reports/dashboard', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const statsData = await statsRes.json();
        setStats(statsData);

        // If logged in student, fetch their detailed card
        if (user?.role === 'STUDENT' && user.referenceId) {
          const profileRes = await fetch(`/api/reports/student/${user.referenceId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          const profileData = await profileRes.json();
          setStudentPerformance(profileData);
        }

        // Mock recent transaction logs to show business transparency
        setRecentLogs([
          { id: 1, type: 'STUDENT', title: 'New Student registered', desc: 'Aarav Mehta enrolled to Computer Science', time: '10 mins ago' },
          { id: 2, type: 'ATTENDANCE', title: 'Daily attendance compiled', desc: 'Present: 94%, Absent: 6%', time: '1 hour ago' },
          { id: 3, type: 'COURSE', title: 'New Course created', desc: 'Advanced Calculus assigned to Dr. Ananya Patel', time: '4 hours ago' },
          { id: 4, type: 'GRADE', title: 'PL/SQL Grade sequence updated', desc: 'Student Priya Patel received B in CS-101', time: 'Yesterday' }
        ]);

      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [authToken, user]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Compiling system diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 sm:p-8">
      {/* Upper Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-none">
            Welcome Back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {user?.role === 'STUDENT' ? 'Here is a summary of your academic progress.' : 'Here is a summary of active school processes today.'}
          </p>
        </div>
      </div>

      {/* Main Statistics Grid - Only shown to Admin and Teacher */}
      {user?.role !== 'STUDENT' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stat 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-indigo-50 p-3.5 rounded-xl text-indigo-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">Total Students</p>
            <h3 className="text-3xl font-display font-bold text-slate-900 mt-1.5">{stats?.totalStudents}</h3>
            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded mt-1 inline-block">Sequence: Active</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-emerald-50 p-3.5 rounded-xl text-emerald-600">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">Total Teachers</p>
            <h3 className="text-3xl font-display font-bold text-slate-900 mt-1.5">{stats?.totalTeachers}</h3>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">Active Rosters</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-sky-50 p-3.5 rounded-xl text-sky-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">Active Courses</p>
            <h3 className="text-3xl font-display font-bold text-slate-900 mt-1.5">{stats?.totalCourses}</h3>
            <span className="text-[10px] text-sky-600 font-bold bg-sky-50 px-1.5 py-0.5 rounded mt-1 inline-block">Capacity Checked</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-amber-50 p-3.5 rounded-xl text-amber-600">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">Departments</p>
            <h3 className="text-3xl font-display font-bold text-slate-900 mt-1.5">{stats?.totalDepartments}</h3>
            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">School Divisions</span>
          </div>
        </div>
      </div>
    )}

      {/* Role-Specific Secondary Cards */}
      {user?.role === 'STUDENT' && studentPerformance && (
        <div className="mb-8 p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-500/15 shadow-xl shadow-slate-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Academic Performance Summary</span>
            </div>
            <h2 className="text-2xl font-display font-bold tracking-tight">Your Real-time Report Card Status</h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Computed directly via our system's simulated PL/SQL stored function `calculate_student_gpa()`. Keep track of your GPA and overall attendance instantly.
            </p>
          </div>

          <div className="flex gap-4 sm:gap-8 self-stretch md:self-auto bg-slate-950/40 p-4 rounded-xl border border-white/5">
            <div className="text-center min-w-[80px]">
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Cumulative GPA</span>
              <span className="text-4xl font-display font-bold text-white mt-1 block">{studentPerformance.gpa}</span>
              <span className="text-[10px] text-emerald-400 font-bold mt-1 inline-block bg-emerald-500/10 px-1.5 py-0.5 rounded">4.0 Scale</span>
            </div>
            <div className="w-[1px] bg-white/10 self-stretch"></div>
            <div className="text-center min-w-[80px]">
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Attendance</span>
              <span className="text-4xl font-display font-bold text-white mt-1 block">{studentPerformance.attendanceRate}%</span>
              <span className="text-[10px] text-indigo-400 font-bold mt-1 inline-block bg-indigo-500/10 px-1.5 py-0.5 rounded">Present / Late</span>
            </div>
            <div className="w-[1px] bg-white/10 self-stretch"></div>
            <div className="text-center min-w-[80px]">
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Credits Earned</span>
              <span className="text-4xl font-display font-bold text-white mt-1 block">{studentPerformance.completedCredits}</span>
              <span className="text-[10px] text-sky-400 font-bold mt-1 inline-block bg-sky-500/10 px-1.5 py-0.5 rounded">Fully Completed</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Split Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Performance Metrics & Graphical Status */}
        <div className={`${(user?.role === 'ADMIN' || user?.role === 'STUDENT') ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-6`}>
          {user?.role !== 'STUDENT' ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-950">Campus Performance Trends</h3>
                  <p className="text-xs text-slate-400">Aggregated metric evaluation and benchmarks</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Computed Live</span>
                </div>
              </div>

              {/* Simulated bar chart of Average GPA per Department */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span>Computer Science Department</span>
                    <span>Avg. GPA: 3.60 / 4.0</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span>Mathematics Department</span>
                    <span>Avg. GPA: 4.00 / 4.0</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span>Electrical Engineering Department</span>
                    <span>Avg. GPA: 2.90 / 4.0</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '72.5%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Cumulative GPA</span>
                  <span className="text-2xl font-display font-bold text-slate-900 mt-1 block">{stats?.averageGpa}</span>
                  <p className="text-xs text-slate-500 mt-1">Calculated from total student transcripts</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Compilation Rate</span>
                  <span className="text-2xl font-display font-bold text-slate-900 mt-1 block">{stats?.attendanceRate}%</span>
                  <p className="text-xs text-slate-500 mt-1">Average presence over registered semesters</p>
                </div>
              </div>
            </div>
          ) : (
            studentPerformance && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="mb-4">
                  <h3 className="font-display font-bold text-lg text-slate-950">Your Registered Courses</h3>
                  <p className="text-xs text-slate-400">Current academic enrollment status and progress details</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Course</th>
                        <th className="pb-3 font-semibold text-center">Credits</th>
                        <th className="pb-3 font-semibold text-center">Grade</th>
                        <th className="pb-3 font-semibold text-right">Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentPerformance.enrollments?.map((enr: any) => (
                        <tr key={enr.courseId} className="group hover:bg-slate-50/50">
                          <td className="py-3.5 pr-3">
                            <div className="font-semibold text-slate-800">{enr.courseName}</div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">{enr.courseCode}</div>
                          </td>
                          <td className="py-3.5 text-center text-slate-600 font-medium">{enr.credits}</td>
                          <td className="py-3.5 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                              enr.grade === 'A' ? 'bg-emerald-50 text-emerald-700' :
                              enr.grade === 'B' ? 'bg-indigo-50 text-indigo-700' :
                              enr.grade === 'C' ? 'bg-sky-50 text-sky-700' :
                              enr.grade === 'Pending' ? 'bg-amber-50 text-amber-700' :
                              'bg-rose-50 text-rose-700'
                            }`}>
                              {enr.grade}
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-semibold text-slate-700">
                            {enr.attendanceRate}%
                          </td>
                        </tr>
                      ))}
                      {(!studentPerformance.enrollments || studentPerformance.enrollments.length === 0) && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                            No registered courses found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* Quick Access Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="font-display font-bold text-lg text-slate-950 mb-4">Quick Workflows</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user?.role === 'ADMIN' && (
                <>
                  <button
                    onClick={() => setTab('students')}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/10 text-left transition-all group"
                  >
                    <h4 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">Manage Students</h4>
                    <p className="text-xs text-slate-400 mt-1">Register new student records, assign departments, delete, edit.</p>
                  </button>
                  <button
                    onClick={() => setTab('attendance')}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/10 text-left transition-all group"
                  >
                    <h4 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">Mark Attendance Logs</h4>
                    <p className="text-xs text-slate-400 mt-1">Submit daily presence checklist with special remarks.</p>
                  </button>
                </>
              )}
              {user?.role === 'TEACHER' && (
                <>
                  <button
                    onClick={() => setTab('students')}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/10 text-left transition-all group"
                  >
                    <h4 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">View Class Transcripts</h4>
                    <p className="text-xs text-slate-400 mt-1">Access students profile and grade term papers.</p>
                  </button>
                  <button
                    onClick={() => setTab('attendance')}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/10 text-left transition-all group"
                  >
                    <h4 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">Record Daily Presence</h4>
                    <p className="text-xs text-slate-400 mt-1">Mark attendance for students in active courses.</p>
                  </button>
                </>
              )}
              {user?.role === 'STUDENT' && (
                <>
                  <button
                    onClick={() => setTab('courses')}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/10 text-left transition-all group"
                  >
                    <h4 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">View Registered Courses</h4>
                    <p className="text-xs text-slate-400 mt-1">Check class capacity limits, schedule details and teachers.</p>
                  </button>
                  <button
                    onClick={() => setTab('report')}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/10 text-left transition-all group"
                  >
                    <h4 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">Academic Advisory Report</h4>
                    <p className="text-xs text-slate-400 mt-1">Request Gemini AI-backed progress analysis card.</p>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Active Operations Logging */}
        {user?.role !== 'ADMIN' && user?.role !== 'STUDENT' && (
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Activity className="h-4 w-4" />
                  </div>
                  <h3 className="font-display font-bold text-slate-950 text-base">Procedural Live Log</h3>
                </div>

                <div className="space-y-5">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="flex gap-3.5 items-start">
                      <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shrink-0"></div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight">{log.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{log.desc}</p>
                        <span className="text-[10px] text-indigo-500 font-semibold bg-indigo-50 px-1.5 py-0.25 rounded block w-fit mt-1">{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="p-4 rounded-xl bg-indigo-600 text-white flex items-center justify-between shadow-lg shadow-indigo-600/10">
                  <div>
                    <h4 className="text-xs font-bold opacity-80 uppercase tracking-wider">System Security</h4>
                    <p className="text-sm font-semibold mt-0.5">SHA-256 Enabled</p>
                  </div>
                  <div className="bg-white/10 p-2 rounded-lg">
                    <span className="text-[10px] font-mono">OK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
