import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LoginScreen from './components/LoginScreen';
import DashboardOverview from './components/DashboardOverview';
import StudentsSection from './components/StudentsSection';
import TeachersSection from './components/TeachersSection';
import CoursesSection from './components/CoursesSection';
import AttendanceSection from './components/AttendanceSection';
import DepartmentsSection from './components/DepartmentsSection';
import ProfileSection from './components/ProfileSection';
import AcademicReportSection from './components/AcademicReportSection';
import { User } from './types';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('edugate_auth_token');
  });
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setTab] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);

  // Auto-restore login on load
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('edugate_auth_token');
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();

        if (res.ok && data.user) {
          setUser(data.user);
          setAuthToken(token);
        } else {
          // Token is stale or expired
          localStorage.removeItem('edugate_auth_token');
          setAuthToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Session verification failed:", err);
      } finally {
        setIsInitializing(false);
      }
    };

    checkSession();
  }, []);

  const handleLoginSuccess = (token: string, loggedInUser: User) => {
    localStorage.setItem('edugate_auth_token', token);
    setAuthToken(token);
    setUser(loggedInUser);
    setTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('edugate_auth_token');
    setAuthToken(null);
    setUser(null);
    setTab('dashboard');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-400 font-semibold tracking-wide">Securing database gateway connections...</p>
      </div>
    );
  }

  if (!authToken || !user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const renderActiveSection = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardOverview user={user} authToken={authToken} setTab={setTab} />;
      case 'students':
        return <StudentsSection user={user} authToken={authToken} />;
      case 'teachers':
        return <TeachersSection user={user} authToken={authToken} />;
      case 'courses':
        return <CoursesSection user={user} authToken={authToken} />;
      case 'attendance':
        return <AttendanceSection user={user} authToken={authToken} />;
      case 'departments':
        return <DepartmentsSection user={user} authToken={authToken} />;
      case 'profile':
        return <ProfileSection user={user} authToken={authToken} />;
      case 'report':
        return <AcademicReportSection user={user} authToken={authToken} />;
      default:
        return <DashboardOverview user={user} authToken={authToken} setTab={setTab} />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar - Dark theme */}
      <Sidebar 
        currentTab={currentTab} 
        setTab={setTab} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main Canvas Workspace - Light theme */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {renderActiveSection()}
      </main>
    </div>
  );
}
