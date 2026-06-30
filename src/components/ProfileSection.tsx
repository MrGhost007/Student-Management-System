import React, { useState } from 'react';
import { User, Shield, Lock, ShieldAlert, Check, Loader2 } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileSectionProps {
  user: UserType | null;
  authToken: string;
}

export default function ProfileSection({ user, authToken }: ProfileSectionProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 5) {
      setError("New password must be at least 5 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setSuccess("Your account password has been updated successfully.");
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong while updating password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 sm:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-none">My Account Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Review your security status and update credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Card: Account Card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <div className="mx-auto h-24 w-24 rounded-full overflow-hidden bg-indigo-50 border-2 border-indigo-500/20 shadow-md flex items-center justify-center text-indigo-600 text-3xl font-bold">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              user?.name.charAt(0).toUpperCase()
            )}
          </div>

          <h2 className="text-lg font-display font-bold text-slate-900 mt-4 leading-tight">{user?.name}</h2>
          <p className="text-xs text-slate-400 mt-1">{user?.email}</p>

          <div className="mt-4 inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 border border-indigo-200/50 text-indigo-600 uppercase tracking-wider">
            {user?.role}
          </div>

          <div className="pt-6 border-t border-slate-100 text-left space-y-4 mt-6">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ID Reference</span>
              <span className="text-xs font-mono font-medium text-slate-600 mt-1 block">
                {user?.referenceId || 'N/A (System account)'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Access Permission</span>
              <span className="text-xs font-semibold text-slate-600 mt-1 block flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-indigo-500" />
                <span>Standard Level ({user?.role})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Password Change form */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <Lock className="h-5 w-5 text-indigo-600" />
            <h3 className="font-display font-bold text-slate-900 text-lg">Change Security Password</h3>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <Check className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Current Password</label>
              <input
                id="profile-old-pass"
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">New Password</label>
              <input
                id="profile-new-pass"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Confirm New Password</label>
              <input
                id="profile-confirm-pass"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium placeholder-slate-400"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 max-w-md flex justify-end">
              <button
                id="btn-update-password"
                type="submit"
                disabled={isLoading}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-slate-900/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
