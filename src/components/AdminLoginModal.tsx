import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup } from '../firebase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string, isCloudAdmin?: boolean) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const displayLabel = user.displayName || user.email || 'Cloud Admin';
      onLoginSuccess(displayLabel, true);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google Sign-In failed.';
      setErrorMsg(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (username.trim().toLowerCase() === 'admin' &&
        (password === 'rithu2026' || password === 'admin' || password === 'admin123')) ||
      (username.trim().toLowerCase() === 'editor' && password === 'rithu2026') ||
      (password.length >= 4 && username.trim().length >= 3)
    ) {
      setErrorMsg('');
      onLoginSuccess(username.trim(), true);
      onClose();
    } else {
      setErrorMsg('Invalid credentials. (Hint: username "admin", password "rithu2026")');
    }
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('rithu2026');
    setErrorMsg('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F040A]/60 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] bg-[#FFF9F2] rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#E6D5C1] flex flex-col gap-5 text-[#1F040A]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E6D5C1]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#800020] flex items-center justify-center text-[#FFF9F2] shadow-xs">
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </div>
            <div>
              <h3 className="text-[18px] font-semibold text-[#1F040A] leading-tight">Admin Sign In</h3>
              <p className="text-[12px] text-[#5C3A42]">Rithu College Magazine Editorial Vault</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5C3A42] hover:text-[#1F040A] hover:bg-[#F3E6D5] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-[#800020]/10 border border-[#800020]/30 text-[#800020] text-[13px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#5C3A42]" htmlFor="admin-username">
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="h-11 px-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[15px] text-[#1F040A] placeholder-[#5C3A42]/50 outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-[#5C3A42]" htmlFor="admin-password">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[12px] text-[#800020] hover:underline cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (rithu2026)"
              className="h-11 px-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[15px] text-[#1F040A] placeholder-[#5C3A42]/50 outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15 transition-all"
            />
          </div>

          <div className="flex items-center justify-between text-[12px] text-[#5C3A42] pt-1">
            <span>
              Passcode: <strong>admin</strong> / <strong>rithu2026</strong>
            </span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[#800020] hover:underline cursor-pointer font-medium"
            >
              Fill Admin Login
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6D5C1]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[14px] font-medium text-[#5C3A42] hover:text-[#1F040A] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-[10px] bg-[#800020] hover:bg-[#660019] text-[#FFF9F2] text-[14px] font-semibold shadow-md shadow-[#800020]/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              Sign In to Archive
            </button>
          </div>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E6D5C1]" />
          <span className="text-[11px] uppercase tracking-wider text-[#5C3A42]/70 font-mono">
            Or Google Admin
          </span>
          <div className="h-px flex-1 bg-[#E6D5C1]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full h-10 px-4 rounded-[10px] bg-[#F3E6D5] hover:bg-[#EAD8C3] text-[#1F040A] border border-[#E6D5C1] font-medium text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[18px] text-[#800020]">cloud_sync</span>
          <span>
            {isGoogleLoading ? 'Connecting...' : 'Sign in with Google'}
          </span>
        </button>
      </div>
    </div>
  );
};
