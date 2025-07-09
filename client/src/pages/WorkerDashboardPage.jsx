import { Helmet } from "react-helmet";
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { useLocation } from "wouter";
import Select from 'react-select';
import { Country, State } from 'country-state-city';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  User,
  LogOut,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Key,
  Eye,
  EyeOff,
  Upload,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/UseToast";

import useAuthStore from "@/store/authStore";
import { queryClient } from "@/lib/queryClient";
import workerCategories from "@/assets/workerCategories";
import ChatboxMobile from "@/components/layout/ChatboxMobile";

const startsWithFilter = (option, inputValue) =>
  option.label.toLowerCase().startsWith(inputValue.toLowerCase());

const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export default function WorkerDashboardPage() {
  const { logout } = useAuthStore();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("overview");
  const { worker, updateProfile, updatePassword, setWorker, isAuthenticated } = useAuthStore();
  const [, setLocation] = useLocation();

  const [editProfile, setEditProfile] = useState({
    username: "",
    age: "",
    address: "",
    category: "",
    otherCategory: "",
    country: "",
    state: "",
    profileImage: null,
    idProof: null,
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
  const [previewImage, setPreviewImage] = useState(null);
  const [fileError, setFileError] = useState("");
  const [idProofPreview, setIdProofPreview] = useState(null);
  const [countryOptions] = useState(
    Country.getAllCountries().map(country => ({
      value: country.isoCode,
      label: country.name
    }))
  );
  const [stateOptions, setStateOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const workerCategoriesWithOther = [
    ...workerCategories,
    { value: 'other', label: 'Other' }
  ];

  const { data: workerData, isLoading, isError, error } = useQuery({
    queryKey: ["/api/v1/workers/me"],
    enabled: isAuthenticated && !!worker,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
    if (!worker) {
      setLocation('/login');
      return;
    }
  }, [isAuthenticated, worker, setLocation]);

  useEffect(() => {
    if (workerData) {
      // First set the country to trigger state options update
      const country = workerData.country || "";
      if (country) {
        const states = State.getStatesOfCountry(country);
        setStateOptions(states.map(s => ({ value: s.isoCode, label: s.name })));
      }

      // Then set all profile data
      const profileData = {
        username: workerData.username || "",
        age: workerData.age || "",
        address: workerData.area || "",
        category: workerData.category || "",
        otherCategory: workerData.otherCategory || "",
        country: country,
        state: workerData.state || "",
        profileImage: null,
        idProof: null,
      };
      setEditProfile(profileData);

      setPreviewImage(workerData.photo || null);
      setIdProofPreview(workerData.photoid || null);
    }
  }, [workerData]);

  // Update state options whenever country changes
  useEffect(() => {
    if (editProfile.country) {
      const states = State.getStatesOfCountry(editProfile.country);
      setStateOptions(states.map(s => ({ value: s.isoCode, label: s.name })));
    } else {
      setStateOptions([]);
    }
  }, [editProfile.country]);

  useEffect(() => {
    useAuthStore.setState({ currentRole: 'worker' });
  }, []);

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error loading profile",
        description: error?.message || "Failed to load worker profile",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

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
        setFileError("File size should be less than 5MB");
        return;
      }
      setFileError("");
      setEditProfile((prev) => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropImage,
    accept: { "image/*": [] },
  });

  const onDropDoc = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setFileError('File size should be less than 10MB');
        return;
      }
      setFileError('');
      setEditProfile((prev) => ({ ...prev, idProof: file }));
      setIdProofPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    }
  }, []);

  const { getRootProps: getDocRootProps, getInputProps: getDocInputProps, isDragActive: isDocDragActive } = useDropzone({
    onDrop: onDropDoc,
    accept: { 'image/*': [], 'application/pdf': [] },
  });

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  if (!isAuthenticated || !worker) {
    return null;
  }

  if (isError) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8 bg-[#F3F2EF]">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center h-[60vh]">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-lg text-gray-600">Loading your profile...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    if (['firstName', 'lastName', 'username'].includes(name)) {
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
    if ((name === "profileImage" || name === "idProof") && files && files[0]) {
      setEditProfile((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setEditProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("handleProfileSubmit called");
    try {
      if (editProfile.age < 18 || editProfile.age > 80) {
        toast({ title: "Age must be between 18 and 80.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      const updateObj = {
        username: editProfile.username,
        age: editProfile.age,
        address: editProfile.address.trim(),
        category: editProfile.category === 'other' ? editProfile.otherCategory : editProfile.category,
        country: editProfile.country,
        state: editProfile.state,
        profileImage: editProfile.profileImage,
        idProof: (workerData?.status === 'rejected' ? editProfile.idProof : null),
        status: (workerData?.status === 'rejected' && editProfile.idProof) ? 'pending' : undefined,
      };
      console.log("Submitting updateObj:", updateObj);
      const updated = await updateProfile(updateObj);
      let resubmitted = (workerData?.status === 'rejected' && editProfile.idProof);
      if (resubmitted) {
        setWorker({ ...workerData, status: 'pending' });
        queryClient.setQueryData(["/api/v1/workers/me"], { ...workerData, status: 'pending' });
      } else {
        queryClient.setQueryData(["/api/v1/workers/me"], updated);
      }
      toast({ 
        title: resubmitted ? "ID proof resubmitted! Your account is now pending verification." : "Profile updated!",
        variant: "default"
      });
    } catch (err) {
      if (err.message && err.message.includes('limit of 2 verification requests')) {
        toast({
          title: 'Verification Request Limit',
          description: err.message,
          variant: 'destructive',
        });
      } else {
      toast({ title: err.message, variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
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
      setEditPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast({ title: err.message, variant: "destructive" });
    }
  };

  const handleTogglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const removeImage = () => {
    setEditProfile((prev) => ({ ...prev, profileImage: null }));
    setPreviewImage(null);
  };

  const fullName = workerData ? workerData.username : "Worker";

  return (
    <>
      <Helmet>
        <title>Worker Dashboard - LabourHunt</title>
        <meta
          name="description"
          content="Manage your worker account, update your profile, and view your status on the LabourHunt platform."
        />
        <meta property="og:title" content="Worker Dashboard - LabourHunt" />
        <meta
          property="og:description"
          content="Manage your worker account on the LabourHunt platform."
        />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8 bg-[#F3F2EF]">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Worker Dashboard</h1>
              <p className="text-neutral-700">
                Welcome back, {workerData?.username}! Manage your worker profile
                and see your status.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <Card className="lg:col-span-1">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center mb-6">
                    <Avatar className="h-20 w-20 mb-4 border-4 border-primary/20 shadow-lg bg-white hover:shadow-xl transition-shadow duration-200">
                      <AvatarImage
                        src={workerData?.photo || previewImage}
                        alt={fullName}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-2xl font-bold bg-primary text-white">
                        {workerData?.username?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">
                      {workerData?.username}
                    </h2>
                    </div>
                  <nav className="space-y-1">
                    <Button
                      variant={
                        activeSection === "profile" ? "secondary" : "ghost"
                      }
                      className="w-full justify-start"
                      onClick={() => setActiveSection("profile")}
                    >
                      {" "}
                      <div className="flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        <span>Profile</span>
                      </div>
                    </Button>
                    <Button
                      variant={
                        activeSection === "security" ? "secondary" : "ghost"
                      }
                      className="w-full justify-start"
                      onClick={() => setActiveSection("security")}
                    >
                      {" "}
                      <div className="flex items-center">
                        <Key className="mr-2 h-5 w-5" />
                        <span>Security</span>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      <div className="flex items-center">
                        <LogOut className="mr-2 h-5 w-5" />
                        <span>Logout</span>
                      </div>
                    </Button>
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
                      {/* Verification Status Row */}
                      <div className="flex items-center gap-2 mb-2">
                        {workerData?.status === 'approved' ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-green-500 font-semibold">Verified Account</span>
                          </>
                        ) : workerData?.status === 'rejected' ? (
                          <>
                            <XCircle className="h-5 w-5 text-red-500" />
                            <span className="text-red-500 font-semibold">Verification Rejected</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-5 w-5 text-yellow-500" />
                            <span className="text-yellow-500 font-semibold">Pending Verification</span>
                          </>
                        )}
                      </div>
                      {/* Status Message */}
                      {workerData?.status === 'pending' && (
                        <p className="text-sm text-gray-600 mb-4">
                          Your account is under review. This usually takes 1-2 business days.
                        </p>
                      )}
                      {workerData?.status === 'rejected' && (
                        <>
                          <p className="text-sm text-red-500 mb-2">
                            Your account verification was rejected. Please submit a new ID proof to verify your account.
                          </p>
                          <div
                            className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 mb-2 ${isDocDragActive ? 'border-blue-500 bg-blue-50' : ''}`}
                            {...getDocRootProps()}
                          >
                            <input {...getDocInputProps()} accept="image/*,application/pdf" />
                            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">Drop a new ID proof here, or click to select</p>
                          </div>
                          {/* Preview for selected ID proof file */}
                          {editProfile.idProof && (
                            <div className="mt-2 flex flex-col items-center">
                              {editProfile.idProof.type && editProfile.idProof.type.startsWith('image/') ? (
                                <img
                                  src={idProofPreview || URL.createObjectURL(editProfile.idProof)}
                                  alt="ID Proof Preview"
                                  className="h-32 w-auto rounded border mb-2"
                                />
                              ) : (
                              <p className="text-sm text-gray-600">Selected file: {editProfile.idProof.name}</p>
                              )}
                              <button
                                type="button"
                                className="mt-2 bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-lg transition"
                                onClick={handleProfileSubmit}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? <Loader2 className="inline-block h-5 w-5 mr-2 animate-spin" /> : null}
                                {isSubmitting ? 'Submitting...' : 'Resubmit for Verification'}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                      <form
                        className="space-y-5"
                        onSubmit={handleProfileSubmit}
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <label className="block text-black font-medium mb-1">
                              Full Name
                            </label>
                            <input
                              name="username"
                              value={editProfile.username}
                              onChange={handleProfileChange}
                              required
                              className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-black font-medium mb-1">
                              Age
                            </label>
                            <input
                              name="age"
                              type="number"
                              value={editProfile.age}
                              onChange={handleProfileChange}
                              required
                              min={18}
                              max={80}
                              className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-black font-medium mb-1">
                            Address
                          </label>
                          <input
                            name="address"
                            value={editProfile.address}
                            onChange={handleProfileChange}
                            required
                            className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition "
                            placeholder="Enter your complete address"
                          />
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <label className="block text-black font-medium mb-1">Country</label>
                            <Select 
                              options={countryOptions} 
                              value={editProfile.country ? countryOptions.find(opt => opt.value === editProfile.country) : null}
                              onChange={handleCountryChange} 
                              placeholder="Select country" 
                              classNamePrefix="react-select" 
                              isClearable
                              filterOption={startsWithFilter}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-black font-medium mb-1">State</label>
                            <Select 
                              options={stateOptions} 
                              value={editProfile.state ? stateOptions.find(opt => opt.value === editProfile.state) : null}
                              onChange={handleStateChange} 
                              placeholder="Select state" 
                              classNamePrefix="react-select" 
                              isClearable 
                              isDisabled={!editProfile.country}
                              filterOption={startsWithFilter}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-black font-medium mb-1">
                            Category
                          </label>
                          <Select
                            options={workerCategoriesWithOther}
                            value={workerCategoriesWithOther.find(opt => opt.value === editProfile.category) || null}
                            onChange={selected => setEditProfile(prev => ({ ...prev, category: selected ? selected.value : '', otherCategory: '' }))}
                            placeholder="Select category"
                            classNamePrefix="react-select"
                            isClearable
                            required
                            filterOption={startsWithFilter}
                          />
                        </div>
                        {editProfile.category === 'other' && (
                          <div className="mt-2">
                            <label className="block text-black font-medium mb-1">
                              Please describe your occupation
                            </label>
                            <input
                              name="otherCategory"
                              value={editProfile.otherCategory}
                              onChange={handleProfileChange}
                              required
                              className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                              placeholder="Describe your occupation"
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-black font-medium mb-1">
                            Profile Image
                          </label>
                          <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-4 flex items-center gap-4 mt-2 cursor-pointer ${
                              isDragActive
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <input {...getInputProps()} name="profileImage" />
                            {previewImage ? (
                              <>
                                <img
                                  src={previewImage}
                                  alt="Preview"
                                  className="h-16 w-16 rounded-full object-cover border-2 border-primary"
                                />
                                <button
                                  type="button"
                                  onClick={removeImage}
                                  className="ml-2 text-red-500 hover:text-red-700 font-semibold"
                                >
                                  Remove
                                </button>
                              </>
                            ) : (
                              <span className="text-gray-500">
                                Drag & drop or click to select an image (max
                                5MB)
                              </span>
                            )}
                          </div>
                          {fileError && (
                            <div className="text-red-500 text-sm mt-1">
                              {fileError}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-lg transition"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? <Loader2 className="inline-block h-5 w-5 mr-2 animate-spin" /> : null}
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                          </button>
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
                      <form
                        className="space-y-4"
                        onSubmit={handlePasswordSubmit}
                      >
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Current Password
                          </label>
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
                              {showPassword.current ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            New Password
                          </label>
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
                              {showPassword.new ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Confirm New Password
                          </label>
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
                              {showPassword.confirm ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
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
                      <CardDescription>
                        Your account verification status
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-2">
                          {workerData?.status === 'approved' ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span className="text-green-500 font-semibold">Verified Account</span>
                            </>
                          ) : workerData?.status === 'rejected' ? (
                            <>
                              <XCircle className="h-5 w-5 text-red-500" />
                              <span className="text-red-500 font-semibold">Verification Rejected</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-5 w-5 text-yellow-500" />
                              <span className="text-yellow-500 font-semibold">Pending Verification</span>
                            </>
                          )}
                        </div>
                        {workerData?.status === 'pending' && (
                          <p className="text-sm text-gray-600 mb-2">
                            Your account is under review. This usually takes 1-2 business days.
                          </p>
                        )}
                        {workerData?.status === 'rejected' && (
                          <>
                            <p className="text-sm text-red-500 mb-2">
                              Your account verification was rejected. Please submit a new ID proof to verify your account.
                            </p>
                            <div
                              className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 mb-2 ${isDocDragActive ? 'border-blue-500 bg-blue-50' : ''}`}
                              {...getDocRootProps()}
                            >
                              <input {...getDocInputProps()} accept="image/*,application/pdf" />
                              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600">Drop a new ID proof here, or click to select</p>
                            </div>
                            {/* Preview for selected ID proof file */}
                            {editProfile.idProof && (
                              <div className="mt-2 flex flex-col items-center">
                                {editProfile.idProof.type && editProfile.idProof.type.startsWith('image/') ? (
                                  <img
                                    src={idProofPreview || URL.createObjectURL(editProfile.idProof)}
                                    alt="ID Proof Preview"
                                    className="h-32 w-auto rounded border mb-2"
                                  />
                                ) : (
                                <p className="text-sm text-gray-600">Selected file: {editProfile.idProof.name}</p>
                                )}
                                <button
                                  type="button"
                                  className="mt-2 bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-lg transition"
                                  onClick={handleProfileSubmit}
                                >
                                  {isSubmitting ? <Loader2 className="inline-block h-5 w-5 mr-2 animate-spin" /> : null}
                                  {isSubmitting ? 'Submitting...' : 'Resubmit for Verification'}
                                </button>
                              </div>
                            )}
                          </>
                        )}
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
