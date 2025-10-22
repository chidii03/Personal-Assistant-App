'use client';

import React, { useState, useEffect, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '@/components/AuthContext';

import { toast } from 'react-toastify';

import { FaFacebook, FaWhatsapp, FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

import { useRouter } from 'next/navigation';

import { Mail, Lock, UserPlus, LogIn, CircleAlert, X } from 'lucide-react';

const LoginPage = () => {
  const { signup, login, currentUser } = useAuth();
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const emailInputRef = useRef(null);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  const validatePassword = (pwd) => {
    const minLength = 8;
    const hasDigit = /[0-9]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(pwd);

    if (pwd.length < minLength) {
      return `Password must be at least ${minLength} characters long.`;
    }
    if (!hasDigit) {
      return 'Password must contain at least one digit.';
    }
    if (!hasLower) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!hasUpper) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!hasSymbol) {
      return 'Password must contain at least one symbol (e.g., !@#$%^&*).';
    }
    return '';
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (isSignUp) {
      const error = validatePassword(newPassword);
      setPasswordError(error);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (isSignUp && e.target.value !== password) {
      setPasswordError('Passwords do not match.');
    } else {
      setPasswordError(validatePassword(password) || (password !== e.target.value && e.target.value !== '' ? 'Passwords do not match.' : ''));
    }
  };

  const handleEmailChange = (e) => setEmail(e.target.value);

  const handleEmailKeyDown = (e) => {
    if (e.key === '@' && email && !email.includes('@')) {
      e.preventDefault();
      const newEmail = email + '@gmail.com';
      setEmail(newEmail);
      setTimeout(() => {
        if (emailInputRef.current) {
          emailInputRef.current.selectionStart = newEmail.length;
          emailInputRef.current.selectionEnd = newEmail.length;
        }
      }, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPasswordError('');

    if (isSignUp) {
      const validationError = validatePassword(password);
      if (validationError) {
        setPasswordError(validationError);
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match.');
        setLoading(false);
        return;
      }
    }

    let result = { success: false, error: '' };
    try {
      if (isSignUp) {
        result = await signup(email, password, name);
      } else {
        result = await login(email, password);
      }
    } catch (error) {
      result.error = error.message || 'Authentication failed';
    }

    setLoading(false);

    if (result.success) {
      toast.success(isSignUp ? 'Account created successfully!' : 'Logged in successfully!');
      router.push('/');
    } else if (result.error) {
      let message = result.error;
      if (isSignUp && message === 'This email is already in use.') {
        message += ' Please try logging in instead.';
      } else if (!isSignUp && message === 'Invalid email or password.') {
        message += ' If you don\'t have an account, please sign up.';
      }
      toast.error(message);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPasswordError('');
  };

  const handleToggleForm = () => {
    setIsSignUp(prev => !prev);
    resetForm();
  };

  const handleClosePage = () => {
    router.push('/');
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-black to-purple-800 text-white">
      {/* Background Animation and Overlay remain the same */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0.5, rotate: 0 }}
        animate={{ scale: 1.2, opacity: 0.8, rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-purple-500/10 rounded-full blur-3xl opacity-50"
        style={{ width: '150%', height: '150%', left: '-25%', top: '-25%' }}
      ></motion.div>
      <motion.div
        initial={{ scale: 1.2, opacity: 0.5, rotate: 0 }}
        animate={{ scale: 0.8, opacity: 0.8, rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-amber-500/10 rounded-full blur-3xl opacity-50"
        style={{ width: '120%', height: '120%', left: '-10%', top: '-10%', animationDelay: '10s' }}
      ></motion.div>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1518779578619-ed486259e075?q=80&w=2070&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Login/Signup Container - Made wider for full-width feel */}
      <motion.div
        className="relative z-10 bg-gradient-to-b from-gray-900 via-purple-950 to-black text-white rounded-xl p-8 sm:p-10 md:p-12 w-full max-w-xl shadow-2xl border border-gray-800" // Changed max-w-lg to max-w-xl for wider form
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
      >
        <button
          onClick={handleClosePage}
          className="absolute top-4 right-4 text-slate-400 hover:text-amber-400 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl md:text-4xl font-bold text-amber-400 mb-8 text-center">
          {isSignUp ? 'Create Your Account' : 'Welcome Back, Curator'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {isSignUp && (
              <motion.div
                key="name-input"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Username / Full Name
                </label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-10 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                ref={emailInputRef}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={handleEmailChange}
                onKeyDown={handleEmailKeyDown}
                required
                className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-10 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                required
                className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-10 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {isSignUp && passwordError && (
              <p className="text-red-400 text-xs mt-1 flex items-center">
                <CircleAlert className="w-4 h-4 mr-1" /> {passwordError}
              </p>
            )}
          </div>
          <AnimatePresence mode="wait">
            {isSignUp && (
              <motion.div
                key="confirm-password-input"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-10 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <CircleAlert className="w-4 h-4 mr-1" /> Passwords do not match.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || (isSignUp && passwordError !== '') || (isSignUp && password !== confirmPassword)}
            className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-medium transition-colors h-12 px-4 py-2 bg-amber-500 text-black hover:bg-amber-600 shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></span>
                Processing...
              </span>
            ) : isSignUp ? (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Create Account
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-400">
          <p>
            {isSignUp ? 'Already have an account?' : 'Do not have an account?'}
            {' '}
            <button
              type="button"
              onClick={handleToggleForm}
              className="text-amber-400 hover:underline font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-center text-sm mb-4">Or connect with social media</p>
          <div className="flex justify-center gap-4">
            <a href="https://www.facebook.com/profile.php?id=61566909757271" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1877F2] transition-colors">
              <FaFacebook className="w-6 h-6" />
            </a>
            <a href="https://instagram.com/nexelitee" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-purple-600 transition-colors">
              <FaInstagram className="w-6 h-6" />
            </a>
            <a href="https://wa.me/08079379510" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#25D366] transition-colors">
              <FaWhatsapp className="w-6 h-6" />
            </a>
            <a href="https://www.linkedin.com/in/stephen-okwu-396914349/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#005C8D] transition-colors">
              <FaLinkedin className="w-6 h-6" />
            </a>
            <a href="https://twitter.com/chidi_03" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
              <FaXTwitter className="w-6 h-6" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;