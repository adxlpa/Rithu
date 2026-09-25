import React from 'react';
import { ViewMode } from '../types';

interface FooterProps {
  onNavigate: (view: ViewMode) => void;
  dark?: boolean;
  isAdminLoggedIn?: boolean;
  onOpenLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  isAdminLoggedIn = false,
  onOpenLogin,
}) => {
  const handleAdminClick = () => {
    if (isAdminLoggedIn) {
      onNavigate('admin-portal');
    } else if (onOpenLogin) {
      onOpenLogin();
    } else {
      onNavigate('admin-portal');
    }
  };

  return (
    <footer className="w-full border-t border-[#3A0C16] bg-[#0E0205] text-[#F3E6D5]/80 mt-auto transition-colors">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#800020]"></span>
          <p className="text-[12.5px] tracking-normal text-center sm:text-left text-[#F3E6D5]/90">
            Rithu — College of Engineering Munnar (CEM)
          </p>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[12px] opacity-70">© 2026 Editorial Board</span>
          <button
            onClick={handleAdminClick}
            className="text-[12px] text-[#F3E6D5]/80 hover:text-[#D45060] transition-colors cursor-pointer"
          >
            {isAdminLoggedIn ? 'Admin Portal' : 'Admin Login'}
          </button>
        </div>
      </div>
    </footer>
  );
};
