import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';
import { DailyraLogo } from '../ui/DailyraLogo';
import { VISUAL_ASSETS } from '../../assets/visualAssets';
import { dailyraApi } from '../../services/api';
import { Modal } from '../ui/CommonUI';

interface LoginScreenProps {
  defaultEmailHint?: string;
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  defaultEmailHint = 'girlsigma611@gmail.com',
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState(defaultEmailHint);
  const [password, setPassword] = useState('@faiza2299');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recovery Modal State
  const [showRecovery, setShowRecovery] = useState(false);
  const [recEmail, setRecEmail] = useState(defaultEmailHint);
  const [recDob, setRecDob] = useState('1991-04-15');
  const [recNewPassword, setRecNewPassword] = useState('');
  const [recStatus, setRecStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await dailyraApi.login(email, password, rememberMe);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecStatus(null);
    try {
      const res = await dailyraApi.recoverPassword(recEmail, recDob, recNewPassword);
      setRecStatus({ type: 'success', text: res.message });
      setPassword(recNewPassword);
      setTimeout(() => {
        setShowRecovery(false);
        setRecStatus(null);
      }, 1400);
    } catch (err: any) {
      setRecStatus({
        type: 'error',
        text: err.message || 'Unable to verify recovery credentials.',
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F6F4EE] text-[#1F2421] flex flex-col lg:flex-row relative overflow-hidden">
      {/* Left Decorative Botanical & Mountain Editorial Panel */}
      <div className="hidden lg:flex lg:w-[52%] relative bg-[#EFECE4] border-r border-[#E5E0D5] flex-col justify-between p-12 overflow-hidden">
        {/* Background Atmospheric Mountain Banner */}
        <div className="absolute inset-0 opacity-85 pointer-events-none">
          <img
            src={VISUAL_ASSETS.heroMountainBanner}
            alt="Dailyra Morning Landscape"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F5F2EB]/90 via-[#F5F2EB]/65 to-[#1E3F2B]/80" />
        </div>

        {/* Top Logo */}
        <div className="relative z-10">
          <DailyraLogo size="lg" />
        </div>

        {/* Center Editorial Statement */}
        <div className="relative z-10 max-w-lg my-auto py-12">
          <p className="font-script text-2xl text-[#234732] mb-2">
            Small steps every day lead to big dreams.
          </p>
          <h1
            className="font-serif-display text-5xl font-semibold text-[#183322] leading-[1.12] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            One App. Everything That Matters.
          </h1>
          <p className="mt-4 text-sm text-[#38473E] leading-relaxed max-w-md">
            Your private digital sanctuary for daily schedules, household finances,
            family milestones, personal notes, documents, and wellness records.
          </p>
        </div>

        {/* Bottom Private Single-Owner Trust Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-[#F5F2EB]/90 pt-6 border-t border-white/20">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#A9D6B7]" />
            <span>Private Single-Admin Personal Life OS</span>
          </div>
          <span className="font-script text-lg text-[#E8F2EB]">
            A better tomorrow starts with an organized today.
          </span>
        </div>
      </div>

      {/* Right Authentication Form Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        {/* Subtle Botanical Corner Watermark */}
        <img
          src={VISUAL_ASSETS.botanicalCornerArt}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="w-56 h-72 object-cover absolute bottom-0 right-0 opacity-25 pointer-events-none select-none mix-blend-multiply"
        />

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile Brand Header */}
          <div className="lg:hidden mb-8 flex justify-center">
            <DailyraLogo size="lg" />
          </div>

          <div className="bg-[#FDFCFB] border border-[#E7E2D8] rounded-3xl p-8 sm:p-10 shadow-[0_12px_40px_-16px_rgba(31,58,43,0.10)]">
            <div className="mb-7">
              <div className="inline-flex items-center gap-1.5 text-xs text-[#234732] font-medium mb-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Private Administrator Access</span>
              </div>
              <h2 className="font-serif-display text-4xl font-semibold text-[#1A3324] tracking-tight">
                Welcome back.
              </h2>
              <p className="text-xs text-[#6E7671] mt-1.5">
                Everything that matters, all in one place.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 px-4 py-3 rounded-xl bg-[#FDF2F2] border border-[#F2D0D0] text-[#A63A3A] text-xs leading-relaxed"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-medium text-[#3C443F] mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#89918C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="girlsigma611@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F6F1] border border-[#E2DDD2] text-sm text-[#1F2421] placeholder-[#9BA29D] focus:outline-none focus:border-[#234732] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-medium text-[#3C443F]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRecovery(true)}
                    className="text-xs text-[#234732] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#89918C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter administrator password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F8F6F1] border border-[#E2DDD2] text-sm text-[#1F2421] placeholder-[#9BA29D] focus:outline-none focus:border-[#234732] focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B847E] hover:text-[#1F2421] p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D5CFC3] text-[#234732] focus:ring-[#234732]"
                  />
                  <span className="text-xs text-[#5A625D]">Remember me on this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-5 rounded-xl bg-[#234732] hover:bg-[#1B3727] disabled:opacity-60 text-white text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>{loading ? 'Authenticating Vault...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick-Fill Helper for Administrator */}
            <div className="mt-6 pt-5 border-t border-[#EFECE4] flex items-center justify-between text-[11px] text-[#7A827D]">
              <span>Owner: Sarah Wilson</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('girlsigma611@gmail.com');
                  setPassword('@faiza2299');
                }}
                className="text-[#234732] font-medium hover:underline"
              >
                Restore Default Key
              </button>
            </div>
          </div>

          <p className="text-center text-[11px] text-[#858D88] mt-5">
            Dailyra is a private single-administrator system. Public registration is disabled.
          </p>
        </div>
      </div>

      {/* Secure Password Recovery Modal */}
      <Modal
        isOpen={showRecovery}
        onClose={() => setShowRecovery(false)}
        title="Administrator Key Recovery"
        subtitle="Verify your personal profile identity to reset your administrator password."
      >
        <form onSubmit={handleRecoverySubmit} className="space-y-4">
          {recStatus && (
            <div
              className={`p-3 rounded-xl text-xs ${
                recStatus.type === 'success'
                  ? 'bg-[#EAF4EC] text-[#1E3F2B]'
                  : 'bg-[#FDF2F2] text-[#A63A3A]'
              }`}
            >
              {recStatus.text}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-[#3C443F] mb-1">
              Administrator Email
            </label>
            <input
              type="email"
              required
              value={recEmail}
              onChange={(e) => setRecEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8F6F1] border border-[#E2DDD2] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#3C443F] mb-1">
              Admin Date of Birth Verification (YYYY-MM-DD)
            </label>
            <input
              type="text"
              required
              value={recDob}
              onChange={(e) => setRecDob(e.target.value)}
              placeholder="1991-04-15"
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8F6F1] border border-[#E2DDD2] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#3C443F] mb-1">
              New Administrator Password (min 8 chars)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={recNewPassword}
              onChange={(e) => setRecNewPassword(e.target.value)}
              placeholder="Enter new strong password"
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8F6F1] border border-[#E2DDD2] text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowRecovery(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-[#E2DDD2] text-[#4B534E] hover:bg-[#F2EFE9]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-medium bg-[#234732] text-white hover:bg-[#1B3727]"
            >
              Reset Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
