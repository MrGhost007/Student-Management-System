import React, { useEffect, useState } from 'react';
import { Award, Calendar, BookOpen, Brain, Loader2, Sparkles, CheckSquare } from 'lucide-react';
import { AcademicReport, User as UserType } from '../types';

interface AcademicReportSectionProps {
  user: UserType | null;
  authToken: string;
}

export default function AcademicReportSection({ user, authToken }: AcademicReportSectionProps) {
  const [report, setReport] = useState<AcademicReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiReportResult, setAiReportResult] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!user?.referenceId) return;
      try {
        const res = await fetch(`/api/reports/student/${user.referenceId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!res.ok) throw new Error("Could not retrieve report card.");
        const data = await res.json();
        setReport(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [authToken, user]);

  const generateAiAdvisory = async () => {
    if (!report) return;
    setLoadingAi(true);
    setAiReportResult('');

    try {
      const aiRes = await fetch('/api/reports/ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          studentName: report.studentName,
          gpa: report.gpa,
          attendanceRate: report.attendanceRate,
          completedCredits: report.completedCredits,
          coursesData: report.enrollments
        })
      });
      const aiData = await aiRes.json();
      setAiReportResult(aiData.summary);
    } catch (err) {
      console.error(err);
      setError("Unable to synthesize AI advisor analysis.");
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500 font-semibold">Compiling official transcript...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex-1 bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-rose-600 font-semibold text-sm">Error Loading Report Card</p>
          <p className="text-xs text-slate-400 mt-2">{error || "Reference ID is missing on this administrator account."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 sm:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-none">Official Academic Report</h1>
        <p className="text-slate-500 text-sm mt-1">Review finalized grades, compiled GPA, and advisor summaries.</p>
      </div>

      {/* Main Metrics Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Cumulative GPA</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-display font-bold text-slate-950">{report.gpa.toFixed(2)}</span>
            <span className="text-xs font-semibold text-slate-400">/ 4.0</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded mt-2 inline-block">Excellent Standing</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Attendance Percentage</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-display font-bold text-slate-950">{report.attendanceRate}%</span>
          </div>
          <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded mt-2 inline-block">Calculated Presence</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Completed Credits</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-display font-bold text-slate-950">{report.completedCredits}</span>
            <span className="text-xs font-semibold text-slate-400">Credits</span>
          </div>
          <span className="text-[10px] text-sky-600 font-bold bg-sky-50 px-1.5 py-0.5 rounded mt-2 inline-block">Towards Graduation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Course Grades list */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-display font-bold text-slate-800 text-sm">Course Transcript Breakdown</h3>
          </div>
          
          <div className="divide-y divide-slate-100">
            {report.enrollments.map((item) => (
              <div key={item.courseId} className="p-5 flex justify-between items-center hover:bg-slate-50/20 transition-colors">
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                    {item.courseCode}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-900 mt-2">{item.courseName}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{item.credits} Academic Credits</p>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-bold ${
                    item.grade === 'Pending' 
                      ? 'bg-amber-50 text-amber-800 border border-amber-200/50' 
                      : 'bg-indigo-50 text-indigo-800 border border-indigo-200/50'
                  }`}>
                    Grade: {item.grade}
                  </span>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1.5">Attended: {item.attendanceRate}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI report card feedback panel */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-4">
            <Brain className="h-5 w-5 text-indigo-500 animate-pulse" />
            <h3 className="font-display font-bold text-slate-900 text-base">Gemini Advisor Summary</h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Get personalized smart advice on strengths, syllabus recommendations, and custom steps to raise or maintain your cumulative GPA grade standing.
          </p>

          {!aiReportResult && !loadingAi ? (
            <button
              id="btn-generate-student-ai"
              onClick={generateAiAdvisory}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Generate AI Advisory Report</span>
            </button>
          ) : loadingAi ? (
            <div className="p-8 flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <p className="text-xs text-slate-500 font-semibold">Synthesizing advising report...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="prose prose-sm text-slate-600 leading-relaxed text-[11px] whitespace-pre-line bg-indigo-50/20 p-4 rounded-xl border border-indigo-100/30">
                {aiReportResult}
              </div>
              <button
                id="btn-regenerate-student-ai"
                onClick={generateAiAdvisory}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 mt-2 cursor-pointer"
              >
                <span>Re-generate Report</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
