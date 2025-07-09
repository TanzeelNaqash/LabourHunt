import React, { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { useDropzone } from 'react-dropzone';
import { FaUser, FaIdCard, FaTimes } from 'react-icons/fa';
import Header from './layout/Header';
import Footer from './layout/Footer';
import { useToast } from "@/hooks/UseToast";

const BaseRegisterForm = ({ role, showIdProof, verifiedPhone, onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    address: '',
    country: '',
    state: '',
    password: '',
    role: role || '',
    profileImage: null,
    idProof: null
  });
  const [countryOptions] = useState(countryList().getData());
  const [stateOptions, setStateOptions] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [fileError, setFileError] = useState('');

  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/;

  const { toast } = useToast();

  useEffect(() => {
    setFormData(prev => ({ ...prev, role }));
  }, [role]);

  const statesByCountry = {
    IN: [ { value: 'JK', label: 'Jammu and Kashmir' }, { value: 'DL', label: 'Delhi' }, { value: 'MH', label: 'Maharashtra' }, { value: 'KA', label: 'Karnataka' }, { value: 'UP', label: 'Uttar Pradesh' },],
    US: [ { value: 'CA', label: 'California' }, { value: 'NY', label: 'New York' }, { value: 'TX', label: 'Texas' } ],
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if ((name === 'password' || name === 'firstName' || name === 'lastName') && value.includes(' ')) {
      return; // Prevent spaces in password, first name, last name
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
    if (type === 'radio') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      if (name === 'profileImage' && files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result);
        reader.readAsDataURL(files[0]);
      }
      if (name === 'idProof' && files[0]) {
        setPreviewDoc(files[0].name);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCountryChange = (selected) => {
    setFormData(prev => ({ ...prev, country: selected ? selected.value : '', state: '' }));
    setStateOptions(selected && statesByCountry[selected.value] ? statesByCountry[selected.value] : []);
  };

  const handleStateChange = (selected) => {
    setFormData(prev => ({ ...prev, state: selected ? selected.value : '' }));
  };

  const removeFile = (type) => {
    if (type === 'image') {
      setFormData(prev => ({ ...prev, profileImage: null }));
      setPreviewImage(null);
    } else {
      setFormData(prev => ({ ...prev, idProof: null }));
      setPreviewDoc(null);
    }
  };

  const onDropImage = useCallback((acceptedFiles) => {
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
  }, []);

  const onDropDoc = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setFileError('File size should be less than 10MB');
        return;
      }
      setFileError('');
      setFormData(prev => ({ ...prev, idProof: file }));
      setPreviewDoc(file.name);
    }
  }, []);

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({ onDrop: onDropImage, accept: 'image/*' });
  const { getRootProps: getDocRootProps, getInputProps: getDocInputProps, isDragActive: isDocDragActive } = useDropzone({ onDrop: onDropDoc, accept: 'image/*,.pdf' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.password || !formData.role) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    if (showIdProof && !formData.idProof) {
      toast({ title: 'ID Proof is required for workers', variant: 'destructive' });
      return;
    }
    if (!formData.age || formData.age < 18 || formData.age > 80) {
      toast({ title: 'Age must be between 18 and 80.', variant: 'destructive' });
      return;
    }
    if (!passwordRegex.test(formData.password)) {
      toast({ title: "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character.", variant: "destructive" });
      return;
    }
    try {
      await onSubmit({
        ...formData,
        phone: verifiedPhone
      });
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Complete Registration - {role} | LabourHunt</title>
        <meta name="description" content="Complete your registration to join LabourHunt" />
      </Helmet>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-10 md:p-16 flex flex-col gap-6">
          <h1 className="text-3xl md:text-4xl font-bold text-black text-center mb-2">Join LabourHunt</h1>
          <p className="text-center text-gray-600 mb-6">Complete your registration to get started</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-black font-medium mb-1">First Name</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outlin" placeholder="First name" />
              </div>
              <div className="flex-1">
                <label className="block text-black font-medium mb-1">Last Name</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-" placeholder="Last name" />
              </div>
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
                <Select options={countryOptions} value={countryOptions.find(opt => opt.value === formData.country) || null} onChange={handleCountryChange} placeholder="Select country" classNamePrefix="react-select" isClearable />
              </div>
              <div className="flex-1">
                <label className="block text-black font-medium mb-1">State</label>
                <Select options={stateOptions} value={stateOptions.find(opt => opt.value === formData.state) || null} onChange={handleStateChange} placeholder="Select state" classNamePrefix="react-select" isClearable isDisabled={!formData.country} />
              </div>
            </div>
            <div>
              <label className="block text-black font-medium mb-1">Password</label>
              <input name="password" type="password" value={formData.password} onChange={handleChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-b" placeholder="Password" />
            </div>
            <div>
              <label className="block text-black font-medium mb-1">Role</label>
              <div className="text-black font-semibold capitalize">{role}</div>
            </div>
            <div>
              <label className="block text-black font-medium mb-1">Profile Image</label>
              <div className="flex items-center gap-4">
                {previewImage ? (
                  <div className="relative">
                    <img src={previewImage} alt="Profile preview" className="h-16 w-16 object-cover rounded-full border" />
                    <button type="button" onClick={() => removeFile('image')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><FaTimes /></button>
                  </div>
                ) : (
                  <div {...getImageRootProps()} className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${isImageDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                    <input {...getImageInputProps()} />
                    <FaUser className="mx-auto mb-2 text-gray-400" />
                    {isImageDragActive ? <p>Drop the image here...</p> : <p>Drag and drop an image, or click to select</p>}
                    <p className="text-sm text-gray-500">Max file size: 5MB</p>
                  </div>
                )}
              </div>
            </div>
            {showIdProof && (
              <div>
                <label className="block text-black font-medium mb-1">ID Proof</label>
                <div className="flex items-center gap-4">
                  {previewDoc ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{previewDoc}</span>
                      <button type="button" onClick={() => removeFile('doc')} className="bg-red-500 text-white rounded-full p-1"><FaTimes /></button>
                    </div>
                  ) : (
                    <div {...getDocRootProps()} className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${isDocDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                      <input {...getDocInputProps()} />
                      <FaIdCard className="mx-auto mb-2 text-gray-400" />
                      {isDocDragActive ? <p>Drop the document here...</p> : <p>Drag and drop a document, or click to select</p>}
                      <p className="text-sm text-gray-500">Max file size: 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {fileError && <p className="text-red-500 text-sm text-center">{fileError}</p>}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BaseRegisterForm; 