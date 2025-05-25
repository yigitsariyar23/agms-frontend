"use client"

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from 'lucide-react';

// Loading component
const AuthPageLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F4F2F9] dark:bg-[#2E2E2E]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B3E96] mx-auto"></div>
      <p className="mt-4 text-[#6D6D6D] dark:text-[#A9A9A9]">Loading authentication...</p>
    </div>
  </div>
);

interface LoginContentsProps {
  onOpenResetModal: () => void
  onShowError: (message: string, title?: string) => void
}

// Auth page content with search params
const AuthPageContent = ({ onOpenResetModal, onShowError }: LoginContentsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("/dashboard");
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{email?: string, password?: string}>({});

  // Get the callback URL from search params
  useEffect(() => {
    const callback = searchParams.get("callbackUrl");
    if (callback) {
      setCallbackUrl(callback);
    }
  }, [searchParams]);

  // Check for stored email on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('rememberedEmail');
    if (storedEmail) {
      setLoginEmail(storedEmail);
      setRememberMe(true);
    }
  }, []);

  // Validation functions
  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address';
    if (!email.endsWith('@iyte.edu.tr') && !email.endsWith('@std.iyte.edu.tr')) {
      return 'Please use @iyte.edu.tr or @std.iyte.edu.tr email domain';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  // Handle login button click
  const handleLoginSubmit = () => {
    // Validate form
    const emailError = validateEmail(loginEmail);
    const passwordError = validatePassword(loginPassword);
    
    if (emailError || passwordError) {
      setLoginErrors({ email: emailError, password: passwordError });
      return;
    }
    
    setLoginErrors({});
    
    // Handle async login
    handleAsyncLogin();
  };

  const handleAsyncLogin = async () => {
    setIsLoading(true);
    try {
      // Store email in localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', loginEmail);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      const result = await login(loginEmail, loginPassword);
      
      if (result.success) {
        router.push(callbackUrl);
      } else {
        console.log('Login failed, showing error:', result.message);
        onShowError(result.message, "Login Failed");
      }
    } catch (error) {
      console.log('Login caught error:', error);
      let message = 'An error occurred during login';
      
      if (error instanceof Error) {
        message = error.message;
      }
      
      console.log('Showing error from catch:', message);
      onShowError(message, "Login Failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex w-full h-full bg-[#FFFFFF] dark:bg-[#2E2E2E]">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 bg-[#FFFFFF] dark:bg-[#2E2E2E] flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center flex-col">
          <div className="text-[#5B3E96] dark:text-[#937DC7] text-3xl font-bold mb-8">AGMS</div>
          
          <div className="w-full px-6 max-w-sm mx-auto border-[#DCD9E4] dark:border-[#4A4A4A] pt-4 pb-4 rounded-4xl border-2 shadow-md bg-[#FFFFFF] dark:bg-[#3E3E3E] h-[400px]">
            <div className="space-y-3 p-2">
              <h2 className="text-xl font-bold text-[#2E2E2E] dark:text-[#F4F2F9]">Login</h2>
              <p className="text-sm text-[#6D6D6D] dark:text-[#A9A9A9]">Please sign in to your account</p>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MailIcon className="h-4 w-4 text-[#6D6D6D] dark:text-[#A9A9A9]" />
                    </div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        if (loginErrors.email) {
                          setLoginErrors(prev => ({ ...prev, email: '' }));
                        }
                      }}
                      className={`w-full pl-9 pr-3 py-2 rounded-full bg-[#FFFFFF] dark:bg-[#3E3E3E] text-[#2E2E2E] dark:text-[#F4F2F9] text-sm border border-[#DCD9E4] dark:border-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-[#5B3E96] dark:focus:ring-[#937DC7] focus:border-transparent hover:border-[#BEBBCF] dark:hover:border-[#5C5C5C] transition-colors ${
                        loginErrors.email ? "ring-2 ring-[#E57373] border-transparent" : ""
                      }`}
                    />
                  </div>
                  <div className="min-h-[16px] mt-0.5">
                    {loginErrors.email && (
                      <p className="text-[#E57373] text-xs">{loginErrors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockIcon className="h-4 w-4 text-[#6D6D6D] dark:text-[#A9A9A9]" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (loginErrors.password) {
                          setLoginErrors(prev => ({ ...prev, password: '' }));
                        }
                      }}
                      className={`w-full pl-9 pr-9 py-2 rounded-full bg-[#FFFFFF] dark:bg-[#3E3E3E] text-[#2E2E2E] dark:text-[#F4F2F9] text-sm border border-[#DCD9E4] dark:border-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-[#5B3E96] dark:focus:ring-[#937DC7] focus:border-transparent hover:border-[#BEBBCF] dark:hover:border-[#5C5C5C] transition-colors ${
                        loginErrors.password ? "ring-2 ring-[#E57373] border-transparent" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6D6D6D] dark:text-[#A9A9A9] hover:cursor-pointer"
                    >
                      {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                    </button>
                  </div>
                  <div className="min-h-[16px] mt-0.5">
                    {loginErrors.password && (
                      <p className="text-[#E57373] text-xs">{loginErrors.password}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-3 w-3 text-[#5B3E96] dark:text-[#937DC7] focus:ring-[#5B3E96] dark:focus:ring-[#937DC7] border-[#DCD9E4] dark:border-[#4A4A4A] rounded hover:cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-xs text-[#6D6D6D] dark:text-[#A9A9A9] hover:cursor-pointer">
                      Remember Me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenResetModal}
                    className="text-xs text-[#6D6D6D] dark:text-[#A9A9A9] hover:text-[#2E2E2E] dark:hover:text-[#F4F2F9] hover:cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleLoginSubmit}
                  disabled={isLoading}
                  className="w-full py-2 rounded-full bg-[#5B3E96] dark:bg-[#7A5FB8] text-white text-sm font-medium hover:bg-[#49317A] dark:hover:bg-[#5B3E96] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Login'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image only */}
      <div className="hidden lg:block lg:w-1/2 relative p-8">
        <div className="w-full h-full relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#7A5FB8] to-[#5B3E96]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <h1 className="text-4xl font-bold mb-4">Welcome to AGMS</h1>
              <p className="text-xl opacity-90">Academic Graduation Management System</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component with suspense boundary
export function LoginContents({ onOpenResetModal, onShowError }: LoginContentsProps) {
  return (
    <Suspense fallback={<AuthPageLoading />}>
      <AuthPageContent onOpenResetModal={onOpenResetModal} onShowError={onShowError} />
    </Suspense>
  );
}
