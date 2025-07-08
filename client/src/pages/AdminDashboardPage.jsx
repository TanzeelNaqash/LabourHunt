import { Helmet } from "react-helmet";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from 'react-select';
import { Country, State } from 'country-state-city';
import { useDropzone } from 'react-dropzone';
import { ChartContainer } from "@/components/ui/chart";
import * as Recharts from "recharts";
import { useLocation } from 'wouter';

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  User,
  LogOut,
  CheckCircle,
  Key,
  ArrowLeft,
  BarChart3,
  Users,
  ShieldCheck,
  UserPlus,
  Settings,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Eye,
  EyeOff,
  Star,
  Trash2,
  RefreshCw,
  Loader2,
  Verified,
  X,
  Inbox
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {useToast} from "@/hooks/UseToast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import useAuthStore from "@/store/authStore";
import { queryClient } from '@/lib/queryClient';
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "@/components/ui/table";
import VerificationPanel from "@/components/admin/VerificationPannel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, logout, getAllReviews, deleteReview, admin, getAllUsersForAdmin, createClient, createWorker } = useAuthStore();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("dashboard");
  
  // Fetch admin profile data
  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/v1/admin/me"],
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Use admin data from store or fetched data
  const adminData = admin || userData;

  // Fetch reviews using the new getAllReviews function
  const { data: reviewsData, isLoading: reviewsLoading, refetch: refetchReviews, error: reviewsError } = useQuery({
    queryKey: ["/api/v1/admin/all-reviews"],
    queryFn: getAllReviews,
    enabled: activeSection === "reviews",
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch all users for admin management
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers, error: usersError } = useQuery({
    queryKey: ["/api/v1/admin/all-users"],
    queryFn: getAllUsersForAdmin,
    enabled: activeSection === "users" || activeSection === "dashboard" || activeSection === "workers",
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  const [editProfile, setEditProfile] = useState({
    username: "",
    email: "",
    mobile: "",
    address: "",
    country: "",
    state: "",
    age: "",
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addAdmin, setAddAdmin] = useState({
    username: '',
    email: '',
    mobile: '',
    password: '',
    country: '',
    state: '',
    age: '',
    address: '',
    gender: '',
    profileImage: null,
  });
  const [addAdminStateOptions, setAddAdminStateOptions] = useState([]);
  const [addAdminPreviewImage, setAddAdminPreviewImage] = useState(null);
  const [addAdminFileError, setAddAdminFileError] = useState('');
  const [showAddAdminPassword, setShowAddAdminPassword] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // Add client state
  const [addClient, setAddClient] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    password: '',
    age: '',
    address: '',
    country: '',
    state: '',
    gender: '',
    profileImage: null,
  });
  const [showAddClientPassword, setShowAddClientPassword] = useState(false);
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [addClientPreviewImage, setAddClientPreviewImage] = useState(null);
  const [addClientFileError, setAddClientFileError] = useState('');

  // Add worker state
  const [addWorker, setAddWorker] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    password: '',
    age: '',
    address: '',
    country: '',
    state: '',
    gender: '',
    category: '',
    otherCategory: '',
    profileImage: null,
  });
  const [showAddWorkerPassword, setShowAddWorkerPassword] = useState(false);
  const [addWorkerModalOpen, setAddWorkerModalOpen] = useState(false);
  const [addWorkerStateOptions, setAddWorkerStateOptions] = useState([]);
  const [addWorkerPreviewImage, setAddWorkerPreviewImage] = useState(null);
  const [addWorkerFileError, setAddWorkerFileError] = useState('');
  const [chartTimePeriod, setChartTimePeriod] = useState('6months'); // 6months, 1year, lifetime
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [workerSearchTerm, setWorkerSearchTerm] = useState('');

  const setUser = useAuthStore((state) => state.setUser);
  const setVerifiedPhone = useAuthStore((state) => state.setVerifiedPhone);
  const setAdmin = useAuthStore((state) => state.setAdmin);
  const { updateProfile, updatePassword } = useAuthStore();

  // Add state for user details modal
  const [viewUserModalOpen, setViewUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  

  const { adminUpdateUser, adminDeleteUser } = useAuthStore();

  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [editUserForm, setEditUserForm] = useState(null);
  const [editUserImagePreview, setEditUserImagePreview] = useState(null);

  // 1. Add state for worker modals (after user modal state)
  const [viewWorkerModalOpen, setViewWorkerModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [editWorkerModalOpen, setEditWorkerModalOpen] = useState(false);
  const [deleteWorkerModalOpen, setDeleteWorkerModalOpen] = useState(false);
  const [editWorkerForm, setEditWorkerForm] = useState(null);
  const [editWorkerImagePreview, setEditWorkerImagePreview] = useState(null);

  const { adminUpdateWorker, adminDeleteWorker } = useAuthStore();

  // Dropzone for edit worker image
  const onDropEditWorkerImage = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditWorkerForm(f => ({ ...f, profileImage: file }));
        setEditWorkerImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const {
    getRootProps: getEditWorkerImageRootProps,
    getInputProps: getEditWorkerImageInputProps,
    isDragActive: isEditWorkerImageDragActive
  } = useDropzone({ onDrop: onDropEditWorkerImage, accept: { 'image/*': [] } });

  // Add state for edit worker state options
  const [editWorkerStateOptions, setEditWorkerStateOptions] = useState([]);

  // Handler for country change in edit worker modal
  const handleEditWorkerCountryChange = (selected) => {
    setEditWorkerForm(f => ({ ...f, country: selected ? selected.value : '', state: '' }));
    if (selected) {
      const states = State.getStatesOfCountry(selected.value);
      setEditWorkerStateOptions(states.map(s => ({ value: s.isoCode, label: s.name })));
    } else {
      setEditWorkerStateOptions([]);
    }
  };
  // Handler for state change in edit worker modal
  const handleEditWorkerStateChange = (selected) => {
    setEditWorkerForm(f => ({ ...f, state: selected ? selected.value : '' }));
  };
  // When editWorkerForm.country changes, update state options
  useEffect(() => {
    if (editWorkerForm && editWorkerForm.country) {
      const states = State.getStatesOfCountry(editWorkerForm.country);
      setEditWorkerStateOptions(states.map(s => ({ value: s.isoCode, label: s.name })));
    } else {
      setEditWorkerStateOptions([]);
    }
  }, [editWorkerForm && editWorkerForm.country]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/admin-login');
    }
  }, [isAuthenticated, setLocation]);

  useEffect(() => {
    if (adminData) {
      setEditProfile({
        username: adminData.username || "",
        email: adminData.email || "",
        mobile: adminData.mobile || "",
        address: adminData.address || "",
        country: adminData.country || "",
        state: adminData.state || "",
        age: adminData.age || "",
        profileImage: null,
      });
      if (adminData.country) {
        const states = State.getStatesOfCountry(adminData.country);
        setStateOptions(states.map(s => ({ value: s.isoCode, label: s.name })));
      }
      setPreviewImage(adminData.photo || adminData.profileImage || null);
      
      // Always set admin data in store when it's available
      if (userData && !admin) {
        setAdmin(userData);
      }
      setUser(adminData);
      setVerifiedPhone(adminData.mobile || null);
    }
  }, [adminData, userData, admin, setAdmin, setUser, setVerifiedPhone]);

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage" && files && files[0]) {
      setEditProfile((prev) => ({ ...prev, profileImage: files[0] }));
    } else {
      setEditProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      toast({ title: "Updating profile...", description: "Please wait while we update your profile." });
      const formData = {
        ...editProfile,
        address: editProfile.address.trim(),
      };
      const updated = await updateProfile(formData);
      toast({ title: "Profile updated successfully!", description: "Your profile has been updated with the new information." });
      queryClient.setQueryData(["/api/v1/users/me"], updated);
    } catch (err) {
      toast({ 
        title: "Failed to update profile", 
        description: err.message || "An error occurred while updating your profile. Please try again.",
        variant: "destructive" 
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setEditPassword((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (editPassword.newPassword !== editPassword.confirmPassword) {
      toast({ 
        title: "Passwords do not match", 
        description: "Please make sure your new password and confirm password are the same.",
        variant: "destructive" 
      });
      return;
    }
    try {
      toast({ title: "Updating password...", description: "Please wait while we update your password." });
      await updatePassword({
        currentPassword: editPassword.currentPassword,
        newPassword: editPassword.newPassword,
      });
      toast({ title: "Password updated successfully!", description: "Your password has been changed successfully." });
      setEditPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast({ 
        title: "Failed to update password", 
        description: err.message || "An error occurred while updating your password. Please try again.",
        variant: "destructive" 
      });
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

  const handleAddAdminChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profileImage' && files && files[0]) {
      setAddAdmin((prev) => ({ ...prev, profileImage: files[0] }));
    } else {
      setAddAdmin((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddAdminCountryChange = (selected) => {
    setAddAdmin((prev) => ({ ...prev, country: selected ? selected.value : '', state: '' }));
    if (selected) {
      const states = State.getStatesOfCountry(selected.value);
      setAddAdminStateOptions(states.map(s => ({ value: s.isoCode, label: s.name })));
    } else {
      setAddAdminStateOptions([]);
    }
  };

  const handleAddAdminStateChange = (selected) => {
    setAddAdmin((prev) => ({ ...prev, state: selected ? selected.value : '' }));
  };

  const onDropAddAdminImage = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setAddAdminFileError('File size should be less than 5MB');
        return;
      }
      setAddAdminFileError('');
      setAddAdmin((prev) => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setAddAdminPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Add Admin Dropzone setup
  const addAdminDropzone = useDropzone({ onDrop: onDropAddAdminImage, accept: { 'image/*': [] } });
  const getAddAdminRootProps = addAdminDropzone.getRootProps;
  const getAddAdminInputProps = addAdminDropzone.getInputProps;
  const addAdminIsDragActive = addAdminDropzone.isDragActive;

  const removeAddAdminImage = () => {
    setAddAdminPreviewImage(null);
    setAddAdmin({ ...addAdmin, profileImage: null });
    setAddAdminFileError('');
  };

  const { setCurrentRole, register: registerAdmin, isLoading: isRegistering, error: registerError } = useAuthStore();

  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    if (!passwordRegex.test(addAdmin.password)) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters, include an uppercase letter, a number, and a special character.",
        variant: "destructive"
      });
      return;
    }
    try {
      setCurrentRole('admin');
      toast({ title: "Registering admin...", description: "Please wait while we add the new admin." });
      let profileImageData = null;
      if (addAdmin.profileImage) {
        profileImageData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(addAdmin.profileImage);
        });
      }
      const adminData = {
        ...addAdmin,
        profileImage: profileImageData
      };
      await registerAdmin(adminData);
      toast({ title: 'Admin registered successfully!', description: 'The new admin has been added to the system.' });
    setAddAdmin({
      username: '',
      email: '',
      mobile: '',
      password: '',
      country: '',
      state: '',
      age: '',
      address: '',
      gender: '',
      profileImage: null,
    });
    setAddAdminPreviewImage(null);
    setAddAdminFileError('');
    setAddAdminStateOptions([]);
      await refetchAdmins();
      setActiveSection('dashboard');
    } catch (error) {
      toast({ 
        title: 'Failed to register admin', 
        description: error.message || 'An error occurred while registering the admin. Please try again.',
        variant: 'destructive' 
      });
    }
  };

  const handleDeleteReview = async (id) => {
    setReviewToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    
    try {
      toast({ title: "Deleting review...", description: "Please wait while we delete the review." });
      await deleteReview(reviewToDelete);
      toast({ title: "Review deleted successfully!", description: "The review has been removed from the system." });
      queryClient.invalidateQueries(['/api/v1/admin/all-reviews']);
      refetchReviews();
    } catch (error) {
      toast({ 
        title: "Failed to delete review", 
        description: error.message || "An error occurred while deleting the review. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setDeleteModalOpen(false);
      setReviewToDelete(null);
    }
  };

  // Handle add client form changes
  const handleAddClientChange = (e) => {
    const { name, value } = e.target;
    setAddClient(prev => ({ ...prev, [name]: value }));
  };

  // Handle add client country change
  const handleAddClientCountryChange = (selected) => {
    setAddClient(prev => ({ ...prev, country: selected ? selected.value : '', state: '' }));
    if (selected) {
      const states = State.getStatesOfCountry(selected.value);
      setStateOptions(states.map(s => ({ value: s.isoCode, label: s.name })));
    } else {
      setStateOptions([]);
    }
  };

  // Handle add client state change
  const handleAddClientStateChange = (selected) => {
    setAddClient(prev => ({ ...prev, state: selected ? selected.value : '' }));
  };

  // Handle add client submit
  const handleAddClientSubmit = async (e) => {
    e.preventDefault();
    try {
      toast({ title: "Creating client...", description: "Please wait while we create the new client." });
      
      // Convert profile image to base64 if exists
      let profileImageData = null;
      if (addClient.profileImage) {
        const reader = new FileReader();
        profileImageData = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(addClient.profileImage);
        });
      }
      
      const clientData = {
        ...addClient,
        profileImage: profileImageData
      };
      
      await createClient(clientData);
      toast({ title: "Client created successfully!", description: "The new client has been added to the system." });
      setAddClient({
        firstName: '',
        lastName: '',
        mobile: '',
        password: '',
        age: '',
        address: '',
        country: '',
        state: '',
        gender: '',
        profileImage: null,
      });
      setAddClientPreviewImage(null);
      setAddClientModalOpen(false);
      queryClient.invalidateQueries(['/api/v1/admin/all-users']);
      refetchUsers();
    } catch (error) {
      let title = "Failed to create client";
      let description = error.message || "An error occurred while creating the client. Please try again.";
      if (description.toLowerCase().includes("already exists")) {
        title = "Phone Number Already Registered";
        description = "An account with this phone number already exists. Please use a different number or login.";
      }
      toast({ title, description, variant: "destructive" });
    }
  };

  // Handle add worker form changes
  const handleAddWorkerChange = (e) => {
    const { name, value } = e.target;
    setAddWorker(prev => ({ ...prev, [name]: value }));
  };

  // Handle add worker country change
  const handleAddWorkerCountryChange = (selected) => {
    setAddWorker(prev => ({ ...prev, country: selected ? selected.value : '', state: '' }));
    if (selected) {
      const states = State.getStatesOfCountry(selected.value);
      setAddWorkerStateOptions(states.map(s => ({ value: s.isoCode, label: s.name })));
    } else {
      setAddWorkerStateOptions([]);
    }
  };

  // Handle add worker state change
  const handleAddWorkerStateChange = (selected) => {
    setAddWorker(prev => ({ ...prev, state: selected ? selected.value : '' }));
  };

  // Handle add worker submit
  const handleAddWorkerSubmit = async (e) => {
    e.preventDefault();
    try {
      toast({ title: "Creating worker...", description: "Please wait while we create the new worker." });
      
      // Convert profile image to base64 if exists
      let profileImageData = null;
      if (addWorker.profileImage) {
        profileImageData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(addWorker.profileImage);
        });
      }
      
      const workerData = {
        ...addWorker,
        profileImage: profileImageData
      };
      
      await createWorker(workerData);
      toast({ title: "Worker created successfully!", description: "The new worker has been added to the system." });
      setAddWorker({
        firstName: '',
        lastName: '',
        mobile: '',
        password: '',
        age: '',
        address: '',
        country: '',
        state: '',
        gender: '',
        category: '',
        otherCategory: '',
        profileImage: null,
      });
      setAddWorkerPreviewImage(null);
      setAddWorkerModalOpen(false);
      queryClient.invalidateQueries(['/api/v1/admin/all-users']);
      refetchUsers();
    } catch (error) {
      let title = "Failed to create worker";
      let description = error.message || "An error occurred while creating the worker. Please try again.";
      if (description.toLowerCase().includes("already exists")) {
        title = "Phone Number Already Registered";
        description = "An account with this phone number already exists. Please use a different number or login.";
      }
      toast({ title, description, variant: "destructive" });
    }
  };

  // Add client dropzone handlers
  const onDropAddClientImage = (acceptedFiles) => {
    setAddClientFileError('');
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 5 * 1024 * 1024) {
        setAddClientFileError('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setAddClientFileError('Please upload an image file');
        return;
      }
      setAddClient(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onload = () => {
        setAddClientPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAddClientImage = () => {
    setAddClientPreviewImage(null);
    setAddClient(prev => ({ ...prev, profileImage: null }));
    setAddClientFileError('');
  };

  // Add worker dropzone handlers
  const onDropAddWorkerImage = (acceptedFiles) => {
    setAddWorkerFileError('');
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 5 * 1024 * 1024) {
        setAddWorkerFileError('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setAddWorkerFileError('Please upload an image file');
        return;
      }
      setAddWorker(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onload = () => {
        setAddWorkerPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAddWorkerImage = () => {
    setAddWorkerPreviewImage(null);
    setAddWorker(prev => ({ ...prev, profileImage: null }));
    setAddWorkerFileError('');
  };

  // Create dropzone instances
  const clientDropzone = useDropzone({
    onDrop: onDropAddClientImage,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  });

  const workerDropzone = useDropzone({
    onDrop: onDropAddWorkerImage,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  });

  // Process real data for chart
  const processChartData = (usersData, timePeriod = '6months') => {
    if (!usersData || usersData.length === 0) {
      return [];
    }

    const now = new Date();
    let months = [];
    let monthsToShow = 6;

    // Determine number of months based on time period
    switch (timePeriod) {
      case '1year': {
        monthsToShow = 12;
        break;
      }
      case 'lifetime': {
        // Find the earliest join date to determine total months
        if (usersData.length === 0) {
          monthsToShow = 6;
        } else {
          const earliestDate = new Date(Math.min(...usersData.map(user => 
            new Date(user.joinedDate || user.createdAt).getTime()
          )));
          const monthsDiff = (now.getFullYear() - earliestDate.getFullYear()) * 12 + 
                            (now.getMonth() - earliestDate.getMonth());
          monthsToShow = Math.max(6, Math.min(24, monthsDiff + 1)); // Between 6 and 24 months
        }
        break;
      }
      default: { // 6months
        monthsToShow = 6;
      }
    }

    // Generate months array
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        year: date.getFullYear(),
        monthNum: date.getMonth(),
        users: 0,
        workers: 0
      });
    }

    // Count users and workers by month
    usersData.forEach(user => {
      const joinDate = new Date(user.joinedDate || user.createdAt);
      
      const monthIndex = months.findIndex(m => 
        m.monthNum === joinDate.getMonth() && m.year === joinDate.getFullYear()
      );
      
      if (monthIndex !== -1) {
        if (user.type === 'client') {
          months[monthIndex].users++;
        } else if (user.type === 'worker') {
          months[monthIndex].workers++;
        }
      } else {
        // Add to current month if date is outside range
        if (months.length > 0) {
          const currentMonthIndex = months.length - 1;
          if (user.type === 'client') {
            months[currentMonthIndex].users++;
          } else if (user.type === 'worker') {
            months[currentMonthIndex].workers++;
          }
        }
      }
    });

    // If no data was found, add some sample data to show the chart structure
    const hasData = months.some(m => m.users > 0 || m.workers > 0);
    if (!hasData && usersData.length > 0) {
      // Add current month data to show the chart
      if (months.length > 0) {
        const currentMonthIndex = months.length - 1;
        months[currentMonthIndex].users = usersData.filter(u => u.type === 'client').length;
        months[currentMonthIndex].workers = usersData.filter(u => u.type === 'worker').length;
      }
    }

    return months;
  };

  // Get chart data from real user data
  const chartData = processChartData(usersData, chartTimePeriod);

  // Filter clients and workers based on search terms
  const filteredClients = usersData?.filter(user => 
    user.type === 'client' && 
    (user.displayName?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
     user.email?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
     user.mobile?.includes(clientSearchTerm))
  ) || [];

  const filteredWorkers = usersData?.filter(user => 
    user.type === 'worker' && 
    (user.displayName?.toLowerCase().includes(workerSearchTerm.toLowerCase()) ||
     user.username?.toLowerCase().includes(workerSearchTerm.toLowerCase()) ||
     user.mobile?.includes(workerSearchTerm) ||
     user.category?.toLowerCase().includes(workerSearchTerm.toLowerCase()))
  ) || [];

  // Debug logging
  console.log('usersData:', usersData);
  console.log('workerSearchTerm:', workerSearchTerm);
  console.log('filteredWorkers:', filteredWorkers);

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const onDropEditUserImage = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditUserForm(f => ({ ...f, profileImage: file }));
        setEditUserImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const {
    getRootProps: getEditUserImageRootProps,
    getInputProps: getEditUserImageInputProps,
    isDragActive: isEditUserImageDragActive
  } = useDropzone({ onDrop: onDropEditUserImage, accept: { 'image/*': [] } });

  // Add state for edit user state options
  const [editUserStateOptions, setEditUserStateOptions] = useState([]);

  // Handler for country change in edit user modal
  const handleEditUserCountryChange = (selected) => {
    setEditUserForm(f => ({ ...f, country: selected ? selected.value : '', state: '' }));
    if (selected) {
      const states = State.getStatesOfCountry(selected.value);
      setEditUserStateOptions(states.map(s => ({ value: s.isoCode, label: s.name })));
    } else {
      setEditUserStateOptions([]);
    }
  };
  // Handler for state change in edit user modal
  const handleEditUserStateChange = (selected) => {
    setEditUserForm(f => ({ ...f, state: selected ? selected.value : '' }));
  };
  // When editUserForm.country changes, update state options
  useEffect(() => {
    if (editUserForm && editUserForm.country) {
      const states = State.getStatesOfCountry(editUserForm.country);
      setEditUserStateOptions(states.map(s => ({ value: s.isoCode, label: s.name })));
    } else {
      setEditUserStateOptions([]);
    }
  }, [editUserForm && editUserForm.country]);

  // Helper functions to get full country/state names
  const getCountryName = (code) => {
    if (!code) return 'N/A';
    const country = Country.getCountryByCode(code);
    return country ? country.name : code;
  };
  const getStateName = (countryCode, stateCode) => {
    if (!countryCode || !stateCode) return 'N/A';
    const state = State.getStateByCodeAndCountry(stateCode, countryCode);
    return state ? state.name : stateCode;
  };

  const { getAllAdmins } = useAuthStore();
  const { data: adminsData, isLoading: adminsLoading, refetch: refetchAdmins, error: adminsError } = useQuery({
    queryKey: ["/api/v1/admin/users"],
    queryFn: getAllAdmins,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
    enabled: activeSection === "addadmin"
  });

  // Add state for admin modals
  const [viewAdminModalOpen, setViewAdminModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [deleteAdminModalOpen, setDeleteAdminModalOpen] = useState(false);
  const { adminDeleteAdmin } = useAuthStore();

  const fetchAllFeedback = useAuthStore(s => s.fetchAllFeedback);
  const { data: feedbackData = [], refetch: refetchFeedback } = useQuery({
    queryKey: ["/api/v1/admin/feedback"],
    queryFn: fetchAllFeedback,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: true,
    // refetchInterval: 3000, // Remove this for immediate local update only
  });
  const feedbackUnreadCount = feedbackData.filter(fb => fb.status === 'open').length;

  const [viewMessage, setViewMessage] = useState(null);
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const updateFeedbackStatus = useAuthStore(s => s.updateFeedbackStatus);
  const replyFeedback = useAuthStore(s => s.replyFeedback);
  const deleteFeedback = useAuthStore(s => s.deleteFeedback);

  // Add this before the <Tabs value={activeTab} ...> usage, ideally near other state declarations for this section
  const [activeTab, setActiveTab] = useState("open");

  // Add state for multi-select per tab
  const [selectedOpenMessageIds, setSelectedOpenMessageIds] = useState([]);
  const [selectedInProgressMessageIds, setSelectedInProgressMessageIds] = useState([]);
  const [selectedClosedMessageIds, setSelectedClosedMessageIds] = useState([]);

  // Add state for reply loading
  const [replyLoading, setReplyLoading] = useState(false);

  // Add state for viewing a feedback thread (for chat or email)
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [adminReply, setAdminReply] = useState("");

  // --- Admin Support Chat State ---
  const [chatThreads, setChatThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Add state for active chat tab
  const [activeChatTab, setActiveChatTab] = useState("open");

  // Calculate unread count for open threads
  const chatUnreadCount = chatThreads.filter(t => t.status === "open").length;
  const unreadCount = feedbackUnreadCount + chatUnreadCount;

  // Filter threads by tab
  const filteredChatThreads = chatThreads.filter(
    t => t.status === activeChatTab
  );

  // Calculate in-progress chat count
  const chatInProgressCount = chatThreads.filter(t => t.status === 'in_progress').length;

  // Fetch all chat threads
  useEffect(() => {
    if (activeSection !== "feedback") return;
    setChatLoading(true);
    fetch("/api/v1/chat/threads", { credentials: "include" })
      .then(res => res.json())
      .then(setChatThreads)
      .finally(() => setChatLoading(false));
  }, [activeSection]);

  // Fetch messages for selected thread
  useEffect(() => {
    if (!selectedThread?._id) return;
    setChatLoading(true);
    fetch(`/api/v1/chat/messages?threadId=${selectedThread._id}`, { credentials: "include" })
      .then(res => res.json())
      .then(setChatMessages)
      .finally(() => setChatLoading(false));
  }, [selectedThread]);

  // Send admin reply
  const handleAdminReply = async () => {
    if (!adminReply.trim() || !selectedThread?._id) return;
    setChatLoading(true);
    await fetch("/api/v1/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threadId: selectedThread._id,
        sender: "admin",
        senderId: admin?._id || "admin",
        message: adminReply
      }),
      credentials: "include"
    });
    // Increment unread count for user
    await fetch("/api/v1/chat/increment-unread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: selectedThread._id }),
      credentials: "include"
    });
    setAdminReply("");
    // Fetch messages after sending
    fetch(`/api/v1/chat/messages?threadId=${selectedThread._id}`, { credentials: "include" })
      .then(res => res.json())
      .then(setChatMessages)
      .finally(() => setChatLoading(false));
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-600">Loading admin dashboard...</p>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - LabourHunt</title>
        <meta name="description" content="Admin panel for managing users, workers, and admins on the LabourHunt platform." />
        <meta property="og:title" content="Admin Dashboard - LabourHunt" />
        <meta property="og:description" content="Admin panel for managing users, workers, and admins on the LabourHunt platform." />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8 bg-[#F3F2EF]">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-neutral-700">
                Welcome, {adminData?.username || adminData?.firstName || "Admin"}! Manage users, workers, and other admins.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <Card className="lg:col-span-1">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center mb-6">
                    <Avatar className="h-20 w-20 mb-4 border-4 border-primary/20 shadow-lg bg-white hover:shadow-xl transition-shadow duration-200">
                      <AvatarImage src={adminData?.photo || adminData?.profileImage} alt={adminData?.username || adminData?.firstName} className="object-cover" />
                      <AvatarFallback className="text-2xl font-bold bg-primary text-white">
                        {(adminData?.username?.[0] || adminData?.firstName?.[0] || '')}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">{adminData?.username || adminData?.firstName || 'Admin'}</h2>
                    <p className="text-neutral-600">{adminData?.email}</p>
                    <p className="flex items-center gap-1 text-white bg-primary rounded px-3 text-sm md:text-base shadow-sm w-fit mx-auto">
                      Administrator
                    
                    </p>
                  </div>
                  <nav className="space-y-1 sticky top-24">
                    <Button variant={activeSection === "dashboard" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveSection("dashboard")}> <div className="flex items-center"><BarChart3 className="mr-2 h-5 w-5" /><span>Dashboard</span></div></Button>
                    <Button variant={activeSection === "users" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveSection("users")}> <div className="flex items-center"><Users className="mr-2 h-5 w-5" /><span>Manage Users</span></div></Button>
                    <Button variant={activeSection === "workers" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveSection("workers")}> <div className="flex items-center"><ShieldCheck className="mr-2 h-5 w-5" /><span>Manage Workers</span></div></Button>
                    <Button variant={activeSection === "addadmin" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveSection("addadmin")}> <div className="flex items-center"><UserPlus className="mr-2 h-5 w-5" /><span>Add Admin</span></div></Button>
                    <Button variant={activeSection === "verifications" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveSection("verifications")}> <div className="flex items-center"><CheckCircle className="mr-2 h-5 w-5" /><span>Verifications</span></div></Button>
                    <Button variant={activeSection === "reviews" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveSection("reviews")}> <div className="flex items-center"><Star className="mr-2 h-5 w-5" /><span>Reviews</span></div></Button>
                    <Button variant={activeSection === "feedback" ? "secondary" : "ghost"} className="w-full justify-start relative" onClick={() => setActiveSection("feedback")}> 
                      <div className="flex items-center gap-2 w-full">
                        <Inbox className="h-5 w-5" />
                        <span>Inbox</span>
                        {unreadCount > 0 && (
                          <span className="absolute right-4 top-1 flex items-center justify-center bg-red-500 text-white rounded-full text-[10px] font-semibold h-4 w-4 shadow transition-all duration-200">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setSettingsOpen((open) => !open)}>
                      <div className="flex items-center w-full justify-between">
                        <div className="flex items-center">
                          <Settings className="mr-2 h-5 w-5" />
                          <span>Settings</span>
                        </div>
                        {settingsOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                      </div>
                    </Button>
                    {settingsOpen && (
                      <div className="ml-8 flex flex-col gap-1 mt-1">
                        <Button variant={activeSection === "profile" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveSection("profile")}> <div className="flex items-center"><User className="mr-2 h-5 w-5" /><span>Profile</span></div></Button>
                        <Button variant={activeSection === "security" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveSection("security")}> <div className="flex items-center"><Key className="mr-2 h-5 w-5" /><span>Security</span></div></Button>
                      </div>
                    )}
                    <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleLogout}><div className="flex items-center"><LogOut className="mr-2 h-5 w-5" /><span>Logout</span></div></Button>
                  </nav>
                </CardContent>
              </Card>
              {/* Main Content */}
              <div className="lg:col-span-3">
                <Tabs value={activeSection} onValueChange={setActiveSection}>
                  <TabsList
                    className="mb-6 flex overflow-x-auto flex-nowrap w-full gap-2 px-1"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    <TabsTrigger value="dashboard" className={activeSection === 'dashboard' ? 'bg-green-700 text-white transition-colors duration-300' : 'transition-colors duration-300'}>Overview</TabsTrigger>
                    <TabsTrigger value="verifications" className={activeSection === 'verifications' ? 'bg-green-700 text-white transition-colors duration-300' : 'transition-colors duration-300'}>Verifications</TabsTrigger>
                    <TabsTrigger value="reviews" className={activeSection === 'reviews' ? 'bg-green-700 text-white transition-colors duration-300' : 'transition-colors duration-300'}>Reviews</TabsTrigger>
                    <TabsTrigger value="feedback" className={activeSection === 'feedback' ? 'bg-green-700 text-white transition-colors duration-300' : 'transition-colors duration-300'}>Inbox</TabsTrigger>
                  </TabsList>
                  <TabsContent value="dashboard">
                    {/* Dashboard Overview Content */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="w-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-medium">Total Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <Users className="h-8 w-8 text-primary mr-3" />
                            <div>
                              <p className="text-3xl font-bold">{usersData?.filter(user => user.type === 'client').length || 0}</p>
                              <p className="text-sm text-neutral-600">Registered users</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="w-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-medium">Total Workers</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <ShieldCheck className="h-8 w-8 text-secondary mr-3" />
                            <div>
                              <p className="text-3xl font-bold">{usersData?.filter(user => user.type === 'worker').length || 0}</p>
                              <p className="text-sm text-neutral-600">Registered workers</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="w-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-medium">Pending Verifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
                            <div>
                              <p className="text-3xl font-bold">{usersData?.filter(user => user.status === 'pending').length || 0}</p>
                              <p className="text-sm text-neutral-600">Awaiting review</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    {/* Overview Graph */}
                    <Card className="w-full">
                      <CardHeader>
                        <div className="flex flex-col gap-4">
                          <div>
                        <CardTitle>User & Worker Growth</CardTitle>
                            <CardDescription>Monthly registrations</CardDescription>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant={chartTimePeriod === '6months' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setChartTimePeriod('6months')}
                              className="flex-1 sm:flex-none min-w-[80px]"
                            >
                              6 Months
                            </Button>
                            <Button
                              variant={chartTimePeriod === '1year' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setChartTimePeriod('1year')}
                              className="flex-1 sm:flex-none min-w-[80px]"
                            >
                              1 Year
                            </Button>
                            <Button
                              variant={chartTimePeriod === 'lifetime' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setChartTimePeriod('lifetime')}
                              className="flex-1 sm:flex-none min-w-[80px]"
                            >
                              Lifetime
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {usersLoading ? (
                          <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                              <p className="text-gray-600">Loading chart data...</p>
                            </div>
                          </div>
                        ) : chartData.length === 0 ? (
                          <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p className="font-medium text-gray-500">No data available</p>
                              <p className="text-sm text-gray-600 mt-1">Chart will display data once users and workers register</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full">
                            <ChartContainer config={{ users: { color: '#2563eb', label: 'Users' }, workers: { color: '#16a34a', label: 'Workers' } }} style={{ width: '100%', height: 300 }}>
                              <Recharts.BarChart data={chartData}>
                              <Recharts.CartesianGrid strokeDasharray="3 3" />
                              <Recharts.XAxis dataKey="month" />
                                <Recharts.YAxis 
                                  allowDecimals={false}
                                  tickFormatter={(value) => Math.round(value)}
                                />
                              <Recharts.Tooltip />
                              <Recharts.Legend />
                              <Recharts.Bar dataKey="users" fill="#2563eb" name="Users" />
                              <Recharts.Bar dataKey="workers" fill="#16a34a" name="Workers" />
                            </Recharts.BarChart>
                          </ChartContainer>
                        </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="verifications">
                   <VerificationPanel/>
                  </TabsContent>
                  <TabsContent value="users">
                    <Card className="w-full">
                      <CardHeader className="flex flex-row items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveSection("dashboard")}
                          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                          aria-label="Back"
                        >
                          <ArrowLeft className="h-5 w-5 text-gray-500" />
                        </button>
                        <CardTitle>Users</CardTitle>
                        <Button 
                          onClick={() => refetchUsers()} 
                          disabled={usersLoading}
                          variant="outline"
                          size="sm"
                          className="ml-auto"
                        >
                          {usersLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Refresh
                        </Button>
                        <Button 
                          onClick={() => setAddClientModalOpen(true)}
                          size="sm"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Client
                        </Button>
                      </CardHeader>
                      <CardContent>
                      <input 
                          type="text" 
                          placeholder="Search clients..." 
                          value={clientSearchTerm}
                          onChange={(e) => setClientSearchTerm(e.target.value)}
                          className="w-full md:w-64 rounded-lg px-3 py-2 border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition mb-4" 
                        />
                        {usersLoading ? (
                          <div className="text-center text-gray-500 py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-gray-600">Loading users...</p>
                          </div>
                        ) : usersError ? (
                          <div className="text-center text-red-500 py-8">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
                            <p className="font-medium">Failed to load users</p>
                            <p className="text-sm text-gray-600 mt-1">{usersError.message || 'An error occurred while fetching users'}</p>
                            <Button 
                              onClick={() => {
                                refetchUsers();
                                toast({ title: "Retrying to fetch users..." });
                              }} 
                              variant="outline" 
                              size="sm" 
                              className="mt-4"
                            >
                              Try Again
                            </Button>
                          </div>
                        ) : !usersData || filteredClients.length === 0 ? (
                          <div className="text-center text-gray-500 py-8">
                            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="font-medium">No clients found</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {clientSearchTerm ? 'No clients match your search criteria' : 'Clients will appear here once they register'}
                            </p>
                          </div>
                        ) : (
                        <div className="overflow-x-auto">
                          <Table className="min-w-[600px] w-full">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                  <TableHead>Mobile</TableHead>
                                  <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredClients.map((user) => (
                                  <TableRow key={user._id}>
                                <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage src={user.profileImage || user.photo} alt={user.displayName || user.firstName || user.username || 'User'} />
                                          <AvatarFallback>
                                            {(user.displayName?.substring(0, 2) || user.firstName?.substring(0, 2) || user.username?.substring(0, 2) || 'U').toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{user.displayName || user.firstName || user.username || 'User'}</span>
                                      </div>
                                </TableCell>
                                <TableCell>
                                      {user.email || user.mobile}
                                </TableCell>
                                <TableCell>
                                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                        Client
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                        user.status === 'verified' ? 'bg-green-100 text-green-700' : 
                                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                        'bg-red-100 text-red-700'
                                      }`}>
                                        {user.status === 'verified' ? 'Verified' : 
                                         user.status === 'pending' ? 'Pending' : 
                                         user.status === 'rejected' ? 'Rejected' : 'Unknown'}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                    <button
                                      className="text-blue-600 hover:underline mr-2"
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setViewUserModalOpen(true);
                                      }}
                                    >
                                      View
                                    </button>
                                    <button
                                      className="text-blue-600 hover:underline mr-2"
                                      onClick={() => {
                                        setEditUserForm(user);
                                        setEditUserModalOpen(true);
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="text-red-600 hover:underline"
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setDeleteUserModalOpen(true);
                                      }}
                                    >
                                      Delete
                                    </button>
                                </TableCell>
                              </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                              <TableRow>
                                <TableCell colSpan={6}>
                                  <div className="flex justify-between items-center py-2">
                                      <span className="text-xs text-gray-500">
                                        Showing {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
                                      </span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            </TableFooter>
                          </Table>
                        </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="workers">
                    <Card className="w-full">
                      <CardHeader className="flex flex-row items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveSection("dashboard")}
                          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                          aria-label="Back"
                        >
                          <ArrowLeft className="h-5 w-5 text-gray-500" />
                        </button>
                        <CardTitle>Workers</CardTitle>
                        <Button 
                          onClick={() => refetchUsers()} 
                          disabled={usersLoading}
                          variant="outline"
                          size="sm"
                          className="ml-auto"
                        >
                          {usersLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Refresh
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                          <input 
                            type="text" 
                            placeholder="Search workers..." 
                            value={workerSearchTerm}
                            onChange={(e) => setWorkerSearchTerm(e.target.value)}
                            className="w-full md:w-64 rounded-lg px-3 py-2 border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" 
                          />
                          <button 
                            onClick={() => setAddWorkerModalOpen(true)}
                            className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                          >
                            Add Worker
                          </button>
                        </div>
                        {usersLoading ? (
                          <div className="text-center text-gray-500 py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-gray-600">Loading workers...</p>
                          </div>
                        ) : usersError ? (
                          <div className="text-center text-red-500 py-8">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
                            <p className="font-medium">Failed to load workers</p>
                            <p className="text-sm text-gray-600 mt-1">{usersError.message || 'An error occurred while fetching workers'}</p>
                            <Button 
                              onClick={() => {
                                refetchUsers();
                                toast({ title: "Retrying to fetch workers..." });
                              }} 
                              variant="outline" 
                              size="sm" 
                              className="mt-4"
                            >
                              Try Again
                            </Button>
                          </div>
                        ) : !usersData || filteredWorkers.length === 0 ? (
                          <div className="text-center text-gray-500 py-8">
                            <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="font-medium">No workers found</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {workerSearchTerm ? 'No workers match your search criteria' : 'Workers will appear here once they register'}
                            </p>
                          </div>
                        ) : (
                        <div className="overflow-x-auto">
                          <Table className="min-w-[600px] w-full">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                  <TableHead>Mobile</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredWorkers.map((worker) => (
                                  <TableRow key={worker._id}>
                                <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage src={worker.profileImage || worker.photo} alt={worker.displayName || worker.firstName || worker.username || 'Worker'} />
                                          <AvatarFallback>
                                            {(worker.displayName?.substring(0, 2) || worker.firstName?.substring(0, 2) || worker.username?.substring(0, 2) || 'W').toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{worker.displayName || worker.firstName || worker.username || 'Worker'}</span>
                                      </div>
                                </TableCell>
                                    <TableCell>{worker.mobile}</TableCell>
                                    <TableCell>{getDisplayCategory(worker) || 'N/A'}</TableCell>
                                <TableCell>
                                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                        worker.status === 'verified' ? 'bg-green-100 text-green-700' : 
                                        worker.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                        worker.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}>
                                        {worker.status === 'verified' ? 'Verified' : 
                                         worker.status === 'pending' ? 'Pending' : 
                                         worker.status === 'rejected' ? 'Rejected' : 
                                         worker.status || 'Unknown'}
                                      </span>
                                </TableCell>
                                    <TableCell>
                                      {worker.joinedDate ? new Date(worker.joinedDate).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                <TableCell>
                                  <button
                                    className="text-blue-600 hover:underline mr-2"
                                    onClick={() => {
                                      setSelectedWorker(worker);
                                      setViewWorkerModalOpen(true);
                                    }}
                                  >
                                    View
                                  </button>
                                  <button
                                    className="text-blue-600 hover:underline mr-2"
                                    onClick={() => {
                                      setEditWorkerForm(worker);
                                      setEditWorkerImagePreview(null);
                                      setEditWorkerModalOpen(true);
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="text-red-600 hover:underline"
                                    onClick={() => {
                                      setSelectedWorker(worker);
                                      setDeleteWorkerModalOpen(true);
                                    }}
                                  >
                                    Delete
                                  </button>
                                </TableCell>
                              </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                              <TableRow>
                                <TableCell colSpan={6}>
                                  <div className="flex justify-between items-center py-2">
                                      <span className="text-xs text-gray-500">
                                        Showing {filteredWorkers.length} worker{filteredWorkers.length !== 1 ? 's' : ''}
                                      </span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            </TableFooter>
                          </Table>
                        </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="profile">
                    <Card className="w-full">
                      <CardHeader className="flex flex-row items-center gap-2">
                        <button type="button" onClick={() => setActiveSection("dashboard")}
                          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none" aria-label="Back">
                          <ArrowLeft className="h-5 w-5 text-gray-500" />
                        </button>
                        <CardTitle>Edit Profile</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form className="space-y-5" onSubmit={handleProfileSubmit}>
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <label className="block text-black font-medium mb-1">Username</label>
                              <input name="username" value={editProfile.username || ''} onChange={handleProfileChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <label className="block text-black font-medium mb-1">Email</label>
                              <input name="email" type="email" value={editProfile.email || ''} onChange={handleProfileChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                            </div>
                            
                          </div>
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <label className="block text-black font-medium mb-1">Age</label>
                              <input name="age" type="number" value={editProfile.age} onChange={handleProfileChange} required min={18} max={80} className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                            </div>
                          </div>
    <div>
      
                              <label className="block text-black font-medium mb-1">Mobile</label>
                              <input name="mobile" type="number" value={editProfile.mobile || ''} onChange={handleProfileChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                            
                          </div>
                          <div>
                            <label className="block text-black font-medium mb-1">Address</label>
                            <input name="address" value={editProfile.address} onChange={handleProfileChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
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
                  </TabsContent>
                  <TabsContent value="security">
                    <Card className="w-full">
                      <CardHeader className="flex flex-row items-center gap-2">
                        <button type="button" onClick={() => setActiveSection("dashboard")}
                          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none" aria-label="Back">
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
                  </TabsContent>
                  <TabsContent value="addadmin">
                    <Card className="w-full">
                      <CardHeader className="flex flex-row items-center gap-2">
                        <button type="button" onClick={() => setActiveSection("dashboard")}
                          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none" aria-label="Back">
                          <ArrowLeft className="h-5 w-5 text-gray-500" />
                        </button>
                        <CardTitle>Add Admin</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* Admins Card Grid */}
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold mb-2">All Admins</h3>
                          {adminsLoading ? (
                            <div className="text-center text-gray-500 py-8">
                              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                              <p className="text-gray-600">Loading admins...</p>
                            </div>
                          ) : adminsError ? (
                            <div className="text-center text-red-500 py-8">
                              <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
                              <p className="font-medium">Failed to load admins</p>
                              <p className="text-sm text-gray-600 mt-1">{adminsError.message || 'An error occurred while fetching admins'}</p>
                              <Button onClick={() => refetchAdmins()} variant="outline" size="sm" className="mt-4">Try Again</Button>
                            </div>
                          ) : !adminsData || adminsData.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p className="font-medium">No admins found</p>
                              <p className="text-sm text-gray-600 mt-1">Admins will appear here once they are registered</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {adminsData.map((admin) => (
                                <div key={admin._id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100">
                                  <Avatar className="h-16 w-16 mb-2">
                                    <AvatarImage src={admin.profileImage || admin.photo} alt={admin.username || admin.email} />
                                    <AvatarFallback>{(admin.username?.[0] || admin.email?.[0] || 'A').toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div className="text-center">
                                    <div className="font-semibold text-lg">{admin.username || `${admin.firstName} ${admin.lastName}`}</div>
                                    <div className="text-sm text-gray-600">{admin.email}</div>
                                    <div className="text-sm text-gray-500">{admin.mobile}</div>
                                    <div className="text-xs text-gray-400 mt-1">{getCountryName(admin.country)}</div>
                                  </div>
                                  <div className="flex gap-2 mt-3">
                                    <Button size="sm" variant="outline" onClick={() => { setSelectedAdmin(admin); setViewAdminModalOpen(true); }}>View</Button>
                                    <Button size="sm" variant="destructive" onClick={() => { setSelectedAdmin(admin); setDeleteAdminModalOpen(true); }}>Delete</Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Add Admin Form */}
                        <form className="space-y-5" onSubmit={handleAddAdminSubmit}>
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <label className="block text-black font-medium mb-1">Username</label>
                              <input name="username" value={addAdmin.username} onChange={handleAddAdminChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <label className="block text-black font-medium mb-1">Email</label>
                              <input name="email" type="email" value={addAdmin.email} onChange={handleAddAdminChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
    </div>
                           
                          </div>
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <label className="block text-black font-medium mb-1">Age</label>
                              <input name="age" type="number" value={addAdmin.age} onChange={handleAddAdminChange} required min={18} max={80} className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-black font-medium mb-1">Gender</label>
                              <div className="flex gap-4 mt-2">
                                <label className="inline-flex items-center">
                                  <input type="radio" name="gender" value="male" checked={addAdmin.gender === 'male'} onChange={handleAddAdminChange} className="form-radio text-primary" required />
                                  <span className="ml-2">Male</span>
                                </label>
                                <label className="inline-flex items-center">
                                  <input type="radio" name="gender" value="female" checked={addAdmin.gender === 'female'} onChange={handleAddAdminChange} className="form-radio text-primary" required />
                                  <span className="ml-2">Female</span>
                                </label>
                                <label className="inline-flex items-center">
                                  <input type="radio" name="gender" value="other" checked={addAdmin.gender === 'other'} onChange={handleAddAdminChange} className="form-radio text-primary" required />
                                  <span className="ml-2">Other</span>
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-black font-medium mb-1">Address</label>
                            <input name="address" value={addAdmin.address} onChange={handleAddAdminChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                          </div>
                          <div>
                            <label className="block text-black font-medium mb-1">Mobile</label>
                            <input name="mobile" type="number" value={addAdmin.mobile} onChange={handleAddAdminChange} required className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                          </div>
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <label className="block text-black font-medium mb-1">Country</label>
                              <Select options={countryOptions} value={countryOptions.find(opt => opt.value === addAdmin.country) || null} onChange={handleAddAdminCountryChange} placeholder="Select country" classNamePrefix="react-select" isClearable />
                            </div>
                            <div className="flex-1">
                              <label className="block text-black font-medium mb-1">State</label>
                              <Select options={addAdminStateOptions} value={addAdminStateOptions.find(opt => opt.value === addAdmin.state) || null} onChange={handleAddAdminStateChange} placeholder="Select state" classNamePrefix="react-select" isClearable isDisabled={!addAdmin.country} />
                            </div>
                          </div>
                          <div className="flex-1">
                              <label className="block text-black font-medium mb-1">Password</label>
                              <div className="relative">
                                <input
                                  name="password"
                                  type={showAddAdminPassword ? "text" : "password"}
                                  value={addAdmin.password}
                                  onChange={handleAddAdminChange}
                                  required
                                  className="w-full rounded-lg px-3 py-2 text-black bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition pr-10"
                                />
                                <button
                                  type="button"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                                  onClick={() => setShowAddAdminPassword((prev) => !prev)}
                                  tabIndex={-1}
                                >
                                  {showAddAdminPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </div>
                          <div>
                            <label className="block text-black font-medium mb-1">Profile Image</label>
                            <div {...getAddAdminRootProps()} className={`border-2 border-dashed rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4 mt-2 cursor-pointer ${addAdminIsDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                              <input {...getAddAdminInputProps()} />
                              {addAdminPreviewImage ? (
                                <>
                                  <img src={addAdminPreviewImage} alt="Preview" className="h-16 w-16 rounded-full object-cover border-2 border-primary" />
                                  <button type="button" onClick={removeAddAdminImage} className="ml-2 text-red-500 hover:text-red-700 font-semibold">Remove</button>
                                </>
                              ) : (
                                <span className="text-gray-500">Drag & drop or click to select an image (max 5MB)</span>
                              )}
                            </div>
                            {addAdminFileError && <div className="text-red-500 text-sm mt-1">{addAdminFileError}</div>}
                          </div>
                          <div className="flex justify-end gap-2">
                            <button type="submit" className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-lg transition" disabled={isRegistering}>
                              {isRegistering ? 'Registering...' : 'Add Admin'}
                            </button>
                          </div>
                          {registerError && <div className="text-red-500 text-sm mt-2">{registerError}</div>}
                        </form>
                      </CardContent>
                    </Card>
                    {/* View Admin Modal */}
                    <AlertDialog open={viewAdminModalOpen} onOpenChange={setViewAdminModalOpen}>
                      <AlertDialogContent className="max-w-md w-full sm:w-[90vw] sm:max-w-lg md:max-w-xl mx-auto p-4 overflow-y-auto">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Admin Details</AlertDialogTitle>
                          <AlertDialogDescription>
                            {selectedAdmin && (
                              <div className="flex flex-col items-center gap-2 mt-2 break-words w-full text-center">
                                <span><b>Admin ID:</b> {selectedAdmin._id}</span>
                                <span><b>Name:</b> {selectedAdmin.username || `${selectedAdmin.firstName} ${selectedAdmin.lastName}`}</span>
                                <span><b>Email:</b> {selectedAdmin.email}</span>
                                <span><b>Mobile:</b> {selectedAdmin.mobile}</span>
                                <span><b>Gender:</b> {selectedAdmin.gender}</span>
                                <span><b>Address:</b> {selectedAdmin.address}</span>
                                <span><b>Country:</b> {getCountryName(selectedAdmin.country)}</span>
                                <span><b>State:</b> {getStateName(selectedAdmin.country, selectedAdmin.state)}</span>
                                <span><b>Age:</b> {selectedAdmin.age}</span>
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Close</AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {/* Delete Admin Modal */}
                    <AlertDialog open={deleteAdminModalOpen} onOpenChange={setDeleteAdminModalOpen}>
                      <AlertDialogContent className="max-w-md w-full sm:w-[90vw] sm:max-w-lg md:max-w-xl mx-auto p-4 overflow-y-auto">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Admin</AlertDialogTitle>
                          <AlertDialogDescription>
                            {selectedAdmin && (
                              <div className="flex flex-col items-center gap-2 mt-2">
                                <span>Are you sure you want to delete <b>{selectedAdmin.username || `${selectedAdmin.firstName} ${selectedAdmin.lastName}`}</b>?</span>
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeleteAdminModalOpen(false)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 text-white"
                            onClick={async () => {
                              try {
                                await adminDeleteAdmin(selectedAdmin._id);
                                toast({ title: 'Admin deleted successfully!' });
                                setDeleteAdminModalOpen(false);
                                refetchAdmins();
                              } catch (err) {
                                toast({ title: 'Failed to delete admin', description: err.message, variant: 'destructive' });
                              }
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TabsContent>
                  <TabsContent value="reviews">
                    <Card className="w-full max-w-4xl mx-auto shadow-lg border border-gray-200">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>All Reviews</CardTitle>
                          <CardDescription>Manage and view all reviews from clients.</CardDescription>
                        </div>
                        <Button 
                          onClick={() => refetchReviews()} 
                          disabled={reviewsLoading}
                          variant="outline"
                          size="sm"
                        >
                          {reviewsLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Refresh
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {reviewsLoading ? (
                          <div className="text-center text-gray-500 py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-gray-600">Loading reviews...</p>
                          </div>
                        ) : reviewsError ? (
                          <div className="text-center text-red-500 py-8">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
                            <p className="font-medium">Failed to load reviews</p>
                            <p className="text-sm text-gray-600 mt-1">{reviewsError.message || 'An error occurred while fetching reviews'}</p>
                            <Button 
                              onClick={() => {
                                refetchReviews();
                                toast({ title: "Retrying to fetch reviews..." });
                              }} 
                              variant="outline" 
                              size="sm" 
                              className="mt-4"
                            >
                              Try Again
                            </Button>
                          </div>
                        ) : !reviewsData || reviewsData.length === 0 ? (
                          <div className="text-center text-gray-500 py-8">
                            <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="font-medium">No reviews yet</p>
                            <p className="text-sm text-gray-600 mt-1">Reviews will appear here once clients start rating workers</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-sm text-gray-600">
                                Showing {reviewsData.length} review{reviewsData.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                            {reviewsData.map(review => (
                              <div key={review._id} className="flex flex-col md:flex-row gap-4 items-start border-b pb-4 last:border-b-0 last:pb-0">
                                <Avatar className="h-12 w-12 mx-auto md:mx-0 flex-shrink-0">
                                  <AvatarImage 
                                    src={review.reviewerPhoto || review.reviewer?.photo} 
                                    alt={review.reviewer || review.reviewerName} 
                                  />
                                  <AvatarFallback className="bg-primary text-white">
                                    {(review.reviewer?.[0] || review.reviewerName?.[0] || 'U').toUpperCase()}
                                  </AvatarFallback>
                              </Avatar>
                                <div className="flex-1 w-full min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                                    <span className="font-semibold text-base truncate">
                                      {review.reviewer || review.reviewerName || 'Anonymous'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                  <span className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                          <Star 
                                            key={i} 
                                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                          />
                                    ))}
                                  </span>
                                      <span className="text-xs text-gray-400">
                                        {new Date(review.date || review.createdAt).toLocaleDateString()}
                                      </span>
                                </div>
                                  </div>
                                  <p className="text-sm text-neutral-700 break-words leading-relaxed">
                                    {review.text}
                                  </p>
                                  {review.edited && (
                                    <p className="text-xs text-gray-500 mt-1 italic">(edited)</p>
                                  )}
                              </div>
                              <button
                                  className="text-red-500 hover:text-red-700 p-2 rounded-full transition self-end md:self-center flex-shrink-0"
                                  onClick={() => handleDeleteReview(review._id)}
                                aria-label="Delete review"
                                  title="Delete review"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="feedback">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle>Inbox</CardTitle>
                        <CardDescription>All feedback and support messages from clients and workers (email & mobile).</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* --- Email Feedback Section --- */}
                        <div className="mb-8">
                          <h2 className="text-lg font-semibold mb-4">Email Feedback</h2>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                          <TabsList className="mb-4">
                            <TabsTrigger value="open" className={activeTab === 'open' ? 'bg-green-700 text-white transition-colors duration-300' : 'transition-colors duration-300'}>
                              Open
                              {feedbackData?.filter(m => m.status === "open").length > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
                                  {feedbackData.filter(m => m.status === "open").length}
                                </Badge>
                              )}
                            </TabsTrigger>
                            <TabsTrigger value="in_progress" className={activeTab === 'in_progress' ? 'bg-green-700 text-white transition-colors duration-300' : 'transition-colors duration-300'}>
                              {chatInProgressCount > 0 && (
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                              )}
                              In Progress
                            </TabsTrigger>
                            <TabsTrigger value="closed" className={activeTab === 'closed' ? 'bg-green-700 text-white transition-colors duration-300' : 'transition-colors duration-300'}>
                              Closed
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="open">
                            {feedbackData.length === 0 ? (
                              <div className="text-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                            ) : !feedbackData || feedbackData.filter(m => m.status === "open").length === 0 ? (
                              <div className="text-center py-8">
                                <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-3" />
                                <h3 className="text-lg font-medium">No open messages</h3>
                                <p className="text-neutral-500 mt-1">When users send messages, they'll appear here</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex items-center mb-2">
                                  <Checkbox checked={selectedOpenMessageIds.length === feedbackData.filter(m => m.status === 'open').length && feedbackData.filter(m => m.status === 'open').length > 0} onCheckedChange={() => {
                                    if (selectedOpenMessageIds.length === feedbackData.filter(m => m.status === 'open').length) {
                                      setSelectedOpenMessageIds([]);
                                    } else {
                                      setSelectedOpenMessageIds(feedbackData.filter(m => m.status === 'open').map(m => m._id));
                                    }
                                  }} />
                                  <span className="ml-2 text-sm">Select All</span>
                                  {selectedOpenMessageIds.length > 0 && (
                                    <Button variant="destructive" size="sm" className="ml-4" onClick={async () => {
                                      for (const id of selectedOpenMessageIds) {
                                        await deleteFeedback(id);
                                      }
                                      setSelectedOpenMessageIds([]);
                                      refetchFeedback();
                                      toast({ title: 'Deleted', description: 'Selected messages deleted.', variant: 'default' });
                                    }}>Delete Selected</Button>
                                  )}
                                  {selectedOpenMessageIds.length > 0 && (
                                    <span className="ml-2 text-xs text-neutral-500">{selectedOpenMessageIds.length} selected</span>
                                  )}
                                </div>
                                {feedbackData.filter(m => m.status === 'open').map(msg => (
                                  <div key={msg._id} className={`border rounded-md p-4 flex flex-col md:flex-row md:items-center gap-4 relative ${selectedOpenMessageIds.includes(msg._id) ? 'bg-blue-50 border-blue-300' : ''}`}>
                                    <div className="absolute left-2 top-2">
                                      <Checkbox checked={selectedOpenMessageIds.includes(msg._id)} onCheckedChange={() => setSelectedOpenMessageIds(selectedOpenMessageIds.includes(msg._id) ? selectedOpenMessageIds.filter(id => id !== msg._id) : [...selectedOpenMessageIds, msg._id])} />
                                    </div>
                                    <Avatar className="h-12 w-12 ml-8 md:ml-0">
                                      <AvatarImage src={msg.profileImage} alt={msg.displayName || msg.name} />
                                      <AvatarFallback>{(msg.displayName?.[0] || msg.name?.[0] || 'U').toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                        <h3 className="font-medium">{msg.displayName || msg.name}</h3>
                                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Open</Badge>
                                      </div>
                                      <p className="text-sm text-neutral-500">{msg.email || msg.phone}</p>
                                      <p className="text-sm text-neutral-500">{msg.subject}</p>
                                      <p className="text-sm text-neutral-500">Received on {new Date(msg.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="flex items-center" 
                                      onClick={async () => {
                                        setViewMessage(msg);
                                        if (msg.status === 'open') {
                                          await updateFeedbackStatus(msg._id, 'in_progress');
                                          refetchFeedback();
                                        }
                                      }}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </TabsContent>
                          <TabsContent value="in_progress">
                            {feedbackData.length === 0 ? (
                              <div className="flex justify-center items-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                            ) : !feedbackData || feedbackData.filter(m => m.status === "in_progress").length === 0 ? (
                              <div className="text-center py-8">
                                <Verified className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                <h3 className="text-lg font-medium">No in-progress messages</h3>
                                <p className="text-neutral-500 mt-1">Messages being handled will appear here</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex items-center mb-2">
                                  <Checkbox checked={selectedInProgressMessageIds.length === feedbackData.filter(m => m.status === 'in_progress').length && feedbackData.filter(m => m.status === 'in_progress').length > 0} onCheckedChange={() => {
                                    if (selectedInProgressMessageIds.length === feedbackData.filter(m => m.status === 'in_progress').length) {
                                      setSelectedInProgressMessageIds([]);
                                    } else {
                                      setSelectedInProgressMessageIds(feedbackData.filter(m => m.status === 'in_progress').map(m => m._id));
                                    }
                                  }} />
                                  <span className="ml-2 text-sm">Select All</span>
                                  {selectedInProgressMessageIds.length > 0 && (
                                    <Button variant="destructive" size="sm" className="ml-4" onClick={async () => {
                                      for (const id of selectedInProgressMessageIds) {
                                        await deleteFeedback(id);
                                      }
                                      setSelectedInProgressMessageIds([]);
                                      refetchFeedback();
                                      toast({ title: 'Deleted', description: 'Selected messages deleted.', variant: 'default' });
                                    }}>Delete Selected</Button>
                                  )}
                                  {selectedInProgressMessageIds.length > 0 && (
                                    <span className="ml-2 text-xs text-neutral-500">{selectedInProgressMessageIds.length} selected</span>
                                  )}
                                </div>
                                  {feedbackData.filter(m => m.status === 'in_progress').map(msg => {
                                    const hasUnread = msg.replies && msg.replies.length > 0 && msg.replies[msg.replies.length - 1].sender !== 'admin';
                                    return (
                                  <div key={msg._id} className={`border rounded-md p-4 flex flex-col md:flex-row md:items-center gap-4 relative ${selectedInProgressMessageIds.includes(msg._id) ? 'bg-blue-50 border-blue-300' : ''}`}>
                                        {/* Blue dot for unread */}
                                        {hasUnread && <span className="absolute left-0 top-0 w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>}
                                    <div className="absolute left-2 top-2">
                                      <Checkbox checked={selectedInProgressMessageIds.includes(msg._id)} onCheckedChange={() => setSelectedInProgressMessageIds(selectedInProgressMessageIds.includes(msg._id) ? selectedInProgressMessageIds.filter(id => id !== msg._id) : [...selectedInProgressMessageIds, msg._id])} />
                                    </div>
                                    <Avatar className="h-12 w-12">
                                      <AvatarImage src={msg.profileImage} alt={msg.displayName || msg.name} />
                                      <AvatarFallback>{(msg.displayName?.[0] || msg.name?.[0] || 'U').toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                        <h3 className="font-medium">{msg.displayName || msg.name}</h3>
                                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">In Progress</Badge>
                                      </div>
                                      <p className="text-sm text-neutral-500">{msg.email || msg.phone}</p>
                                      <p className="text-sm text-neutral-500">{msg.subject}</p>
                                      <p className="text-sm text-neutral-500">Received on {new Date(msg.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="flex items-center" 
                                      onClick={() => setViewMessage(msg)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      View Details
                                    </Button>
                                  </div>
                                    );
                                  })}
                              </div>
                            )}
                          </TabsContent>
                          <TabsContent value="closed">
                            {feedbackData.length === 0 ? (
                              <div className="flex justify-center items-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                            ) : !feedbackData || feedbackData.filter(m => m.status === "closed").length === 0 ? (
                              <div className="text-center py-8">
                                <X className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                <h3 className="text-lg font-medium">No closed messages</h3>
                                <p className="text-neutral-500 mt-1">Closed messages will appear here</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex items-center mb-2">
                                  <Checkbox checked={selectedClosedMessageIds.length === feedbackData.filter(m => m.status === 'closed').length && feedbackData.filter(m => m.status === 'closed').length > 0} onCheckedChange={() => {
                                    if (selectedClosedMessageIds.length === feedbackData.filter(m => m.status === 'closed').length) {
                                      setSelectedClosedMessageIds([]);
                                    } else {
                                      setSelectedClosedMessageIds(feedbackData.filter(m => m.status === 'closed').map(m => m._id));
                                    }
                                  }} />
                                  <span className="ml-2 text-sm">Select All</span>
                                  {selectedClosedMessageIds.length > 0 && (
                                    <Button variant="destructive" size="sm" className="ml-4" onClick={async () => {
                                      for (const id of selectedClosedMessageIds) {
                                        await deleteFeedback(id);
                                      }
                                      setSelectedClosedMessageIds([]);
                                      refetchFeedback();
                                      toast({ title: 'Deleted', description: 'Selected messages deleted.', variant: 'default' });
                                    }}>Delete Selected</Button>
                                  )}
                                  {selectedClosedMessageIds.length > 0 && (
                                    <span className="ml-2 text-xs text-neutral-500">{selectedClosedMessageIds.length} selected</span>
                                  )}
                                </div>
                                {feedbackData.filter(m => m.status === 'closed').map(msg => (
                                  <div key={msg._id} className={`border rounded-md p-4 flex flex-col md:flex-row md:items-center gap-4 relative ${selectedClosedMessageIds.includes(msg._id) ? 'bg-blue-50 border-blue-300' : ''}`}>
                                    <div className="absolute left-2 top-2">
                                      <Checkbox checked={selectedClosedMessageIds.includes(msg._id)} onCheckedChange={() => setSelectedClosedMessageIds(selectedClosedMessageIds.includes(msg._id) ? selectedClosedMessageIds.filter(id => id !== msg._id) : [...selectedClosedMessageIds, msg._id])} />
                                    </div>
                                    <Avatar className="h-12 w-12">
                                      <AvatarImage src={msg.profileImage} alt={msg.displayName || msg.name} />
                                      <AvatarFallback>{(msg.displayName?.[0] || msg.name?.[0] || 'U').toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                        <h3 className="font-medium">{msg.displayName || msg.name}</h3>
                                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Closed</Badge>
                                      </div>
                                      <p className="text-sm text-neutral-500">{msg.email || msg.phone}</p>
                                      <p className="text-sm text-neutral-500">{msg.subject}</p>
                                      <p className="text-sm text-neutral-500">Received on {new Date(msg.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="flex items-center" 
                                      onClick={() => setViewMessage(msg)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      View Details
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                        </div>
                        {/* --- Support Chat Section --- */}
                        <div className="mt-8">
                          <h2 className="text-lg font-semibold mb-4">Mobile Support Chat</h2>
                          {/* Tabs for chat status */}
                          <div className="mb-4 flex gap-2">
                            <button
                              className={`px-4 py-2 rounded ${activeChatTab === "open" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700"}`}
                              onClick={() => setActiveChatTab("open")}
                            >
                              Open
                              {typeof chatUnreadCount === "number" && chatUnreadCount > 0 && (
                                <span className="ml-2 bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs font-semibold">
                                  {chatUnreadCount}
                                </span>
                              )}
                            </button>
                            <button
                              className={`px-4 py-2 rounded ${activeChatTab === "in_progress" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700"}`}
                              onClick={() => setActiveChatTab("in_progress")}
                            >
                              {chatInProgressCount > 0 && (
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                              )}
                              In Progress
                            </button>
                            <button
                              className={`px-4 py-2 rounded ${activeChatTab === "closed" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700"}`}
                              onClick={() => setActiveChatTab("closed")}
                            >
                              Closed
                            </button>
                          </div>
                          {/* Thread list, filtered by tab */}
                          <div className="space-y-4">
                            {filteredChatThreads.length === 0 && !chatLoading && (
                              <div className="text-gray-500">No chat threads in this status</div>
                            )}
                            {chatLoading && (
                              <div className="text-gray-400">Loading threads...</div>
                            )}
                            {filteredChatThreads.map(thread => (
                              <div
                                key={thread._id}
                                className={`border rounded-md p-4 flex flex-col md:flex-row md:items-center gap-4 relative cursor-pointer ${selectedThread?._id === thread._id ? 'bg-green-50 border-green-300' : ''}`}
                                onClick={async () => {
                                  // If thread is open, mark as in_progress
                                  if (thread.status === "open") {
                                    await fetch(`/api/v1/chat/thread-status`, {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ threadId: thread._id, status: "in_progress" }),
                                      credentials: "include"
                                    });
                                    // Refetch threads to update UI and get the updated thread
                                    fetch("/api/v1/chat/threads", { credentials: "include" })
                                      .then(res => res.json())
                                      .then(updatedThreads => {
                                        setChatThreads(updatedThreads);
                                        // Find the updated thread and set it as selected
                                        const updated = updatedThreads.find(t => t._id === thread._id);
                                        setSelectedThread(updated || thread);
                                      });
                                  } else {
                                    setSelectedThread(thread);
                                  }
                                }}
                              >
                                {/* Unread blue dot */}
                                {thread.unreadCount > 0 && (
                                  <span className="absolute left-0 top-0 w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                                )}
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={thread.profileImage || thread.userDetails?.profileImage || ''} alt={thread.displayName || thread.userDetails?.displayName || 'U'} />
                                  <AvatarFallback>{(thread.displayName?.[0] || thread.userDetails?.displayName?.[0] || 'U').toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-base truncate">{thread.displayName || thread.userDetails?.displayName || 'User'}</span>
                                {/* Add userType badge */}
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${thread.userType === 'client' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{thread.userType === 'client' ? 'Client' : 'Worker'}</span>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <span className="truncate max-w-xs">{thread.lastMessage?.message || ''}</span>
                                  <span className="text-xs text-gray-400">{thread.lastMessage?.sentAt ? new Date(thread.lastMessage.sentAt).toLocaleDateString() : ''}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* Chat Modal */}
                          <AlertDialog open={!!selectedThread} onOpenChange={() => { setSelectedThread(null); setAdminReply(""); }}>
                            <AlertDialogContent className="max-w-3xl w-full p-0 overflow-hidden bg-white shadow-2xl rounded-xl">
                              <div className="flex flex-col h-[70vh]">
                                {/* Header */}
                                <div className="flex items-center justify-between border-b px-8 py-4 bg-gray-50">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                      <AvatarImage src={selectedThread?.profileImage || selectedThread?.userDetails?.profileImage || ''} alt={selectedThread?.displayName || selectedThread?.userDetails?.displayName || selectedThread?.username || 'U'} />
                                      <AvatarFallback>{(selectedThread?.displayName?.[0] || selectedThread?.userDetails?.displayName?.[0] || selectedThread?.username?.[0] || 'U').toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-semibold text-lg text-gray-900">{selectedThread?.displayName || selectedThread?.userDetails?.displayName || selectedThread?.username || selectedThread?.userId || selectedThread?.workerId}</div>
                                      <div className="text-xs text-gray-500">Thread ID: {selectedThread?._id}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${selectedThread?.status === 'open' ? 'bg-blue-100 text-blue-800' : selectedThread?.status === 'closed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{selectedThread?.status?.charAt(0).toUpperCase() + selectedThread?.status?.slice(1)}</span>
                                    <Button variant="ghost" size="icon" onClick={() => { setSelectedThread(null); setAdminReply(""); }}><span className="sr-only">Close</span>×</Button>
                                  </div>
                                </div>
                                {/* Message List */}
                                <div className="flex-1 overflow-y-auto px-8 py-6 bg-white text-gray-900 text-base">
                                  {chatLoading ? (
                                    <div className="flex justify-center items-center h-full text-gray-400">Loading messages...</div>
                                  ) : chatMessages.length === 0 ? (
                                    <div className="flex justify-center items-center h-full text-gray-400">No messages yet</div>
                                  ) : (
                                    <div className="space-y-3">
                                      {chatMessages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                          <div className={`rounded-lg px-4 py-2 shadow ${msg.sender === 'admin' ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-900'}`}>{msg.message}
                                            <div className="text-xs text-gray-400 mt-1">{new Date(msg.sentAt).toLocaleString()}</div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {/* Close Ticket Button */}
                                {selectedThread?.status !== 'closed' && (
                                  <div className="flex items-center justify-end gap-2 border-t px-8 py-4 bg-gray-50">
                                    <Button
                                      variant="destructive"
                                      onClick={async () => {
                                        await fetch("/api/v1/chat/thread-status", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ threadId: selectedThread._id, status: "closed" }),
                                          credentials: "include"
                                        });
                                        // Refetch threads to update UI
                                        fetch("/api/v1/chat/threads", { credentials: "include" })
                                          .then(res => res.json())
                                          .then(setChatThreads);
                                        setSelectedThread({ ...selectedThread, status: "closed" });
                                      }}
                                    >
                                      Close Ticket
                                    </Button>
                                  </div>
                                )}
                                {/* Reply Box (only if not closed) */}
                                {selectedThread?.status !== 'closed' && (
                                  <div className="flex items-center justify-end gap-2 border-t px-8 py-4 bg-gray-50 sticky bottom-0">
                                    <input
                                      className="flex-1 border rounded px-3 py-2"
                                      value={adminReply}
                                      onChange={e => setAdminReply(e.target.value)}
                                      placeholder="Type your reply…"
                                      disabled={chatLoading}
                                    />
                                    <Button
                                      className="bg-green-600 text-white px-6 py-2 rounded"
                                      onClick={handleAdminReply}
                                      disabled={!adminReply.trim() || chatLoading}
                                    >
                                      Send
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        {/* --- End Support Chat Section --- */}
                      </CardContent>
                    </Card>
                    {/* View Message Modal */}
                    {viewMessage && (
                      <AlertDialog open={!!viewMessage} onOpenChange={() => { setViewMessage(null); setReplying(false); setReplyContent(""); }}>
                        <AlertDialogContent className="max-w-3xl w-full p-0 overflow-hidden bg-white shadow-2xl rounded-xl">
                          <div className="flex flex-col h-[70vh]">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b px-8 py-4 bg-gray-50">
                              <div className="flex items-center gap-4">
                                <div className="rounded-full bg-blue-500 w-12 h-12 flex items-center justify-center text-white text-xl font-bold">{viewMessage.name[0]}</div>
                                <div>
                                  <div className="font-semibold text-lg text-gray-900">{viewMessage.name} <span className="text-xs text-gray-500">({viewMessage.email})</span></div>
                                  <div className="text-xs text-gray-500">{new Date(viewMessage.createdAt).toLocaleString()}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${viewMessage.status === 'open' ? 'bg-blue-100 text-blue-800' : viewMessage.status === 'closed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{viewMessage.status.charAt(0).toUpperCase() + viewMessage.status.slice(1)}</span>
                                <Button variant="ghost" size="icon" onClick={() => { setViewMessage(null); setReplying(false); setReplyContent(""); }}><span className="sr-only">Close</span>×</Button>
                              </div>
                            </div>
                            {/* Subject */}
                            <div className="px-8 py-2 border-b bg-white text-xl font-bold text-gray-800">{viewMessage.subject}</div>
                            {/* Message Body */}
                            <div className="flex-1 overflow-y-auto px-8 py-6 bg-white text-gray-900 whitespace-pre-line text-base">
                              {viewMessage.message}
                              {/* Replies Section */}
                              {Array.isArray(viewMessage.replies) && viewMessage.replies.length > 0 && (
                                <div className="mt-8">
                                  <div className="font-semibold text-gray-700 mb-2">Replies</div>
                                  <div className="space-y-3">
                                    {viewMessage.replies.map((reply, idx) => (
                                      <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex flex-col shadow-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-blue-700">{reply.sender || 'Admin'}</span>
                                          <span className="text-xs text-gray-400">{reply.sentAt ? new Date(reply.sentAt).toLocaleString() : ''}</span>
                                        </div>
                                        <div className="text-gray-800">{reply.message}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* Actions Footer */}
                            <div className="flex items-center justify-end gap-2 border-t px-8 py-4 bg-gray-50 sticky bottom-0">
                              {viewMessage.status !== 'closed' && !replying && (
                                <Button variant="destructive" onClick={async () => {
                                  await updateFeedbackStatus(viewMessage._id, 'closed');
                                  setViewMessage(prev => ({ ...prev, status: 'closed' }));
                                  toast({ title: 'Ticket closed', description: 'The ticket has been closed successfully.', variant: 'success' });
                                  refetchFeedback(); // Immediate update
                                }}>Close Ticket</Button>
                              )}
                              {replying ? (
                                <form
                                  onSubmit={async e => {
                                    e.preventDefault();
                                    setReplyLoading(true);
                                    try {
                                      await replyFeedback(viewMessage._id, replyContent);
                                      toast({ title: 'Reply sent!', description: 'Your reply was sent successfully.', variant: 'success' });
                                      setReplying(false);
                                      setReplyContent("");
                                      setViewMessage(null);
                                      refetchFeedback();
                                    } catch (err) {
                                      toast({
                                        title: "Error",
                                        description: err.message || "Failed to send reply",
                                        variant: "destructive",
                                      });
                                    } finally {
                                      setReplyLoading(false);
                                    }
                                  }}
                                  className="w-full max-w-xl mx-auto animate-fade-in"
                                >
                                  <div className="relative bg-white border border-gray-200 rounded-xl shadow p-4 flex flex-col gap-3 w-full">
                                    <label htmlFor="replyContent" className="text-sm font-medium text-gray-700 mb-1">Your Reply</label>
                                    <Input
                                      id="replyContent"
                                      className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base bg-gray-50"
                                      type="text"
                                      value={replyContent}
                                      onChange={e => setReplyContent(e.target.value)}
                                      placeholder="Type your reply..."
                                      required
                                      autoFocus
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                      <Button type="button" variant="outline" onClick={() => setReplying(false)} className="rounded-lg" disabled={replyLoading}>Cancel</Button>
                                      <Button type="submit" variant="default" className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 shadow transition-all duration-200 flex items-center gap-2" disabled={replyLoading}>
                                        {replyLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Send Reply
                                      </Button>
                                    </div>
                                  </div>
                                </form>
                              ) : (
                                <>
                                  {viewMessage.status !== 'closed' && <Button variant="default" onClick={() => setReplying(true)}>Reply</Button>}
                                  <Button variant="outline" onClick={() => setViewMessage(null)}>Close</Button>
                                </>
                              )}
                            </div>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
      
      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteReview}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Client Modal */}
      <AlertDialog open={addClientModalOpen} onOpenChange={setAddClientModalOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Client</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new client account. All fields marked with * are required.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleAddClientSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input
                  name="firstName"
                  value={addClient.firstName}
                  onChange={handleAddClientChange}
                  required
                  className="w-full rounded-lg px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input
                  name="lastName"
                  value={addClient.lastName}
                  onChange={handleAddClientChange}
                  required
                  className="w-full rounded-lg px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mobile *</label>
                <input
                  name="mobile"
                  type="tel"
                  value={addClient.mobile}
                  onChange={handleAddClientChange}
                  required
                  className="w-full rounded-lg px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showAddClientPassword ? "text" : "password"}
                    value={addClient.password}
                    onChange={handleAddClientChange}
                    required
                    className="w-full rounded-lg px-3 py-2 pr-10 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowAddClientPassword(!showAddClientPassword)}
                  >
                    {showAddClientPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input
                  name="age"
                  type="number"
                  value={addClient.age}
                  onChange={handleAddClientChange}
                  required min={18} max={80}
                  className="w-full rounded-lg px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <div className="flex gap-4 mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={addClient.gender === 'male'}
                      onChange={handleAddClientChange}
                      className="form-radio text-primary"
                    />
                    <span className="ml-2">Male</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={addClient.gender === 'female'}
                      onChange={handleAddClientChange}
                      className="form-radio text-primary"
                    />
                    <span className="ml-2">Female</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="other"
                      checked={addClient.gender === 'other'}
                      onChange={handleAddClientChange}
                      className="form-radio text-primary"
                    />
                    <span className="ml-2">Other</span>
                  </label>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                name="address"
                value={addClient.address}
                onChange={handleAddClientChange}
                className="w-full rounded-lg px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <Select
                  options={countryOptions}
                  value={countryOptions.find(opt => opt.value === addClient.country) || null}
                  onChange={handleAddClientCountryChange}
                  placeholder="Select country"
                  classNamePrefix="react-select"
                  isClearable
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <Select
                  options={stateOptions}
                  value={stateOptions.find(opt => opt.value === addClient.state) || null}
                  onChange={handleAddClientStateChange}
                  placeholder="Select state"
                  classNamePrefix="react-select"
                  isClearable
                  isDisabled={!addClient.country}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Profile Picture</label>
              <div className="mt-2">
                {addClientPreviewImage ? (
                  <div className="relative inline-block">
                    <img
                      src={addClientPreviewImage}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeAddClientImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    {...clientDropzone.getRootProps()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  >
                    <input {...clientDropzone.getInputProps()} />
                    <div className="text-gray-600">
                      <p>Drag & drop an image here, or click to select</p>
                      <p className="text-sm text-gray-500 mt-1">Supports: JPG, PNG, GIF (max 5MB)</p>
                    </div>
                  </div>
                )}
                {addClientFileError && (
                  <p className="text-red-500 text-sm mt-1">{addClientFileError}</p>
                )}
              </div>
            </div>
          </form>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddClientSubmit}>
              Create Client
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Worker Modal */}
      <AlertDialog open={addWorkerModalOpen} onOpenChange={setAddWorkerModalOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Worker</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new worker account. All fields marked with * are required.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleAddWorkerSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input
                  name="firstName"
                  value={addWorker.firstName}
                  onChange={handleAddWorkerChange}
                  required
                  className="w-full rounded-lg px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input
                  name="lastName"
                  value={addWorker.lastName}
                  onChange={handleAddWorkerChange}
                  required
                  className="w-full rounded-lg px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mobile *</label>
                <input
                  name="mobile"
                  type="tel"
                  value={addWorker.mobile}
                  onChange={handleAddWorkerChange}
                  required
                  className="w-full rounded-lg px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showAddWorkerPassword ? "text" : "password"}
                    value={addWorker.password}
                    onChange={handleAddWorkerChange}
                    required
                    className="w-full rounded-lg px-3 py-2 pr-10 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowAddWorkerPassword(!showAddWorkerPassword)}
                  >
                    {showAddWorkerPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input
                  name="age"
                  type="number"
                  value={addWorker.age}
                  onChange={handleAddWorkerChange}
                  required min={18} max={80}
                  className="w-full rounded-lg px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Select
                  options={[
                    { value: 'carpenter', label: 'Carpenter' },
                    { value: 'plumber', label: 'Plumber' },
                    { value: 'electrician', label: 'Electrician' },
                    { value: 'painter', label: 'Painter' },
                    { value: 'mason', label: 'Mason' },
                    { value: 'other', label: 'Other' }
                  ]}
                  value={addWorker.category ? { value: addWorker.category, label: addWorker.category.charAt(0).toUpperCase() + addWorker.category.slice(1) } : null}
                  onChange={(selected) => setAddWorker(prev => ({ ...prev, category: selected ? selected.value : '' }))}
                  placeholder="Select category"
                  classNamePrefix="react-select"
                  isClearable
                />
              </div>
            </div>
            {addWorker.category === 'other' && (
              <div>
                <label className="block text-sm font-medium mb-1">Other Category</label>
                <input
                  name="otherCategory"
                  value={addWorker.otherCategory}
                  onChange={handleAddWorkerChange}
                  className="w-full rounded-lg px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                name="address"
                value={addWorker.address}
                onChange={handleAddWorkerChange}
                className="w-full rounded-lg px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <Select
                  options={countryOptions}
                  value={countryOptions.find(opt => opt.value === addWorker.country) || null}
                  onChange={handleAddWorkerCountryChange}
                  placeholder="Select country"
                  classNamePrefix="react-select"
                  isClearable
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <Select
                  options={addWorkerStateOptions}
                  value={addWorkerStateOptions.find(opt => opt.value === addWorker.state) || null}
                  onChange={handleAddWorkerStateChange}
                  placeholder="Select state"
                  classNamePrefix="react-select"
                  isClearable
                  isDisabled={!addWorker.country}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <div className="flex gap-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={addWorker.gender === 'male'}
                    onChange={handleAddWorkerChange}
                    className="form-radio text-primary"
                  />
                  <span className="ml-2">Male</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={addWorker.gender === 'female'}
                    onChange={handleAddWorkerChange}
                    className="form-radio text-primary"
                  />
                  <span className="ml-2">Female</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={addWorker.gender === 'other'}
                    onChange={handleAddWorkerChange}
                    className="form-radio text-primary"
                  />
                  <span className="ml-2">Other</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Profile Picture</label>
              <div className="mt-2">
                {addWorkerPreviewImage ? (
                  <div className="relative inline-block">
                    <img
                      src={addWorkerPreviewImage}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeAddWorkerImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    {...workerDropzone.getRootProps()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  >
                    <input {...workerDropzone.getInputProps()} />
                    <div className="text-gray-600">
                      <p>Drag & drop an image here, or click to select</p>
                      <p className="text-sm text-gray-500 mt-1">Supports: JPG, PNG, GIF (max 5MB)</p>
                    </div>
                  </div>
                )}
                {addWorkerFileError && (
                  <p className="text-red-500 text-sm mt-1">{addWorkerFileError}</p>
                )}
              </div>
            </div>
          </form>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddWorkerSubmit}>
              Create Worker
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Details Modal */}
      <AlertDialog open={viewUserModalOpen} onOpenChange={setViewUserModalOpen}>
        <AlertDialogContent className="max-w-md w-full sm:w-[90vw] sm:max-w-lg md:max-w-xl mx-auto p-4 overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>User Details</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser && (
                <div className="flex flex-col items-center gap-2 mt-2 break-words w-full text-center">
                  <span><b>User ID:</b> {selectedUser._id}</span>
                  <span><b>Name:</b> {selectedUser.displayName || selectedUser.firstName || selectedUser.username || 'User'}</span>
                  <span><b>Email:</b> {selectedUser.email || 'N/A'}</span>
                  <span><b>Mobile:</b> {selectedUser.mobile || 'N/A'}</span>
                  <span><b>Gender:</b> {selectedUser.gender || 'N/A'}</span>
                  <span><b>Address:</b> {selectedUser.address || 'N/A'}</span>
                  <span><b>Country:</b> {getCountryName(selectedUser.country)}</span>
                  <span><b>State:</b> {getStateName(selectedUser.country, selectedUser.state)}</span>
                  <span><b>Status:</b> {selectedUser.status}</span>
                  <span><b>Joined:</b> {selectedUser.joinedDate ? new Date(selectedUser.joinedDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Modal */}
      <AlertDialog open={editUserModalOpen} onOpenChange={setEditUserModalOpen}>
        <AlertDialogContent className="max-w-md w-full sm:w-[90vw] sm:max-w-lg md:max-w-xl mx-auto p-4 overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit User</AlertDialogTitle>
            <AlertDialogDescription>
              {editUserForm && (
                <form
                  className="flex flex-col gap-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await adminUpdateUser(editUserForm._id, editUserForm);
                      toast({ title: 'User updated successfully!' });
                      setEditUserModalOpen(false);
                      refetchUsers();
                      setEditUserImagePreview(null);
                    } catch (err) {
                      toast({ title: 'Failed to update user', description: err.message, variant: 'destructive' });
                    }
                  }}
                >
                  <input className="hidden" value={editUserForm._id} readOnly />
                  {/* Profile Image Dropzone */}
                  <div className="flex flex-col items-center gap-2">
                    <div {...getEditUserImageRootProps()} className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                      <input {...getEditUserImageInputProps()} />
                      {(editUserImagePreview || editUserForm.profileImage || editUserForm.photo) ? (
                        <img
                          src={
                            editUserImagePreview ||
                            (editUserForm.profileImage instanceof File
                              ? undefined
                              : editUserForm.profileImage) ||
                            editUserForm.photo
                          }
                          alt="Profile Preview"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400">{isEditUserImageDragActive ? 'Drop image here' : 'Click or drag image'}</span>
                      )}
                    </div>
                  </div>
                  <input className="border rounded p-2" value={editUserForm.displayName || ''} onChange={e => setEditUserForm(f => ({ ...f, displayName: e.target.value }))} placeholder="Name" required />
                  <input className="border rounded p-2" value={editUserForm.email || ''} onChange={e => setEditUserForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" />
                  <input className="border rounded p-2" value={editUserForm.mobile || ''} onChange={e => setEditUserForm(f => ({ ...f, mobile: e.target.value }))} placeholder="Mobile" />
                  <input className="border rounded p-2" value={editUserForm.gender || ''} onChange={e => setEditUserForm(f => ({ ...f, gender: e.target.value }))} placeholder="Gender" />
                  <input className="border rounded p-2" value={editUserForm.address || ''} onChange={e => setEditUserForm(f => ({ ...f, address: e.target.value }))} placeholder="Address" />
                  {/* Country Dropdown */}
                  <Select
                    options={countryOptions}
                    value={countryOptions.find(opt => opt.value === editUserForm.country) || null}
                    onChange={handleEditUserCountryChange}
                    placeholder="Select country"
                    classNamePrefix="react-select"
                    isClearable
                  />
                  {/* State Dropdown */}
                  <Select
                    options={editUserStateOptions}
                    value={editUserStateOptions.find(opt => opt.value === editUserForm.state) || null}
                    onChange={handleEditUserStateChange}
                    placeholder="Select state"
                    classNamePrefix="react-select"
                    isClearable
                    isDisabled={!editUserForm.country}
                  />
                  <input className="border rounded p-2" value={editUserForm.status || ''} onChange={e => setEditUserForm(f => ({ ...f, status: e.target.value }))} placeholder="Status" />
                  <button type="submit" className="bg-blue-600 text-white rounded p-2 mt-2">Save Changes</button>
                </form>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditUserModalOpen(false)}>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Modal */}
      <AlertDialog open={deleteUserModalOpen} onOpenChange={setDeleteUserModalOpen}>
        <AlertDialogContent className="max-w-md w-full sm:w-[90vw] sm:max-w-lg md:max-w-xl mx-auto p-4 overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser && (
                <div className="flex flex-col items-center gap-2 mt-2">
                  <span>Are you sure you want to delete <b>{selectedUser.displayName}</b>?</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteUserModalOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white"
              onClick={async () => {
                try {
                  await adminDeleteUser(selectedUser._id);
                  toast({ title: 'User deleted successfully!' });
                  setDeleteUserModalOpen(false);
                  refetchUsers();
                } catch (err) {
                  toast({ title: 'Failed to delete user', description: err.message, variant: 'destructive' });
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Worker Details Modal */}
      <AlertDialog open={viewWorkerModalOpen} onOpenChange={setViewWorkerModalOpen}>
        <AlertDialogContent className="max-w-md w-full sm:w-[90vw] sm:max-w-lg md:max-w-xl mx-auto p-4 overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Worker Details</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedWorker && (
                <div className="flex flex-col items-center gap-2 mt-2 break-words w-full text-center">
                  <span><b>Worker ID:</b> {selectedWorker._id}</span>
                  <span><b>Name:</b> {selectedWorker.displayName || selectedWorker.firstName || selectedWorker.username || 'Worker'}</span>
                  <span><b>Mobile:</b> {selectedWorker.mobile || 'N/A'}</span>
                  <span><b>Gender:</b> {selectedWorker.gender || 'N/A'}</span>
                  <span><b>Category:</b> {getDisplayCategory(selectedWorker) || 'N/A'}</span>
                  <span><b>Address:</b> {selectedWorker.address || 'N/A'}</span>
                  <span><b>Country:</b> {getCountryName(selectedWorker.country)}</span>
                  <span><b>State:</b> {getStateName(selectedWorker.country, selectedWorker.state)}</span>
                  <span><b>Status:</b> {selectedWorker.status}</span>
                  <span><b>Joined:</b> {selectedWorker.joinedDate ? new Date(selectedWorker.joinedDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Worker Modal */}
      <AlertDialog open={editWorkerModalOpen} onOpenChange={setEditWorkerModalOpen}>
        <AlertDialogContent className="max-w-md w-full sm:w-[90vw] sm:max-w-lg md:max-w-xl mx-auto p-4 overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Worker</AlertDialogTitle>
            <AlertDialogDescription>
              {editWorkerForm && (
                <form
                  className="flex flex-col gap-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await adminUpdateWorker(editWorkerForm._id, editWorkerForm);
                      toast({ title: 'Worker updated successfully!' });
                      setEditWorkerModalOpen(false);
                      refetchUsers();
                      setEditWorkerImagePreview(null);
                    } catch (err) {
                      toast({ title: 'Failed to update worker', description: err.message, variant: 'destructive' });
                    }
                  }}
                >
                  <input className="hidden" value={editWorkerForm._id} readOnly />
                  {/* Profile Image Dropzone */}
                  <div className="flex flex-col items-center gap-2">
                    <div {...getEditWorkerImageRootProps()} className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                      <input {...getEditWorkerImageInputProps()} />
                      {(editWorkerImagePreview || editWorkerForm.profileImage || editWorkerForm.photo) ? (
                        <img
                          src={
                            editWorkerImagePreview ||
                            (editWorkerForm.profileImage instanceof File
                              ? undefined
                              : editWorkerForm.profileImage) ||
                            editWorkerForm.photo
                          }
                          alt="Profile Preview"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400">{isEditWorkerImageDragActive ? 'Drop image here' : 'Click or drag image'}</span>
                      )}
                    </div>
                  </div>
                  <input className="border rounded p-2" value={editWorkerForm.displayName || ''} onChange={e => setEditWorkerForm(f => ({ ...f, displayName: e.target.value }))} placeholder="Name" required />
                  <input className="border rounded p-2" value={editWorkerForm.mobile || ''} onChange={e => setEditWorkerForm(f => ({ ...f, mobile: e.target.value }))} placeholder="Mobile" />
                  <input className="border rounded p-2" value={editWorkerForm.gender || ''} onChange={e => setEditWorkerForm(f => ({ ...f, gender: e.target.value }))} placeholder="Gender" />
                  <input className="border rounded p-2" value={editWorkerForm.category || ''} onChange={e => setEditWorkerForm(f => ({ ...f, category: e.target.value }))} placeholder="Category" />
                  <input className="border rounded p-2" value={editWorkerForm.address || ''} onChange={e => setEditWorkerForm(f => ({ ...f, address: e.target.value }))} placeholder="Address" />
                  {/* Country Dropdown */}
                  <Select
                    options={countryOptions}
                    value={countryOptions.find(opt => opt.value === editWorkerForm.country) || null}
                    onChange={handleEditWorkerCountryChange}
                    placeholder="Select country"
                    classNamePrefix="react-select"
                    isClearable
                  />
                  {/* State Dropdown */}
                  <Select
                    options={editWorkerStateOptions}
                    value={editWorkerStateOptions.find(opt => opt.value === editWorkerForm.state) || null}
                    onChange={handleEditWorkerStateChange}
                    placeholder="Select state"
                    classNamePrefix="react-select"
                    isClearable
                    isDisabled={!editWorkerForm.country}
                  />
                  <input className="border rounded p-2" value={editWorkerForm.status || ''} onChange={e => setEditWorkerForm(f => ({ ...f, status: e.target.value }))} placeholder="Status" />
                  <button type="submit" className="bg-blue-600 text-white rounded p-2 mt-2">Save Changes</button>
                </form>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditWorkerModalOpen(false)}>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Worker Modal */}
      <AlertDialog open={deleteWorkerModalOpen} onOpenChange={setDeleteWorkerModalOpen}>
        <AlertDialogContent className="max-w-md w-full sm:w-[90vw] sm:max-w-lg md:max-w-xl mx-auto p-4 overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Worker</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedWorker && (
                <div className="flex flex-col items-center gap-2 mt-2">
                  <span>Are you sure you want to delete <b>{selectedWorker.displayName}</b>?</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteWorkerModalOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white"
              onClick={async () => {
                try {
                  await adminDeleteWorker(selectedWorker._id);
                  toast({ title: 'Worker deleted successfully!' });
                  setDeleteWorkerModalOpen(false);
                  refetchUsers();
                } catch (err) {
                  toast({ title: 'Failed to delete worker', description: err.message, variant: 'destructive' });
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}