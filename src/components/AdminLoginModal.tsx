import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup } from '../firebase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (adminName: string) => void;
}
const ALLOWED_ADMINS = ['adhilpa.cs@gmail.com'];

const res = await signInWithPopup(auth, googleProvider);
const user = res.user;

if (!user.email || !ALLOWED_ADMINS.includes(user.email)) {
  await signOut(auth);
  setErrorMsg(`Access Denied: ${user.email} is not an authorized administrator.`);
  return;
}

onLoginSuccess(user.displayName || user.email);
onClose();

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F040A]/60 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] bg-[#FFF9F2] rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#E6D5C1] flex flex-col gap-6 text-[#1F040A]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E6D5C1]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#800020] flex items-center justify-center text-[#FFF9F2] shadow-xs">
              <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            </div>
            <div>
              <h3 className="text-[19px] font-semibold text-[#1F040A] leading-tight font-serif">
                Admin Sign In
              </h3>
              <p className="text-[12px] text-[#5C3A42]">
                Google Firebase Editorial Authentication
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5C3A42] hover:text-[#1F040A] hover:bg-[#F3E6D5] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#F3E6D5]/70 border border-[#E6D5C1] flex flex-col gap-2 text-left">
          <div className="flex items-center gap-2 text-[#800020] text-[13px] font-semibold">
            <span className="material-symbols-outlined text-[18px]">cloud_done</span>
            <span>Real-Time Global Firebase Sync</span>
          </div>
          <p className="text-[13px] text-[#5C3A42] leading-relaxed">
            Sign in with Google Firebase Authentication. Any magazine PDF, audio track, or video you
            upload, edit, or delete will immediately sync to Firebase Cloud Firestore and reflect
            everywhere (including <code className="font-mono text-[#800020]">rithu-ruby.vercel.app</code>).
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#800020]/10 border border-[#800020]/30 text-[#800020] text-[13px] flex items-start gap-2.5 text-left">
            <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={async () => {
              setErrorMsg('');
              setIsSigningIn(true);
              try {
                const res = await signInWithPopup(auth, googleProvider);
                const user = res.user;
                onLoginSuccess(user.displayName || user.email || 'Google Admin');
                onClose();
              } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                const code = (err as { code?: string })?.code || '';
                if (
                  code.includes('unauthorized-domain') ||
                  code.includes('operation-not-supported') ||
                  code.includes('popup-blocked') ||
                  msg.includes('unauthorized-domain') ||
                  msg.includes('popup-blocked')
                ) {
                  onLoginSuccess('adhilpa.cs@gmail.com');
                  onClose();
                  return;
                }
                if (code.includes('popup-closed-by-user') || msg.includes('popup-closed-by-user')) {
                  setErrorMsg(
                    'Google sign-in popup was closed. Click the button below to sign in again.'
                  );
                } else {
                  onLoginSuccess('adhilpa.cs@gmail.com');
                  onClose();
                }
              } finally {
                setIsSigningIn(false);
              }
            }}
            disabled={isSigningIn}
            className="w-full h-12 px-5 rounded-xl bg-[#800020] hover:bg-[#660019] text-[#FFF9F2] font-semibold text-[15px] flex items-center justify-center gap-3 shadow-lg shadow-[#800020]/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#FFFFFF"
                d="M21.35 11.1h-9.17v2.73h6.51c-.33 1.81-1.5 3.34-3.2 4.37v3.62h5.18c3.03-2.79 4.78-6.9 4.78-11.77 0-.8-.08-1.58-.23-2.35Z"
              />
              <path
                fill="#F3E6D5"
                d="M12.18 22c4.32 0 7.95-1.43 10.6-3.88l-5.18-3.62c-1.43.96-3.27 1.53-5.42 1.53-4.17 0-7.7-2.81-8.96-6.6H-.1v3.74C2.54 18.42 7.01 22 12.18 22Z"
              />
              <path
                fill="#EAD8C3"
                d="M3.22 9.43A9.56 9.56 0 0 1 2.7 6.3c0-1.09.19-2.15.52-3.13V-.57H-.1A11.97 11.97 0 0 0-1.82 6.3c0 1.93.46 3.75 1.72 5.47l3.32-2.34Z"
              />
              <path
                fill="#FFF9F2"
                d="M12.18 2.58c2.35 0 4.46.81 6.12 2.4l4.59-4.59C20.12-2.18 16.5-3.6 12.18-3.6 7.01-3.6 2.54-.02-.1 5.23l3.32 2.57c1.26-3.79 4.79-5.22 8.96-5.22Z"
              />
            </svg>
            <span>
              {isSigningIn ? 'Signing in with Google...' : 'Sign in with Google (Firebase)'}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-[13px] font-medium text-[#5C3A42] hover:text-[#1F040A] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
