import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/App';
import {
  Brain, Lock, Mail, User, Briefcase, Eye, EyeOff,
  ArrowRight, ShieldCheck, Zap, Sparkles, CheckCircle2,
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loginAsDemo, isAuthenticated } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign In form
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up form
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpTitle, setSignUpTitle] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Target route to redirect to
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(signInEmail, signInPassword);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.error || 'Failed to sign in.');
      }
    } catch {
      setError('An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (signUpPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: signUpName,
        email: signUpEmail,
        title: signUpTitle || 'Full Stack Developer',
        password: signUpPassword,
      });

      if (res.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(res.error || 'Failed to create account.');
      }
    } catch {
      setError('An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await loginAsDemo();
      if (res.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(res.error || 'Demo sign in failed.');
      }
    } catch {
      setError('Could not sign in with demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 bg-gradient-to-br from-surface-50 via-brand-50/20 to-surface-100 dark:from-dark-0 dark:via-dark-100 dark:to-dark-200">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: Brand & Feature Highlights (Hidden on small mobile, visible on lg) */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left py-4 px-2">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">CogniOs</h1>
              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 tracking-wider uppercase">Competency Hub</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Own your developer journey & career readiness.
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
              Track mastery across full stack skills, manage coursework, showcase GitHub projects, and build tailored ATS resumes.
            </p>
          </div>

          <div className="space-y-3 pt-2 text-left hidden sm:block">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 dark:bg-dark-100/70 border border-gray-100 dark:border-dark-300 backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Personal Data Isolation</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Each account maintains its own private skills, projects, and notes.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 dark:bg-dark-100/70 border border-gray-100 dark:border-dark-300 backdrop-blur-xs">
              <Zap className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Tailored ATS Resume Generator</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Export clean, job-specific ATS resumes with print and copy tools.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-dark-100 rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200/80 dark:border-dark-300/80 backdrop-blur-xl">
            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-gray-100 dark:bg-dark-200 p-1 mb-6">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-dark-50 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-dark-50 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400 animate-fade-in flex items-center gap-2">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}

            {/* Quick Demo Login Option */}
            <div className="mb-5 pb-5 border-b border-gray-100 dark:border-dark-300">
              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 dark:hover:bg-brand-900/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs sm:text-sm font-semibold transition-all group"
              >
                <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400 group-hover:rotate-12 transition-transform" />
                <span>1-Click Demo Login (Shiv Dhakad)</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            </div>

            {/* Sign In Form */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="input-label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="e.g. shiv.dhakad@example.com"
                      className="input-field !pl-10 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="input-field !pl-10 !pr-10 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
                  <span>Demo password: <code className="bg-gray-100 dark:bg-dark-200 px-1 py-0.5 rounded text-brand-600 dark:text-brand-400 font-mono">password123</code></span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full !py-3 text-sm mt-2 font-semibold shadow-md shadow-brand-500/20"
                >
                  {loading ? 'Signing In...' : 'Sign In to Workspace'}
                </button>
              </form>
            ) : (
              /* Sign Up Form */
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="input-label">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="input-field !pl-10 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="input-field !pl-10 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Job Title / Specialty</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={signUpTitle}
                      onChange={(e) => setSignUpTitle(e.target.value)}
                      placeholder="e.g. Java Backend Engineer"
                      className="input-field !pl-10 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="input-field !pl-9 text-xs sm:text-sm"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="input-field !pl-9 text-xs sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full !py-3 text-sm mt-3 font-semibold shadow-md shadow-brand-500/20"
                >
                  {loading ? 'Creating Account...' : 'Create Secure Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
