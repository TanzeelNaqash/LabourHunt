import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'wouter';
import Header from './layout/Header';
import Footer from './layout/Footer';
import useAuthStore from '@/store/authStore';
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/UseToast";

const LoginForm = () => {
  const [, setLocation] = useLocation();
  const { login, isLoading, error, setCurrentRole, clearError, checkRoleByPhone } = useAuthStore();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (error) clearError();
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loginData = {
      mobile: formData.phone,
      password: formData.password,
    };
    console.log('handleSubmit called');
    console.log('loginData being sent:', loginData);
    setRoleLoading(true);
    clearError();
    // Auto-detect role
    const detectedRole = await checkRoleByPhone(formData.phone);
    setRoleLoading(false);
    if (!detectedRole) {
      clearError();
      toast({ title: 'No account found with this phone number.', variant: 'destructive' });
      return;
    }
    setCurrentRole(detectedRole);
    try {
      await login(loginData);
      setFormData({ phone: '', password: '' });
      // Redirect based on role
      if (detectedRole === 'worker') setLocation('/worker-dashboard');
      else setLocation('/client-dashboard');
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | LabourHunt</title>
        <meta name="description" content="Login to your LabourHunt account" />
      </Helmet>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-12 flex flex-col gap-6">
          <h1 className="text-3xl md:text-4xl font-bold text-black text-center mb-2">Welcome Back</h1>
          <p className="text-center text-gray-600 mb-6">Sign in to continue to your account</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-black font-medium mb-1">Phone Number</label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
                className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-black font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="text-right mt-2">
              <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm font-medium">
                Forgot password?
              </Link>
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition"
              disabled={isLoading || roleLoading}
            onClick={handleSubmit}>
              {roleLoading ? 'Checking account type...' : isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="text-center text-gray-600">
            Don't have an account? <Link href="/auth" className="text-blue-600 hover:underline">Register now</Link>
          </p>
          <p className="text-center text-gray-600">
            Not an User? <Link href="/admin-login" className="text-blue-600 hover:underline">Login</Link>
          </p>
     
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginForm;

