import React, { useState } from 'react';
import { GraduationCap, Shield, User, Users, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Something went wrong during sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6" style={{
      backgroundImage: "radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 40%)"
    }}>
      <div className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-200">
        
        {/* Left Side: Dark Info Panel */}
        <div className="md:w-5/12 bg-slate-900 text-slate-100 p-8 sm:p-12 flex flex-col justify-between border-r border-slate-800 relative overflow-hidden">
          {/* Subtle design elements */}
          <div className="absolute top-[-20%] left-[-20%] w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-600/30">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h2 className="font-display font-bold text-2xl tracking-tight text-white leading-none">EduGate</h2>
                <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider mt-1">Management Hub</p>
              </div>
            </div>

            <h3 className="font-display font-semibold text-xl text-slate-200 mb-4 tracking-tight leading-snug">
              Complete Educational Enterprise Resource Platform
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Empower your campus with custom workflows for student success, teacher allocations, class attendance registries, and AI-enabled progress feedback loops.
            </p>

            <div className="space-y-4 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span>Oracle PL/SQL simulated database integrity</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-400"></div>
                <span>Gemini 3.5 smart academic advisory insights</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-400"></div>
                <span>Role-based portal logins for Student, Teacher, and Admins</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-slate-800 text-xs text-slate-500">
            &copy; 2026 EduGate Academic. All rights reserved.
          </div>
        </div>

        {/* Right Side: Credentials Input Form */}
        <div className="md:w-7/12 p-8 sm:p-12 flex flex-col justify-center bg-slate-50">
          <div className="max-w-md mx-auto w-full">
            <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-500 text-sm mb-8">Sign in to access your customized school dashboard.</p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">School Email Address</label>
                <input
                  id="input-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium placeholder-slate-400"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                </div>
                <div className="relative">
                  <input
                    id="input-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your security password"
                    className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium placeholder-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-75 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Quick-fill section */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Demo Access Portals</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  id="btn-quick-admin"
                  type="button"
                  onClick={() => fillCredentials('admin@school.edu', 'admin123')}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/20 text-slate-700 hover:text-indigo-600 transition-all text-left group"
                >
                  <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-none">Admin</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-none">Complete access</p>
                  </div>
                </button>

                <button
                  id="btn-quick-teacher"
                  type="button"
                  onClick={() => fillCredentials('teacher@school.edu', 'teacher123')}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/20 text-slate-700 hover:text-indigo-600 transition-all text-left group"
                >
                  <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-none">Teacher</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-none">Assign & mark</p>
                  </div>
                </button>

                <button
                  id="btn-quick-student"
                  type="button"
                  onClick={() => fillCredentials('student@school.edu', 'student123')}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/20 text-slate-700 hover:text-indigo-600 transition-all text-left group"
                >
                  <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-none">Student</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-none">View & request</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
