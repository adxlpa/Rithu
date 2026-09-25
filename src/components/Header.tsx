import React, { useState } from 'react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  isAdminLoggedIn: boolean;
  adminUser?: string;
  onOpenLogin: () => void;
  onSignOutAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  isAdminLoggedIn,
  adminUser,
  onOpenLogin,
  onSignOutAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAdminClick = () => {
    if (isAdminLoggedIn) {
      onNavigate('admin-portal');
    } else {
      onOpenLogin();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0E0205]/95 backdrop-blur-[20px] border-b border-[#3A0C16] transition-colors">
      <div className="h-16 max-w-[1120px] mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#800020] border border-[#D45060]/40 flex items-center justify-center text-[#FFF9F2] font-bold text-[14px] shadow-sm">
              R
            </div>
            <div className="flex flex-col">
              <span className="font-['Inter'] text-[19px] leading-tight font-semibold tracking-tight text-[#FFF9F2] group-hover:text-[#D45060] transition-colors">
                Rithu
              </span>
              <span className="text-[#F3E6D5]/70 text-[10px] tracking-widest uppercase font-medium">
                College Magazine
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6" aria-label="Main Navigation">
            <button
              onClick={() => onNavigate('magazine')}
              className={`text-[14.5px] pb-1 transition-all duration-150 cursor-pointer ${
                currentView === 'magazine'
                  ? 'text-[#D45060] font-semibold border-b-2 border-[#D45060]'
                  : 'text-[#F3E6D5]/80 hover:text-white font-medium'
              }`}
            >
              Magazine
            </button>
            <button
              onClick={() => onNavigate('video')}
              className={`text-[14.5px] pb-1 transition-all duration-150 cursor-pointer ${
                currentView === 'video'
                  ? 'text-[#D45060] font-semibold border-b-2 border-[#D45060]'
                  : 'text-[#F3E6D5]/80 hover:text-white font-medium'
              }`}
            >
              Video
            </button>
            <button
              onClick={() => onNavigate('audio')}
              className={`text-[14.5px] pb-1 transition-all duration-150 cursor-pointer ${
                currentView === 'audio'
                  ? 'text-[#D45060] font-semibold border-b-2 border-[#D45060]'
                  : 'text-[#F3E6D5]/80 hover:text-white font-medium'
              }`}
            >
              Audio
            </button>
          </nav>

          <div className="flex items-center pl-3 border-l border-[#3A0C16] gap-3">
            <button
              onClick={handleAdminClick}
              title={isAdminLoggedIn ? `Admin Portal (${adminUser})` : 'Sign In as Admin'}
              className={`text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'admin-portal'
                  ? 'bg-[#800020] text-[#FFF9F2] border border-[#D45060]/50'
                  : 'text-[#F3E6D5]/80 hover:text-white hover:bg-[#1F040A]'
              }`}
            >
              {isAdminLoggedIn ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#D45060] animate-pulse"></span>
                  <span>Admin ({adminUser})</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span>Admin</span>
                </>
              )}
            </button>

            {isAdminLoggedIn && (
              <button
                onClick={onSignOutAdmin}
                title="Sign out of Admin Workspace"
                className="text-[12px] text-[#F3E6D5]/70 hover:text-[#D45060] px-2 py-1 rounded hover:bg-[#1F040A] transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            )}

            {/* Avatar Pill */}
            <div className="w-8 h-8 rounded-full bg-[#800020]/30 border border-[#800020] flex items-center justify-center text-[#D45060] font-bold text-[13px] shadow-xs">
              M
            </div>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={handleAdminClick}
            className={`p-1.5 rounded-md text-[12px] flex items-center gap-1 ${
              isAdminLoggedIn ? 'text-[#D45060] font-bold' : 'text-[#F3E6D5]/80'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isAdminLoggedIn ? 'shield_person' : 'lock'}
            </span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center text-[#F3E6D5]/80 hover:text-white focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#140307] border-b border-[#3A0C16] px-4 pt-2 pb-6 space-y-3 animate-fadeIn">
          <nav className="flex flex-col space-y-2">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 rounded-lg text-[15px] font-medium transition-colors ${
                currentView === 'home'
                  ? 'bg-[#800020] text-[#FFF9F2]'
                  : 'text-[#F3E6D5]/80 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('magazine');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 rounded-lg text-[15px] font-medium transition-colors ${
                currentView === 'magazine'
                  ? 'bg-[#800020] text-[#FFF9F2]'
                  : 'text-[#F3E6D5]/80 hover:text-white'
              }`}
            >
              Magazine
            </button>
            <button
              onClick={() => {
                onNavigate('video');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 rounded-lg text-[15px] font-medium transition-colors ${
                currentView === 'video'
                  ? 'bg-[#800020] text-[#FFF9F2]'
                  : 'text-[#F3E6D5]/80 hover:text-white'
              }`}
            >
              Video Archive
            </button>
            <button
              onClick={() => {
                onNavigate('audio');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 rounded-lg text-[15px] font-medium transition-colors ${
                currentView === 'audio'
                  ? 'bg-[#800020] text-[#FFF9F2]'
                  : 'text-[#F3E6D5]/80 hover:text-white'
              }`}
            >
              Audio Soundscapes
            </button>
            <button
              onClick={() => {
                handleAdminClick();
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 rounded-lg text-[15px] font-medium transition-colors flex items-center justify-between ${
                currentView === 'admin-portal'
                  ? 'bg-[#800020] text-[#FFF9F2]'
                  : 'text-[#F3E6D5]/80 hover:text-white'
              }`}
            >
              <span>Admin Portal</span>
              {isAdminLoggedIn ? (
                <span className="text-[11px] bg-[#800020]/40 text-[#D45060] px-2 py-0.5 rounded font-mono">
                  Signed in ({adminUser})
                </span>
              ) : (
                <span className="text-[11px] text-[#F3E6D5]/60">Password Required</span>
              )}
            </button>
          </nav>

          {isAdminLoggedIn && (
            <div className="pt-2 border-t border-[#3A0C16] flex justify-between items-center">
              <span className="text-[12px] text-[#F3E6D5]/80">Logged in as {adminUser}</span>
              <button
                onClick={() => {
                  onSignOutAdmin();
                  setMobileMenuOpen(false);
                }}
                className="text-[12px] text-[#D45060] font-medium"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
