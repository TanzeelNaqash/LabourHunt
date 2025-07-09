import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Select from 'react-select';
import { Country, State } from 'country-state-city';
import useAuthStore from '@/store/authStore';
import { useLocation } from 'wouter';
import { Eye, EyeOff } from "lucide-react";
import { useDropzone } from 'react-dropzone';
import { Link } from 'wouter';
import { useToast } from "@/hooks/UseToast";

const startsWithFilter = (option, inputValue) =>
  option.label.toLowerCase().startsWith(inputValue.toLowerCase());

const AdminRegisterPage = () => {
  const { register, isLoading, error, setCurrentRole } = useAuthStore();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    age: '',
    gender: '',
    address: '',
    country: '',
    state: '',
    password: '',
    profileImage: null,
    mobile: '',
  });
  const [countryOptions] = useState(Country.getAllCountries().map(c => ({ value: c.isoCode, label: c.name })));
  const [stateOptions, setStateOptions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [fileError, setFileError] = useState('');
  const { toast } = useToast();

  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (['firstName', 'lastName', 'username'].includes(name)) {
      if (value.length === 1 && value === ' ') return; // Prevent starting with space
    }
    if (name === 'age') {
      let age = value.replace(/[^0-9]/g, '');
      if (age.length > 2) age = age.slice(0, 2);
      setFormData(prev => ({ ...prev, age }));
      return;
    }
    if (name === 'mobile') {
      let mobile = value.replace(/[^0-9]/g, '');
      if (mobile.startsWith('0')) mobile = mobile.slice(1);
      if (mobile.length > 10) mobile = mobile.slice(0, 10);
      setFormData(prev => ({ ...prev, mobile }));
      return;
    }
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      if (name === 'profileImage' && files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result);
        reader.readAsDataURL(files[0]);
      }
    } else {
      if (name === 'password' && value.includes(' ')) {
        return; // Prevent any spaces in password
      }
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCountryChange = (selected) => {
    setFormData(prev => ({ ...prev, country: selected ? selected.value : '', state: '' }));
    if (selected) {
      const states = State.getStatesOfCountry(selected.value);
      setStateOptions(states.map(s => ({ value: s.isoCode, label: s.name })));
    } else {
      setStateOptions([]);
    }
  };

  const handleStateChange = (selected) => {
    setFormData(prev => ({ ...prev, state: selected ? selected.value : '' }));
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, profileImage: null }));
    setPreviewImage(null);
  };

  const onDropImage = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFileError('File size should be less than 5MB');
        return;
      }
      setFileError('');
      setFormData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: onDropImage, accept: { 'image/*': [] } });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCurrentRole('admin');
    if (!formData.username || !formData.email || !formData.password || !formData.age || !formData.gender || !formData.address || !formData.country || !formData.state) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (!passwordRegex.test(formData.password)) {
      toast({ title: "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character.", variant: "destructive" });
      return;
    }
    if (!formData.age || formData.age < 18 || formData.age > 80) {
      toast({ title: "Age must be between 18 and 80.", variant: "destructive" });
      return;
    }
    if (formData.age.length > 3) {
      toast({ title: "Age must be 2 or 3 digits only.", variant: "destructive" });
      return;
    }
    if (formData.age && (parseInt(formData.age) < 18 || parseInt(formData.age) > 80)) {
      toast({ title: "Age must be between 18 and 80.", variant: "destructive" });
      return;
    }
    const registrationData = { ...formData, mobile: Number(formData.mobile) };
    try {
      await register(registrationData);
      setLocation('/admin-dashboard');
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Registration | LabourHunt</title>
        <meta name="description" content="Register as an admin on LabourHunt" />
      </Helmet>
   
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-10 md:p-16 flex flex-col gap-6">
          <h1 className="text-3xl md:text-4xl font-bold text-black text-center mb-2">Admin Registration</h1>
          <p className="text-center text-gray-600 mb-6">Register as an admin to manage LabourHunt</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-black font-medium mb-1">Username</label>
              <input name="username" value={formData.username} onChange={handleChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-" placeholder="Username" />
            </div>
            <div>
              <label className="block text-black font-medium mb-1">Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 o" placeholder="Email address" />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-black font-medium mb-1">Age</label>
                <input name="age" type="number" value={formData.age} onChange={handleChange} required min={18} max={80} className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:" placeholder="Age (18-80)" />
              </div>
              <div className="flex-1">
                <label className="block text-black font-medium mb-1">Gender</label>
                <div className="flex gap-6 mt-2">
                  <label className="inline-flex items-center cursor-pointer"><input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} className="accent-blue-600 h-4 w-4" /><span className="ml-2 text-black">Male</span></label>
                  <label className="inline-flex items-center cursor-pointer"><input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} className="accent-blue-600 h-4 w-4" /><span className="ml-2 text-black">Female</span></label>
                  <label className="inline-flex items-center cursor-pointer"><input type="radio" name="gender" value="other" checked={formData.gender === 'other'} onChange={handleChange} className="accent-blue-600 h-4 w-4" /><span className="ml-2 text-black">Other</span></label>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-black font-medium mb-1">Address</label>
              <input name="address" value={formData.address} onChange={handleChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-no" placeholder="Address" />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-black font-medium mb-1">Country</label>
                <Select options={countryOptions} value={countryOptions.find(opt => opt.value === formData.country) || null} onChange={handleCountryChange} placeholder="Select country" classNamePrefix="react-select" isClearable filterOption={startsWithFilter} />
              </div>
              <div className="flex-1">
                <label className="block text-black font-medium mb-1">State</label>
                <Select options={stateOptions} value={stateOptions.find(opt => opt.value === formData.state) || null} onChange={handleStateChange} placeholder="Select state" classNamePrefix="react-select" isClearable isDisabled={!formData.country} filterOption={startsWithFilter} />
              </div>
            </div>
            <div>
              <label className="block text-black font-medium mb-1">Mobile</label>
              <input name="mobile" type="number" value={formData.mobile} onChange={handleChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-50" placeholder="Mobile number" />
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
            <div>
              <label className="block text-black font-medium mb-1">Profile Picture</label>
              <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
                <input {...getInputProps()} name="profileImage" />
                {previewImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={previewImage} alt="Preview" className="h-20 w-20 object-cover rounded-full mx-auto" />
                    <button type="button" onClick={removeFile} className="text-red-500 text-xs underline">Remove</button>
                  </div>
                ) : (
                  <span className="text-gray-500">Drag & drop a photo here, or click to select</span>
                )}
                {fileError && <p className="text-red-500 text-xs mt-2">{fileError}</p>}
              </div>
            </div>
           
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="text-center text-gray-600">
            Already an admin? <Link href="/admin-login" className="text-blue-600 hover:underline">Login</Link>
          </p>
        </div>
      </div>
   
    </>
  );
};

export default AdminRegisterPage; 