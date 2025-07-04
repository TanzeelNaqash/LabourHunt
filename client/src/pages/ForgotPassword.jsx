import { useState, useEffect } from "react";
import PhoneEmailAuth from "@/components/PhoneEmailAuth";
import useAuthStore from "@/store/authStore";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/UseToast";
import { useLocation } from "wouter";
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Helper to get the national (local) number from any international phone number
function getNationalNumber(phone) {
  const phoneNumber = parsePhoneNumberFromString(phone);
  if (phoneNumber) {
    return phoneNumber.nationalNumber;
  }
  // fallback: remove leading + and digits up to 10-12 digits
  return phone.replace(/^\+?\d{1,4}/, '');
}

const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/;

export default function ForgotPassword() {
  const verifiedPhone = useAuthStore((state) => state.verifiedPhone);
  const clearVerifiedPhone = useAuthStore((state) => state.clearVerifiedPhone);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const checkRoleByPhone = useAuthStore((state) => state.checkRoleByPhone);
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState({ new: false, confirm: false });
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [roleLoading, setRoleLoading] = useState(false);
  const [detectedRole, setDetectedRole] = useState(null);

  useEffect(() => {
    clearVerifiedPhone();
    // eslint-disable-next-line
  }, []);

  // Auto-detect role after phone is verified
  useEffect(() => {
    async function detectRole() {
      if (typeof verifiedPhone === 'string' && verifiedPhone.length >= 8) {
        setRoleLoading(true);
        setError("");
        const nationalMobile = getNationalNumber(verifiedPhone);
        const foundRole = await checkRoleByPhone(nationalMobile);
        setDetectedRole(foundRole);
        setRoleLoading(false);
        if (!foundRole) {
          setError("No account found with this phone number.");
        }
      }
    }
    detectRole();
    // eslint-disable-next-line
  }, [verifiedPhone]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordRegex.test(form.newPassword)) {
      toast({ title: "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character.", variant: "destructive" });
      return;
    }
    const nationalMobile = getNationalNumber(verifiedPhone);
    if (!nationalMobile || nationalMobile.length < 6) {
      toast({ title: "Invalid phone number", description: "Please enter a valid phone number.", variant: "destructive" });
      return;
    }
    if (!detectedRole) {
      setError("No account found with this phone number.");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const nationalMobile = getNationalNumber(verifiedPhone);
      await resetPassword({ mobile: nationalMobile, newPassword: form.newPassword, role: detectedRole });
      toast({ title: "Password reset successful!", description: "You can now log in with your new password." });
      setTimeout(() => {
        clearVerifiedPhone();
        setLocation('/login');
      }, 1200);
      setForm({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('not found')) {
        toast({ title: "User not found", description: "No user exists with this phone number.", variant: "destructive" });
      } else {
        setError(err.message || "Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Only show PhoneEmailAuth (no extra card/container) if phone is not verified
  if (typeof verifiedPhone !== "string" || verifiedPhone.length < 8) {
    return (
      <>
        <Helmet>
          <title>Forgot Password | LabourHunt</title>
          <meta name="description" content="Reset your password for LabourHunt" />
        </Helmet>
        <Header />
        <PhoneEmailAuth 
          redirectTo="/forgot-password"
          title="Phone Verification for Password Reset"
          description="Please verify your phone number to reset your password."
        />
        <Footer />
      </>
    );
  }

  // If phone is verified, show the reset password form in the card
  return (
    <>
      <Helmet>
        <title>Forgot Password | LabourHunt</title>
        <meta name="description" content="Reset your password for LabourHunt" />
      </Helmet>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-10 md:p-16 flex flex-col gap-6">
          <h1 className="text-3xl md:text-4xl font-bold text-black text-center mb-2">Reset Your Password</h1>
          <p className="text-center text-gray-600 mb-6">Set a new password to regain access to your account.</p>
          {roleLoading ? (
            <div className="text-center text-blue-600 font-medium py-8">Checking account type...</div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-black font-medium mb-1">Phone Number</label>
              <input
                name="phone"
                value={getNationalNumber(verifiedPhone) || ''}
                disabled
                className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 cursor-not-allowed opacity-80"
              />
            </div>
            <label className="block text-black font-medium mb-1">New Password</label>
            <div className="relative">
              <input
                name="newPassword"
                type={showPassword.new ? "text" : "password"}
                value={form.newPassword}
                onChange={handleChange}
                required
                className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowPassword((prev) => ({ ...prev, new: !prev.new }))}
                tabIndex={-1}
              >
                {showPassword.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div>
              <label className="block text-black font-medium mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showPassword.confirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))}
                  tabIndex={-1}
                >
                  {showPassword.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {success && <p className="text-green-600 text-sm text-center">{success}</p>}
            <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition" disabled={isLoading || !detectedRole}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
} 