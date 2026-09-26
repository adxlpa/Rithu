import React, { useState } from 'react';

interface SubmitMediaModalProps {
  type: 'video' | 'audio';
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (message: string) => void;
}

export const SubmitMediaModal: React.FC<SubmitMediaModalProps> = ({
  type,
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [contributor, setContributor] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitSuccess(
      type === 'video'
        ? 'Archival footage submitted successfully to the editorial review desk.'
        : 'Spoken piece recording submitted successfully for mastering & inclusion.'
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F040A]/60 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] bg-[#FFF9F2] rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#E6D5C1] flex flex-col gap-6 text-[#1F040A]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E6D5C1]">
          <div>
            <h3 className="text-[20px] font-semibold text-[#1F040A]">
              {type === 'video' ? 'Submit Archival Footage' : 'Submit Spoken Piece'}
            </h3>
            <p className="text-[13px] text-[#5C3A42] mt-0.5">
              Permanent college digital repository & annual edition vault
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5C3A42] hover:text-[#1F040A] hover:bg-[#F3E6D5] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#5C3A42]">Title / Subject</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'video'
                  ? 'e.g. Drone Survey of Tea Terraces 2026'
                  : 'e.g. ഓർമ്മകളുടെ തണുപ്പ് (Chill of Memories)'
              }
              className="h-11 px-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[15px] text-[#1F040A] placeholder-[#5C3A42]/50 outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#5C3A42]">Contributor Name</label>
              <input
                type="text"
                required
                value={contributor}
                onChange={(e) => setContributor(e.target.value)}
                placeholder="Student / Faculty Name"
                className="h-11 px-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[15px] text-[#1F040A] placeholder-[#5C3A42]/50 outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#5C3A42]">Department / Batch</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-11 px-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[15px] text-[#1F040A] outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15 transition-all cursor-pointer"
              >
                <option value="CSE">Computer Science & Engg</option>
                <option value="ECE">Electronics & Communication</option>
                <option value="EEE">Electrical & Electronics</option>
                <option value="ME">Mechanical Engineering</option>
                <option value="Alumni">Alumni Collective</option>
                <option value="Faculty">Faculty & Staff</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#5C3A42]">
              {type === 'video' ? 'Attach Video Clip / Master File' : 'Attach Spoken Audio File'}
            </label>
            <label className="border border-dashed border-[#D5C1AD] hover:border-[#800020] rounded-[10px] p-4 flex flex-col items-center justify-center bg-[#F3E6D5]/50 hover:bg-[#F3E6D5] cursor-pointer transition-all">
              <input
                type="file"
                className="sr-only"
                accept={type === 'video' ? 'video/*' : 'audio/*'}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFileName(e.target.files[0].name);
                  }
                }}
              />
              <span className="material-symbols-outlined text-[26px] text-[#800020] mb-1">
                {type === 'video' ? 'video_file' : 'audio_file'}
              </span>
              <span className="text-[14px] font-medium text-[#1F040A]">
                {fileName || (type === 'video' ? 'Upload 4K/1080p RAW or MP4' : 'Upload WAV, FLAC, or 320kbps MP3')}
              </span>
              <span className="text-[12px] text-[#5C3A42] mt-0.5">
                Maximum file upload size: 500 MB
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#5C3A42]">Context / Archival Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Recording dates, location on Munnar campus, featured participants..."
              className="p-3 rounded-[10px] bg-white border border-[#E6D5C1] text-[14px] text-[#1F040A] placeholder-[#5C3A42]/50 outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15 transition-all resize-none"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6D5C1]">
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
              Submit Contribution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
