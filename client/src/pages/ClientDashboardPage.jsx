import { Helmet } from "react-helmet";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from 'react-select';
import { Country, State } from 'country-state-city';
import { useDropzone } from 'react-dropzone';
import { useLocation } from 'wouter';
import { User, LogOut, Edit, Search, CheckCircle, Key, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {useToast} from "@/hooks/UseToast";

import useAuthStore from "@/store/authStore";
import { queryClient } from '@/lib/queryClient';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatboxMobile from "@/components/layout/ChatboxMobile";

export default function ClientDashboardPage() {
  const [, setLocation] = useLocation();
  const { logout, isAuthenticated, user, currentRole } = useAuthStore();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("overview");
  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/v1/users/me"],
    enabled: isAuthenticated && !!user,
  });
  const [editProfile, setEditProfile] = useState({
    firstName: "",
    lastName: "",
    age: "",
    address: "",
    country: "",
    state: "",
    profileImage: null,
  });
  const [editPassword, setEditPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [countryOptions] = useState(Country.getAllCountries().map(c => ({ value: c.isoCode, label: c.name })));
  const [stateOptions, setStateOptions] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [fileError, setFileError] = useState('');

  const setUser = useAuthStore((state) => state.setUser);
  const setVerifiedPhone = useAuthStore((state) => state.setVerifiedPhone);
  const { updateProfile, updatePassword } = useAuthStore();

  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/;

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation]);

  useEffect(() => {
    if (isAuthenticated && currentRole && currentRole !== 'client') {
      // Redirect to appropriate dashboard based on role
      if (currentRole === 'worker') {
        setLocation('/worker-dashboard');
      } else if (currentRole === 'admin') {
        setLocation('/admin-dashboard');
      }
    }
  }, [isAuthenticated, currentRole, setLocation]);

  useEffect(() => {
    if (userData) {
      setEditProfile({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        address: userData.address || "",
        country: userData.country || "",
        state: userData.state || "",
        age: userData.age || "",
        profileImage: null,
      });
      if (userData.country) {
        const states = State.getStatesOfCountry(userData.country);
        setStateOptions(states.map(s => ({ value: s.isoCode, label: s.name })));
      }
      setPreviewImage(userData.profileImage || null);
      setUser(userData);
      setVerifiedPhone(userData.mobile || null);
    }
  }, [userData]);

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    if (['firstName', 'lastName'].includes(name)) {
      if (value.length === 1 && value === ' ') return; // Prevent starting with space
    }
    if (name === 'age') {
      let age = value.replace(/[^0-9]/g, '');
      if (age.length > 2) age = age.slice(0, 2);
      setEditProfile(prev => ({ ...prev, age }));
      return;
    }
    if (name === 'mobile') {
      let mobile = value.replace(/[^0-9]/g, '');
      if (mobile.startsWith('0')) mobile = mobile.slice(1);
      if (mobile.length > 10) mobile = mobile.slice(0, 10);
      setEditProfile(prev => ({ ...prev, mobile }));
      return;
    }
    if (name === "profileImage" && files && files[0]) {
      setEditProfile((prev) => ({ ...prev, profileImage: files[0] }));
    } else {
      setEditProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (editProfile.age < 18 || editProfile.age > 80) {
      toast({ title: "Age must be between 18 and 80.", variant: "destructive" });
      return;
    }
    try {
      const formData = {
        ...editProfile,
        address: editProfile.address.trim(),
      };
      const updated = await updateProfile(formData);
      toast({ title: "Profile updated!" });
      queryClient.setQueryData(["/api/v1/users/me"], updated);
    } catch (err) {
      toast({ title: err.message, variant: "destructive" });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    if ((name === 'newPassword' || name === 'confirmPassword' || name === 'currentPassword') && value.includes(' ')) {
      return; // Prevent spaces in password fields
    }
    setEditPassword((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordRegex.test(editPassword.newPassword)) {
      toast({ title: "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character.", variant: "destructive" });
      return;
    }
    if (editPassword.newPassword !== editPassword.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    try {
      await updatePassword({
        currentPassword: editPassword.currentPassword,
        newPassword: editPassword.newPassword,
      });
      toast({ title: "Password updated!" });
      setEditPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast({ title: err.message, variant: "destructive" });
    }
  };

  const handleTogglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleCountryChange = (selected) => {
    setEditProfile(prev => ({ ...prev, country: selected ? selected.value : '', state: '' }));
    if (selected) {
      const states = State.getStatesOfCountry(selected.value);
      setStateOptions(states.map(s => ({ value: s.isoCode, label: s.name })));
    } else {
      setStateOptions([]);
    }
  };

  const handleStateChange = (selected) => {
    setEditProfile(prev => ({ ...prev, state: selected ? selected.value : '' }));
  };

  const onDropImage = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFileError('File size should be less than 5MB');
        return;
      }
      setFileError('');
      setEditProfile(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: onDropImage, accept: { 'image/*': [] } });

  const removeImage = () => {
    setEditProfile(prev => ({ ...prev, profileImage: null }));
    setPreviewImage(null);
  };

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  if (isLoading || !isAuthenticated || !user) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
  const fullName = userData
    ? `${userData.firstName || ""} ${userData.lastName || ""}`.trim()
    : "User";

  return (
    <>
      <Helmet>
        <title>Client Dashboard - LabourHunt</title>
        <meta name="description" content="Manage your account, view saved workers, and access your messages on the LabourHunt platform." />
        <meta property="og:title" content="Client Dashboard - LabourHunt" />
        <meta property="og:description" content="Manage your account on the LabourHunt platform." />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8 bg-[#F3F2EF]">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-neutral-700">Welcome back, {userData?.firstName}! Manage your account and find skilled workers.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <Card className="lg:col-span-1">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center mb-6">
                    <Avatar className="h-20 w-20 mb-4 border-4 border-primary/20 shadow-lg bg-white hover:shadow-xl transition-shadow duration-200">
                      <AvatarImage src={userData?.profileImage} alt={fullName} className="object-cover" />
                      <AvatarFallback className="text-2xl font-bold bg-primary text-white">
                        {userData?.firstName?.[0] || ''}{userData?.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">{userData?.firstName} {userData?.lastName}</h2>
                    <p className="text-neutral-600">{userData?.email}</p>
                  </div>
                  <nav className="space-y-1">
                    <Button variant={activeSection === "profile" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveSection("profile")}> <div className="flex items-center"><User className="mr-2 h-5 w-5" /><span>Profile</span></div></Button>
                    <Button variant={activeSection === "security" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveSection("security")}> <div className="flex items-center"><Key className="mr-2 h-5 w-5" /><span>Security</span></div></Button>
                    <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleLogout}><div className="flex items-center"><LogOut className="mr-2 h-5 w-5" /><span>Logout</span></div></Button>
                  </nav>
                </CardContent>
              </Card>
              {/* Main Content */}
              <div className="lg:col-span-3">
                {activeSection === "profile" && (
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveSection("overview")}
                        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                        aria-label="Back"
                      >
                        <ArrowLeft className="h-5 w-5 text-gray-500" />
                      </button>
                      <CardTitle>Edit Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-5" onSubmit={handleProfileSubmit}>
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <label className="block text-black font-medium mb-1">First Name</label>
                            <input name="firstName" value={editProfile.firstName} onChange={handleProfileChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="First name" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-black font-medium mb-1">Last Name</label>
                            <input name="lastName" value={editProfile.lastName} onChange={handleProfileChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Last name" />
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <label className="block text-black font-medium mb-1">Age</label>
                            <input name="age" type="number" value={editProfile.age} onChange={handleProfileChange} required min={18} max={80} className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Age (18-80)" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-black font-medium mb-1">Address</label>
                          <input name="address" value={editProfile.address} onChange={handleProfileChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Address" />
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <label className="block text-black font-medium mb-1">Country</label>
                            <Select options={countryOptions} value={countryOptions.find(opt => opt.value === editProfile.country) || null} onChange={handleCountryChange} placeholder="Select country" classNamePrefix="react-select" isClearable />
                          </div>
                          <div className="flex-1">
                            <label className="block text-black font-medium mb-1">State</label>
                            <Select options={stateOptions} value={stateOptions.find(opt => opt.value === editProfile.state) || null} onChange={handleStateChange} placeholder="Select state" classNamePrefix="react-select" isClearable isDisabled={!editProfile.country} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-black font-medium mb-1">Profile Image</label>
                          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-4 flex items-center gap-4 mt-2 cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                            <input {...getInputProps()} />
                            {previewImage ? (
                              <>
                                <img src={previewImage} alt="Preview" className="h-16 w-16 rounded-full object-cover border-2 border-primary" />
                                <button type="button" onClick={removeImage} className="ml-2 text-red-500 hover:text-red-700 font-semibold">Remove</button>
                              </>
                            ) : (
                              <span className="text-gray-500">Drag & drop or click to select an image (max 5MB)</span>
                            )}
                          </div>
                          {fileError && <div className="text-red-500 text-sm mt-1">{fileError}</div>}
                        </div>
                        <div className="flex justify-end gap-2">
                          <button type="submit" className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-lg transition">Save Changes</button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
                {activeSection === "security" && (
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveSection("overview")}
                        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                        aria-label="Back"
                      >
                        <ArrowLeft className="h-5 w-5 text-gray-500" />
                      </button>
                      <CardTitle>Change Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                        <div>
                          <label className="block text-sm font-medium mb-1">Current Password</label>
                          <div className="relative">
                            <Input
                              type={showPassword.current ? "text" : "password"}
                              name="currentPassword"
                              value={editPassword.currentPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                              onClick={() => handleTogglePassword("current")}
                              tabIndex={-1}
                            >
                              {showPassword.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">New Password</label>
                          <div className="relative">
                            <Input
                              type={showPassword.new ? "text" : "password"}
                              name="newPassword"
                              value={editPassword.newPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                              onClick={() => handleTogglePassword("new")}
                              tabIndex={-1}
                            >
                              {showPassword.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                          <div className="relative">
                            <Input
                              type={showPassword.confirm ? "text" : "password"}
                              name="confirmPassword"
                              value={editPassword.confirmPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                              onClick={() => handleTogglePassword("confirm")}
                              tabIndex={-1}
                            >
                              {showPassword.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="submit">Update Password</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
                {activeSection === "overview" && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle>Account Status</CardTitle>
                          <CardDescription>Your account verification status</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <div className="bg-secondary/10 p-3 rounded-full">
                              <CheckCircle className="h-6 w-6 text-secondary" />
                            </div>
                            <div className="ml-4">
                              <p className="font-medium">Fully Verified</p>
                              <p className="text-sm text-neutral-600">Your account is verified and active</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                )}
              </div>
            </div>
          </div>
        </main>
        <ChatboxMobile/>
        <Footer />
      </div>
    </>
  );
}