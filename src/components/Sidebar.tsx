import React from 'react';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Building, 
  LayoutDashboard, 
  LogOut, 
  User, 
  Calendar,
  Award,
  FileText
} from 'lucide-react';
import { User as UserType } from '../types';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  user: UserType | null;
  onLogout: () => void;
}

export default function Sidebar({ currentTab, setTab, user, onLogout }: SidebarProps) {
  const getNavItems = () => {
    const common = [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    ];

    if (user?.role === 'ADMIN') {
      return [
        ...common,
        { id: 'students', name: 'Students', icon: Users },
        { id: 'teachers', name: 'Teachers', icon: User },
        { id: 'courses', name: 'Courses', icon: BookOpen },
        { id: 'departments', name: 'Departments', icon: Building },
        { id: 'attendance', name: 'Attendance', icon: Calendar },
      ];
    }

    if (user?.role === 'TEACHER') {
      return [
        ...common,
        { id: 'students', name: 'My Students', icon: Users },
        { id: 'courses', name: 'My Courses', icon: BookOpen },
        { id: 'attendance', name: 'Mark Attendance', icon: Calendar },
      ];
    }

    // STUDENT
    return [
      ...common,
      { id: 'courses', name: 'My Enrollments', icon: BookOpen },
      { id: 'report', name: 'Academic Report', icon: FileText },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-full border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/30">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg leading-tight tracking-tight text-white">EduGate</h1>
          <p className="text-xs text-slate-400 font-medium">Student Portal v1.2</p>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Profile Details */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-slate-900/60">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center text-indigo-400 font-semibold border border-indigo-500/20 shadow-inner">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              user?.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold truncate text-slate-200">{user?.name}</h2>
            <span className="inline-block px-2 py-0.5 mt-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            id="btn-sidebar-profile"
            onClick={() => setTab('profile')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
              currentTab === 'profile'
                ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300'
                : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <span>My Profile</span>
          </button>
          <button
            id="btn-sidebar-logout"
            onClick={onLogout}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border border-rose-950/40 bg-rose-950/10 text-rose-400 hover:bg-rose-900/30 hover:text-rose-200 hover:border-rose-800 transition-all duration-200"
          >
            <LogOut className="h-3 w-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
