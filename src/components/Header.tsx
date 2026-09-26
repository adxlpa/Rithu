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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFF9F2]/95 backdrop-blur-[20px] border-b border-[#E6D5C1] transition-colors">
      <div className="h-16 max-w-[1120px] mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Zone 1: Brand */}
        <button
          onClick={() => onNavigate('home')}
          className="font-serif text-[22px] leading-tight font-bold tracking-tight text-[#800020] hover:text-[#D45060] transition-colors focus:outline-none cursor-pointer whitespace-nowrap"
        >
          Rithu
        </button>

        {/* Zone 2: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Main Navigation">
          <button
            onClick={() => onNavigate('magazine')}
            className={`text-[14.5px] pb-1 transition-all duration-150 cursor-pointer whitespace-nowrap ${
              currentView === 'magazine'
                ? 'text-[#800020] font-semibold border-b-2 border-[#800020]'
                : 'text-[#5C3A42] hover:text-[#1F040A] font-medium'
            }`}
          >
            Magazine
          </button>
          <button
            onClick={() => onNavigate('video')}
            className={`text-[14.5px] pb-1 transition-all duration-150 cursor-pointer whitespace-nowrap ${
              currentView === 'video'
                ? 'text-[#800020] font-semibold border-b-2 border-[#800020]'
                : 'text-[#5C3A42] hover:text-[#1F040A] font-medium'
            }`}
          >
            Video
          </button>
          <button
            onClick={() => onNavigate('audio')}
            className={`text-[14.5px] pb-1 transition-all duration-150 cursor-pointer whitespace-nowrap ${
              currentView === 'audio'
                ? 'text-[#800020] font-semibold border-b-2 border-[#800020]'
                : 'text-[#5C3A42] hover:text-[#1F040A] font-medium'
            }`}
          >
            Audio
          </button>
          <button
            onClick={() => {
              onNavigate('home');
              setTimeout(() => {
                document.getElementById('editorial-board')?.scrollIntoView({ behavior: 'smooth' });
              }, 80);
            }}
            className="text-[14.5px] pb-1 text-[#5C3A42] hover:text-[#800020] font-medium transition-all duration-150 cursor-pointer whitespace-nowrap"
          >
            Editorial Board
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={handleAdminClick}
            title={isAdminLoggedIn ? `Admin Portal (${adminUser})` : 'Sign In as Admin'}
            className={`text-[13px] font-medium px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              currentView === 'admin-portal'
                ? 'bg-[#800020] text-[#FFF9F2]'
                : 'text-[#5C3A42] hover:text-[#1F040A] hover:bg-[#F3E6D5]'
            }`}
          >
            {isAdminLoggedIn ? (
              <span>Admin ({adminUser})</span>
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
              className="text-[12px] text-[#5C3A42] hover:text-[#800020] px-2.5 py-1 rounded hover:bg-[#F3E6D5] transition-colors cursor-pointer whitespace-nowrap"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={handleAdminClick}
            className={`p-1.5 rounded-md text-[12px] flex items-center gap-1 ${
              isAdminLoggedIn ? 'text-[#800020] font-bold' : 'text-[#5C3A42]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isAdminLoggedIn ? 'shield_person' : 'lock'}
            </span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center text-[#1F040A] hover:text-[#800020] focus:outline-none cursor-pointer"
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
        <div className="md:hidden bg-[#FFF9F2] border-b border-[#E6D5C1] px-4 pt-2 pb-6 space-y-3 animate-fadeIn shadow-lg">
          <nav className="flex flex-col space-y-1.5">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 rounded-lg text-[15px] font-medium transition-colors ${
                currentView === 'home'
                  ? 'bg-[#800020] text-[#FFF9F2]'
                  : 'text-[#1F040A] hover:bg-[#F3E6D5]'
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
                  : 'text-[#1F040A] hover:bg-[#F3E6D5]'
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
                  : 'text-[#1F040A] hover:bg-[#F3E6D5]'
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
                  : 'text-[#1F040A] hover:bg-[#F3E6D5]'
              }`}
            >
              Audio Soundscapes
            </button>
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
                setTimeout(() => {
                  document.getElementById('editorial-board')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-left py-2 px-3 rounded-lg text-[15px] font-medium text-[#1F040A] hover:bg-[#F3E6D5] transition-colors"
            >
              Editorial Board
            </button>
            <button
              onClick={() => {
                handleAdminClick();
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 rounded-lg text-[15px] font-medium transition-colors flex items-center justify-between ${
                currentView === 'admin-portal'
                  ? 'bg-[#800020] text-[#FFF9F2]'
                  : 'text-[#1F040A] hover:bg-[#F3E6D5]'
              }`}
            >
              <span>Admin Portal</span>
              <span className="text-[12px] opacity-80">
                {isAdminLoggedIn ? `Signed in (${adminUser})` : 'Sign In'}
              </span>
            </button>
          </nav>

          {isAdminLoggedIn && (
            <div className="pt-2 border-t border-[#E6D5C1] flex justify-between items-center">
              <span className="text-[12px] text-[#5C3A42]">Logged in as {adminUser}</span>
              <button
                onClick={() => {
                  onSignOutAdmin();
                  setMobileMenuOpen(false);
                }}
                className="text-[12px] text-[#800020] font-semibold"
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
