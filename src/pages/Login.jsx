import React, { useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { cn } from '@/lib/utils';
import logo from '@/assets/images/be-postive-logo.png';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t('login', 'Login'));
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const isRtl = i18n.dir() === 'rtl';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Mock authentication delay
    setTimeout(() => {
      // Allow demo access with specific credentials or general non-empty values
      if (email === 'admin@bepositive.org' && password === 'admin123' || email && password && email !== 'error@test.com') {
        navigate('/');
      } else {
        setError('invalid_email_or_password');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Language Switcher */}
      <div className={clsx("absolute top-4 z-50", isRtl ? "left-4" : "right-4")}>
        <LanguageSwitcher />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-red-100 mix-blend-multiply filter blur-3xl" />
        
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, -30, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gray-200 mix-blend-multiply filter blur-3xl" />
        
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative z-10">
        
        <div className="p-8 pb-6">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-4 shadow-inner">
              
              <img src={logo} alt="Be Positive Logo" className="h-8 w-8 object-contain" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900">{t('welcome_back', 'Welcome Back')}</h1>
            <p className="text-gray-500 mt-2 text-sm">{t('enter_credentials', 'Enter your credentials to access your account')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error &&
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100">
              
                <AlertCircle size={16} className="shrink-0" />
                <span>{t(error, error)}</span>
              </motion.div>
            }

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('email', 'Email Address')}
              </label>
              <div className="relative group">
                <div className={cn("absolute inset-y-0 flex items-center pointer-events-none transition-colors group-focus-within:text-red-500", isRtl ? "right-0 pr-3" : "left-0 pl-3")}>
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn("block w-full py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50 focus:bg-white outline-none", isRtl ? "pr-10 pl-3" : "pl-10 pr-3")}
                  placeholder="admin@bepositive.org"
                  required />
                
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('password', 'Password')}
                </label>
                <a href="#" className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline">
                  {t('forgot_password', 'Forgot password?')}
                </a>
              </div>
              <div className="relative group">
                <div className={cn("absolute inset-y-0 flex items-center pointer-events-none transition-colors group-focus-within:text-red-500", isRtl ? "right-0 pr-3" : "left-0 pl-3")}>
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn("block w-full py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50 focus:bg-white outline-none", isRtl ? "pr-10 pl-10" : "pl-10 pr-10")}
                  // pr-10 pl-10 because of both icons (startLock and endEye)
                  placeholder="••••••••"
                  required />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn("absolute inset-y-0 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors", isRtl ? "left-0 pl-3" : "right-0 pr-3")}>
                  
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer accent-red-600" />
              
              <label htmlFor="remember-me" className={cn("block text-sm text-gray-700 cursor-pointer select-none", isRtl ? "mr-2" : "ml-2")}>
                {t('remember_me', 'Remember me for 30 days')}
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={clsx(
                "w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2",
                isLoading && "opacity-75 cursor-wait"
              )}>
              
              {isLoading ?
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> :

              <span className="flex items-center gap-2">
                  {t('signin', 'Sign In')} <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
                </span>
              }
            </button>
          </form>

        </div>
      </motion.div>
    </div>);

}