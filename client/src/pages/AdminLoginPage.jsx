import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, Link } from 'wouter';
import useAuthStore from '@/store/authStore';
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/UseToast";

const AdminLoginPage = () => {
  const [, setLocation] = useLocation();
  const { login, isLoading, error, setCurrentRole, clearError, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/admin-dashboard');
    }
  }, [isAuthenticated, setLocation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (error) clearError();
    if (name === 'password' && value.includes(' ')) {
      return; // Prevent any spaces in password
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCurrentRole('admin');
    try {
      await login({ email: formData.email, password: formData.password });
      setFormData({ email: '', password: '' });
      setLocation('/admin-dashboard');
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login | LabourHunt</title>
        <meta name="description" content="Admin login for LabourHunt" />
      </Helmet>
    
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-12 flex flex-col gap-6">
          <h1 className="text-3xl md:text-4xl font-bold text-black text-center mb-2">Admin Login</h1>
          <p className="text-center text-gray-600 mb-6">Sign in to your admin account</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-black font-medium mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
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
            <p className="text-right text-gray-600">
             <Link href="/admin-forgot-password" className="text-blue-600 hover:underline"> forgot password?</Link>
          </p>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <p className="text-center text-gray-600">
            Not an admin? <Link href="/login" className="text-blue-600 hover:underline"> Login</Link>
          </p>
        </div>
      </div>
 
    </>
  );
};

export default AdminLoginPage; 