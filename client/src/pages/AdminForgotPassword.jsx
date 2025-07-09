import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useState, useRef, useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { useToast } from "@/hooks/UseToast";
import clsx from "clsx";
import { useLocation } from 'wouter';

const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export default function AdminForgotPassword() {
  const { requestAdminOtp, verifyAdminOtp, resetAdminPasswordWithOtp } = useAuthStore();
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: reset
  const [formData, setFormData] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);
  const [, setLocation] = useLocation();

  const handleChange = (e) => {
    if ((e.target.name === 'newPassword' || e.target.name === 'confirmPassword') && e.target.value.includes(' ')) {
      return; // Prevent spaces in password fields
    }
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await requestAdminOtp(formData.email);
      toast({ title: 'OTP sent to your email.' });
      setStep(2);
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // OTP input handlers
  const handleChangeOtp = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      handleVerifyOtp(otpValue);
    }
  }, [otp]);

  const handleVerifyOtp = async (otpValue) => {
    if (!formData.email.trim() || otpValue.length !== 6) {
      return;
    }
    try {
      setIsLoading(true);
      setError(false);
      setSuccess(false);
      await verifyAdminOtp({ email: formData.email, otp: otpValue });
      setFormData(prev => ({ ...prev, otp: otpValue }));
      toast({
        title: "OTP Verified!",
        description: "You can now reset your password.",
        variant: "success",
      });
      setSuccess(true);
      setStep(3);
    } catch (error) {
      setError(true);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      toast({
        title: "Invalid OTP!",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
      triggerVibration();
    } finally {
      setIsLoading(false);
    }
  };

  const triggerVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    setTimeout(() => setError(false), 600);
  };

  useEffect(() => {
    if (step === 2) {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwordRegex.test(formData.newPassword)) {
      toast({ title: 'Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character.', variant: 'destructive' });
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast({ title: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await resetAdminPasswordWithOtp({ email: formData.email, otp: formData.otp, newPassword: formData.newPassword });
      toast({ title: 'Password reset successful! You can now log in.' });
      setTimeout(() => setLocation('/admin-login'), 1200);
      setStep(1);
      setFormData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Forgot Password - LabourHunt</title>
        <meta name="description" content="Admin forgot password page" />
      </Helmet>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-10 md:p-16 flex flex-col gap-6">
          <h1 className="text-3xl md:text-4xl font-bold text-black text-center mb-2">Admin Forgot Password</h1>
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-black font-medium mb-1">Email</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 o" placeholder="Enter your admin email" />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}
          {step === 2 && (
            <div className="flex justify-center px-2 sm:px-4">
               <div className="bg-white border-2 border-white shadow-[0px_10px_30px_rgba(0,0,0,0.3)] w-full max-w-md sm:max-w-lg rounded-2xl p-4 sm:p-6 md:p-10 text-center my-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-4">Verify OTP</h1>
                <p className="text-gray-600 mb-6 text-sm md:text-base">Enter the OTP sent to your email.</p>
                <div className={clsx("flex justify-center gap-1 sm:gap-2 mb-4", { "animate-shake": error })}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => (inputRefs.current[index] = el)}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={e => handleChangeOtp(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      className={clsx(
                        "w-9 h-9 sm:w-12 sm:h-12 text-base sm:text-xl border rounded-lg text-center focus:outline-none transition",
                        {
                          "border-red-500": error,
                          "border-green-500": success,
                          "border-gray-300": !error && !success,
                        },
                        "focus:ring-2 focus:ring-blue-500"
                      )}
                    />
                  ))}
                </div>
                {isLoading && <p className="text-gray-500">Verifying...</p>}
                <button
                  onClick={() => setStep(1)}
                  className="mt-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg transition w-full md:w-auto"
                >
                  Back
                </button>
              </div>
            </div>
          )}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-black font-medium mb-1">New Password</label>
                <input name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 o" placeholder="New password" />
              </div>
              <div>
                <label className="block text-black font-medium mb-1">Confirm New Password</label>
                <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 o" placeholder="Confirm new password" />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button
                type="button"
                className="w-full text-blue-600 hover:underline mt-2"
                onClick={() => setStep(1)}
              >
                Back to Email
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
