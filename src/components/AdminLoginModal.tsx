import React, { useState } from 'react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (username.trim().toLowerCase() === 'admin' && (password === 'rithu2026' || password === 'admin' || password === 'admin123')) ||
      (username.trim().toLowerCase() === 'editor' && password === 'rithu2026') ||
      (password.length >= 4 && username.trim().length >= 3)
    ) {
      setErrorMsg('');
      onLoginSuccess(username.trim());
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] bg-[#140307] rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#3A0C16] flex flex-col gap-6 text-[#FFF9F2]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#3A0C16]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#800020] border border-[#D45060]/40 flex items-center justify-center text-[#FFF9F2] shadow-sm">
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </div>
            <div>
              <h3 className="text-[18px] font-semibold text-[#FFF9F2] leading-tight">Admin Sign In</h3>
              <p className="text-[12px] text-[#F3E6D5]/80">Rithu College Magazine Editorial Vault</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#F3E6D5]/80 hover:text-white hover:bg-[#1F040A] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-[#3A0C16] border border-[#D45060]/50 text-[#D45060] text-[13px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#F3E6D5]/80" htmlFor="admin-username">
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="h-11 px-3.5 rounded-[10px] bg-[#1F040A] border border-[#3A0C16] text-[15px] text-[#FFF9F2] placeholder-[#F3E6D5]/40 outline-none focus:border-[#D45060] focus:ring-2 focus:ring-[#D45060]/20 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-[#F3E6D5]/80" htmlFor="admin-password">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[12px] text-[#D45060] hover:underline cursor-pointer"
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
              className="h-11 px-3.5 rounded-[10px] bg-[#1F040A] border border-[#3A0C16] text-[15px] text-[#FFF9F2] placeholder-[#F3E6D5]/40 outline-none focus:border-[#D45060] focus:ring-2 focus:ring-[#D45060]/20 transition-all"
            />
          </div>

          <div className="flex items-center justify-between text-[12px] text-[#F3E6D5]/80 pt-1">
            <span>Demo: <strong>admin</strong> / <strong>rithu2026</strong></span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[#D45060] hover:underline cursor-pointer font-medium"
            >
              Fill Demo Login
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3A0C16]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[14px] font-medium text-[#F3E6D5]/80 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-[10px] bg-[#800020] hover:bg-[#A30029] text-[#FFF9F2] text-[14px] font-semibold shadow-lg shadow-[#800020]/30 active:scale-[0.98] transition-all cursor-pointer"
            >
              Sign In to Archive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
