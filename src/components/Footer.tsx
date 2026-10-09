import React from 'react';
import { ViewMode } from '../types';

interface FooterProps {
  onNavigate: (view: ViewMode) => void;
  dark?: boolean;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="w-full border-t border-[#E6D5C1] bg-[#F3E6D5]/60 text-[#5C3A42] mt-auto transition-colors">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#800020]" />
          <p className="text-[13px] tracking-normal text-center sm:text-left text-[#1F040A] font-medium">
            Rithu — College of Engineering Munnar (CEM)
          </p>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[12px] text-[#5C3A42]">© 2026 Editorial Board</span>
        </div>
      </div>
    </footer>
  );
};
