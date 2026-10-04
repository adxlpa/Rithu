import React, { useState } from 'react';

interface SubmissionModalProps {
  type: 'audio' | 'video';
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (msg: string) => void;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({
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
    if (!title.trim() || !contributor.trim()) return;
    onSubmitSuccess(
      `Thank you, ${contributor}! Your ${type} submission "${title}" has been sent to the Editorial Board.`
    );
    setTitle('');
    setContributor('');
    setNotes('');
    setFileName('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F040A]/60 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] bg-[#FFF9F2] rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#E6D5C1] flex flex-col gap-5 text-[#1F040A]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E6D5C1]">
          <div>
            <h3 className="text-[20px] font-semibold text-[#1F040A] font-serif">
              Submit {type === 'video' ? 'Campus Video' : 'Spoken Audio'}
            </h3>
            <p className="text-[12px] text-[#5C3A42]">
              Rithu Digital Archive · Student & Alumni Contributions
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5C3A42] hover:text-[#1F040A] hover:bg-[#F3E6D5] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#5C3A42]">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'video'
                  ? 'e.g. Monsoon Evening at Munnar Campus'
                  : 'e.g. മഴക്കാല ഓർമ്മകൾ (Poem)'
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
                {fileName ||
                  (type === 'video'
                    ? 'Upload 4K/1080p RAW or MP4'
                    : 'Upload WAV, FLAC, or 320kbps MP3')}
              </span>
              <span className="text-[12px] text-[#5C3A42] mt-0.5">
                Maximum file upload size: 500 MB
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#5C3A42]">
              Context / Archival Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Recording dates, location on Munnar campus, featured participants..."
              className="p-3 rounded-[10px] bg-white border border-[#E6D5C1] text-[14px] text-[#1F040A] placeholder-[#5C3A42]/50 outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15 transition-all resize-none"
            />
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
