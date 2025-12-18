import React, { useState } from 'react';
import { User } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LogIn, Rocket, Mail, Loader2, ArrowRight, Check, Eye, EyeOff } from "lucide-react";

export default function LoginModal({ isOpen, setIsOpen }) {
  const [authMode, setAuthMode] = useState('choice'); // 'choice', 'login', 'signup', 'verify', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleGoogleLogin = () => {
    User.loginWithRedirect(window.location.href);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('נא למלא את כל השדות');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await User.loginWithPassword(email, password);
      setSuccessMessage('התחברת בהצלחה!');
      setTimeout(() => {
        setIsOpen(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('מייל או סיסמה שגויים');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('יש לאמת את המייל קודם. בדוק את תיבת הדואר שלך.');
      } else {
        setError(err.message || 'שגיאה בהתחברות. נסה שוב.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('נא למלא את כל השדות');
      return;
    }
    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await User.signUpWithPassword(email, password, window.location.href);
      if (result.user && !result.user.confirmed_at) {
        setAuthMode('verify');
        setSuccessMessage('נרשמת בהצלחה! שלחנו לך מייל לאימות.');
      } else {
        setSuccessMessage('נרשמת והתחברת בהצלחה!');
        setTimeout(() => {
          setIsOpen(false);
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      if (err.message?.includes('already registered')) {
        setError('כתובת המייל הזו כבר רשומה. נסה להתחבר.');
      } else {
        setError(err.message || 'שגיאה בהרשמה. נסה שוב.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('נא להזין כתובת מייל');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await User.resetPassword(email, window.location.href);
      setSuccessMessage('שלחנו לך מייל לאיפוס הסיסמה');
    } catch (err) {
      setError(err.message || 'שגיאה בשליחת המייל. נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setAuthMode('choice');
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMessage('');
    setShowPassword(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetModal(); }}>
      <DialogContent className="sm:max-w-[425px] bg-white border-gray-200 text-gray-900 hebrew-font" dir="rtl">
        <DialogHeader className="text-center">
          <div className="mx-auto bg-gradient-to-br from-purple-100 to-teal-100 border border-gray-200 rounded-full p-3 w-fit mb-4">
            <Rocket className="w-8 h-8 text-purple-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
            {authMode === 'choice' && 'כמעט שם!'}
            {authMode === 'login' && 'התחברות'}
            {authMode === 'signup' && 'הרשמה'}
            {authMode === 'verify' && 'אמת את המייל שלך'}
            {authMode === 'forgot' && 'שכחתי סיסמה'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 pt-2 text-center">
            {authMode === 'choice' && (
              <>
                כדי ליצור קאברים ויראליים, צריך להתחבר למערכת.
                <br />
                בחר את אופן ההתחברות המועדף עליך.
              </>
            )}
            {authMode === 'login' && 'הזן את פרטי ההתחברות שלך'}
            {authMode === 'signup' && 'צור חשבון חדש'}
            {authMode === 'verify' && (
              <>
                שלחנו לינק אימות ל-<strong>{email}</strong>
                <br />
                לחץ על הלינק במייל כדי להשלים את ההרשמה
              </>
            )}
            {authMode === 'forgot' && 'נשלח לך לינק לאיפוס הסיסמה'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <Check className="w-4 h-4" />
            {successMessage}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {authMode === 'choice' && (
            <>
              <Button
                onClick={handleGoogleLogin}
                className="w-full h-12 text-base bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
              >
                <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                התחברות עם Google
              </Button>

              <Button
                onClick={() => User.loginWithFacebook(window.location.href)}
                className="w-full h-12 text-base bg-[#1877F2] hover:bg-[#166FE5] text-white border-0"
              >
                <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                התחברות עם Facebook
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">או</span>
                </div>
              </div>

              <Button
                onClick={() => setAuthMode('login')}
                variant="outline"
                className="w-full h-12 text-base border-gray-300 hover:bg-gray-50"
              >
                <Mail className="w-5 h-5 ml-2" />
                התחברות עם מייל וסיסמה
              </Button>
            </>
          )}

          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="כתובת המייל שלך"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
                dir="ltr"
                disabled={isLoading}
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="סיסמה"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base pr-12"
                  dir="ltr"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base btn-gradient text-white shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                ) : (
                  <LogIn className="w-5 h-5 ml-2" />
                )}
                {isLoading ? 'מתחבר...' : 'התחבר'}
              </Button>
              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setError(''); }}
                  className="text-purple-600 hover:text-purple-700"
                >
                  אין לך חשבון? הירשם
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('forgot'); setError(''); }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  שכחתי סיסמה
                </button>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setAuthMode('choice'); setError(''); }}
                className="w-full text-gray-500 hover:text-gray-700"
              >
                חזרה
              </Button>
            </form>
          )}

          {authMode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <Input
                type="email"
                placeholder="כתובת המייל שלך"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
                dir="ltr"
                disabled={isLoading}
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="בחר סיסמה (לפחות 6 תווים)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base pr-12"
                  dir="ltr"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base btn-gradient text-white shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                ) : (
                  <ArrowRight className="w-5 h-5 ml-2" />
                )}
                {isLoading ? 'נרשם...' : 'הירשם'}
              </Button>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(''); }}
                className="w-full text-sm text-purple-600 hover:text-purple-700"
              >
                כבר יש לך חשבון? התחבר
              </button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setAuthMode('choice'); setError(''); }}
                className="w-full text-gray-500 hover:text-gray-700"
              >
                חזרה
              </Button>
            </form>
          )}

          {authMode === 'verify' && (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600">
                בדוק את המייל שלך ולחץ על לינק האימות.
                <br />
                <span className="text-sm text-gray-500">בדוק גם בתיקיית הספאם</span>
              </p>
              <Button
                type="button"
                onClick={() => { setAuthMode('login'); setSuccessMessage(''); }}
                className="w-full h-12 text-base btn-gradient text-white shadow-lg"
              >
                אימתתי, אני רוצה להתחבר
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAuthMode('choice')}
                className="w-full text-gray-500 hover:text-gray-700"
              >
                חזרה
              </Button>
            </div>
          )}

          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Input
                type="email"
                placeholder="כתובת המייל שלך"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
                dir="ltr"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || successMessage}
                className="w-full h-12 text-base btn-gradient text-white shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                ) : (
                  <Mail className="w-5 h-5 ml-2" />
                )}
                {isLoading ? 'שולח...' : 'שלח לינק איפוס'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setAuthMode('login'); setError(''); setSuccessMessage(''); }}
                className="w-full text-gray-500 hover:text-gray-700"
              >
                חזרה להתחברות
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}