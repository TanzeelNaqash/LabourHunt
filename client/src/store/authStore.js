import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '@/lib/queryClient';

const initialVerifiedPhone = typeof window !== 'undefined' ? localStorage.getItem('verifiedPhone') : null;

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      verifiedPhone: initialVerifiedPhone,
      registrationData: null,
      currentRole: null, // 'worker' | 'client' | 'admin'
      isAuthenticated: false,
      user: null, // for client
      worker: null, // for worker
      admin: null, // for admin
      isLoading: false,
      error: null,
      reviewsNeedRefresh: false,
      loginTimestamp: null, // Add timestamp for cache invalidation

      // Actions
      setVerifiedPhone: (phone) => {
        set({ verifiedPhone: phone });
        if (typeof window !== 'undefined') {
          if (phone) {
            localStorage.setItem('verifiedPhone', phone);
          } else {
            localStorage.removeItem('verifiedPhone');
          }
        }
      },
      setRegistrationData: (data) => set({ registrationData: data }),
      setCurrentRole: (role) => {
        // Clear all user data when switching roles to prevent confusion
        set({ 
          currentRole: role,
          user: null,
          worker: null,
          admin: null,
          isAuthenticated: false,
          error: null
        });
      },
      clearRegistration: () => set({ registrationData: null, verifiedPhone: null, currentRole: null }),

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setUser: (user) => set({ user }),
      setWorker: (worker) => set({ worker }),
      setAdmin: (admin) => set({ admin }),

      // Dynamic register
      register: async (userData) => {
        set({ isLoading: true, error: null });
        const { currentRole } = get();
        let endpoint = '';
        if (currentRole === 'worker') endpoint = '/api/v1/workers';
        else if (currentRole === 'client') endpoint = '/api/v1/users';
        else if (currentRole === 'admin') endpoint = '/api/v1/admin/register';
        else throw new Error('Unknown role for registration');

        console.log('authStore register: currentRole =', currentRole);
        console.log('authStore register: endpoint =', endpoint);
        console.log('authStore register: userData =', userData);

        try {
          let response, data;
          const hasFile = Object.values(userData).some(
            v => v instanceof File || v instanceof Blob
          );
          if (hasFile) {
            const formData = new FormData();
            Object.entries(userData).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                formData.append(key, value);
              }
            });
            response = await fetch(endpoint, {
              method: 'POST',
              body: formData,
            });
          } else {
            response = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userData),
            });
          }
          data = await response.json();
          console.log('authStore register: backend response =', data);
          if (!response.ok) throw new Error(data.message || 'Registration failed');
          
          // Clear all queries and set login timestamp
          queryClient.clear();
          const loginTimestamp = Date.now();
          
          if (currentRole === 'worker') {
            set({ isAuthenticated: true, worker: data.worker, user: null, admin: null, isLoading: false, loginTimestamp });
          } else if (currentRole === 'admin') {
            set({ isAuthenticated: true, admin: data.admin, user: null, worker: null, isLoading: false, loginTimestamp });
          } else {
            set({ isAuthenticated: true, user: data.user, worker: null, admin: null, isLoading: false, loginTimestamp });
          }
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          console.error('authStore register: error =', error);
          throw error;
        }
      },

      // Dynamic login
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        const { currentRole } = get();
        let endpoint = '';
        if (currentRole === 'worker') {
          endpoint = '/api/v1/workers/login';
          console.log('Login endpoint selected: worker', endpoint);
        } else if (currentRole === 'client') {
          endpoint = '/api/v1/users/login';
          console.log('Login endpoint selected: client', endpoint);
        } else if (currentRole === 'admin') {
          endpoint = '/api/v1/admin/login';
          console.log('Login endpoint selected: admin', endpoint);
        } else {
          console.error('Unknown role for login:', currentRole);
          throw new Error('Unknown role for login');
        }

        try {
          console.log('Sending credentials:', credentials);
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
            credentials: 'include',
          });
          const data = await response.json();
          console.log('Login response data:', data);
          if (!response.ok) throw new Error(data.message || 'Login failed');
          
          // Clear all queries and set login timestamp
          queryClient.clear();
          const loginTimestamp = Date.now();
          
          if (currentRole === 'worker') {
            set({
              isAuthenticated: true,
              worker: data.worker,
              user: null,
              admin: null,
              verifiedPhone: data.worker?.mobile || null,
              isLoading: false,
              loginTimestamp
            });
          } else if (currentRole === 'admin') {
            set({
              isAuthenticated: true,
              user: null,
              worker: null,
              admin: data.admin,
              verifiedPhone: data.admin?.mobile || null,
              isLoading: false,
              loginTimestamp
            });
          } else {
            set({
              isAuthenticated: true,
              user: data.user,
              worker: null,
              admin: null,
              verifiedPhone: data.user?.mobile || null,
              isLoading: false,
              loginTimestamp
            });
          }
          return data; // return user for role-based redirect
        } catch (error) {
          console.error('Login error:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Call server logout endpoint to invalidate session
          const { currentRole } = get();
          let endpoint = '';
          if (currentRole === 'worker') endpoint = '/api/v1/workers/logout';
          else if (currentRole === 'admin') endpoint = '/api/v1/admin/logout';
          else endpoint = '/api/v1/users/logout';
          
          // Try to call logout endpoint (don't fail if it doesn't work)
          try {
            await fetch(endpoint, {
              method: 'POST',
              credentials: 'include',
            });
          } catch (error) {
            console.warn('Server logout failed, but continuing with client logout:', error);
          }
          
          // Clear all state
          set({ 
            isAuthenticated: false, 
            user: null, 
            worker: null, 
            admin: null, 
            verifiedPhone: null, 
            registrationData: null, 
            currentRole: null, 
            error: null,
            reviewsNeedRefresh: false,
            isLoading: false,
            loginTimestamp: null
          });
          
          // Clear any cached data
          queryClient.clear();
          
          // Let components handle navigation - no forced navigation here
        } catch (error) {
          console.error('Logout error:', error);
          // Even if there's an error, clear the local state
          set({ 
            isAuthenticated: false, 
            user: null, 
            worker: null, 
            admin: null, 
            verifiedPhone: null, 
            registrationData: null, 
            currentRole: null, 
            error: null,
            reviewsNeedRefresh: false,
            isLoading: false,
            loginTimestamp: null
          });
          queryClient.clear();
          // Let components handle navigation - no forced navigation here
        }
      },

      clearError: () => set({ error: null }),
      clearVerifiedPhone: () => set({ verifiedPhone: null }),

      // Update profile
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        const { currentRole } = get();
        let endpoint = '';
        if (currentRole === 'worker') endpoint = '/api/v1/workers/me';
        else if (currentRole === 'admin') endpoint = '/api/v1/admin/me';
        else endpoint = '/api/v1/users/me';
        try {
          let response, data;
          // Use FormData if either profileImage or idProof is a File
          const hasFile = (profileData.profileImage instanceof File) || (profileData.idProof instanceof File);
          if (hasFile) {
            const formData = new FormData();
            Object.entries(profileData).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                formData.append(key, value);
              }
            });
            response = await fetch(endpoint, {
              method: 'PATCH',
              body: formData,
              credentials: 'include',
            });
          } else {
            response = await fetch(endpoint, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(profileData),
              credentials: 'include',
            });
          }
          data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Profile update failed');
          if (currentRole === 'worker') {
            set({ worker: data, isLoading: false });
          } else if (currentRole === 'admin') {
            set({ admin: data, isLoading: false });
          } else {
            set({ user: data, isLoading: false });
          }
          set({ reviewsNeedRefresh: true });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Update password
      updatePassword: async ({ currentPassword, newPassword }) => {
        set({ isLoading: true, error: null });
        const { currentRole } = get();
        let endpoint = '';
        if (currentRole === 'worker') endpoint = '/api/v1/workers/me/password';
        else if (currentRole === 'admin') endpoint = '/api/v1/admin/me/password';
        else endpoint = '/api/v1/users/me/password';
        try {
          const response = await fetch(endpoint, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword }),
            credentials: 'include',
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Password update failed');
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Helper to get the national (local) number from any international phone number
      getNationalNumber: (phone) => {
        try {
          // Try to use libphonenumber-js if available
          if (window && window.libphonenumber) {
            const phoneNumber = window.libphonenumber.parsePhoneNumber(phone);
            if (phoneNumber) return phoneNumber.nationalNumber;
          }
        } catch {
          // ignore
        }
        // fallback: remove leading + and digits up to 10-12 digits
        return phone.replace(/^\+?\d{1,4}/, '');
      },

      // Reset password (forgot password)
      resetPassword: async ({ mobile, newPassword, role = 'client' }) => {
        let endpoint = '';
        if (role === 'worker') endpoint = '/api/v1/workers/reset-password';
        else endpoint = '/api/v1/users/reset-password';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile, newPassword }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Password reset failed');
        return data;
      },

      // Check role by phone (auto-detect client/worker)
      checkRoleByPhone: async (mobile) => {
        // Try user-service first
        let response = await fetch('/api/v1/users/check-phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile })
        });
        let data = await response.json();
        if (data.exists) return 'client';
        // Try worker-service
        response = await fetch('/api/v1/workers/check-phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile })
        });
        data = await response.json();
        if (data.exists) return 'worker';
        return null;
      },

      // Add a review (client only)
      addReview: async (review) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/api/v1/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(review),
            credentials: 'include',
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to add review');
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Reviews management
      fetchReviews: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/v1/admin/reviews', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to fetch reviews');
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Get ALL reviews (new function)
      getAllReviews: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/v1/admin/all-reviews', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to fetch all reviews');
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Get all users and workers for admin management
      getAllUsersForAdmin: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/v1/admin/all-users', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to fetch users');
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Get all admins for admin management
      getAllAdmins: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/v1/admin/users', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to fetch admins');
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Create client from admin dashboard
      createClient: async (clientData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/v1/admin/create-client', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData)
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to create client');
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Create worker from admin dashboard
      createWorker: async (workerData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/v1/admin/create-worker', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(workerData)
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to create worker');
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteReview: async (reviewId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/v1/admin/admin/reviews/${reviewId}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to delete review');
          set({ isLoading: false });
          // Invalidate reviews cache to ensure fresh data
          if (typeof window !== 'undefined' && window.queryClient) {
            window.queryClient.invalidateQueries(['/api/v1/admin/all-reviews']);
          }
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      setReviewsNeedRefresh: (val) => set({ reviewsNeedRefresh: val }),

      // Clear all user data
      clearAllUserData: () => set({ 
        user: null, 
        worker: null, 
        admin: null, 
        isAuthenticated: false, 
        verifiedPhone: null, 
        currentRole: null,
        error: null,
        reviewsNeedRefresh: false,
        loginTimestamp: null
      }),

      // Invalidate user-specific queries
      invalidateUserQueries: () => {
        queryClient.invalidateQueries(['/api/v1/users/me']);
        queryClient.invalidateQueries(['/api/v1/workers/me']);
        queryClient.invalidateQueries(['/api/v1/admin/me']);
        queryClient.invalidateQueries(['/api/v1/admin/all-reviews']);
        queryClient.invalidateQueries(['/api/v1/admin/all-users']);
      },

      // Get user-specific query keys
      getUserQueryKey: (endpoint) => {
        const { user, worker, admin } = get();
        const userId = user?._id || worker?._id || admin?._id;
        return userId ? `${endpoint}-${userId}` : endpoint;
      },

      // Force clear localStorage (useful for debugging)
      forceClearStorage: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          sessionStorage.clear();
          queryClient.clear();
          window.location.reload();
        }
      },

      // Admin: Update any user by ID
      adminUpdateUser: async (id, updateData) => {
        set({ isLoading: true, error: null });
        try {
          let response, data;
          const hasFile = updateData && Object.values(updateData).some(v => v instanceof File || v instanceof Blob);
          if (hasFile) {
            const formData = new FormData();
            Object.entries(updateData).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                formData.append(key, value);
              }
            });
            response = await fetch(`/api/v1/admin/user/${id}`, {
              method: 'PATCH',
              body: formData,
              credentials: 'include',
            });
          } else {
            response = await fetch(`/api/v1/admin/user/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updateData),
              credentials: 'include',
            });
          }
          data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to update user');
          queryClient.invalidateQueries(["/api/v1/admin/all-users"]);
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      // Admin: Delete any user by ID
      adminDeleteUser: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/v1/admin/user/${id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to delete user');
          queryClient.invalidateQueries(["/api/v1/admin/all-users"]);
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      // Admin: Update any worker by ID
      adminUpdateWorker: async (id, updateData) => {
        set({ isLoading: true, error: null });
        try {
          let response, data;
          const hasFile = updateData && Object.values(updateData).some(v => v instanceof File || v instanceof Blob);
          if (hasFile) {
            const formData = new FormData();
            Object.entries(updateData).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                formData.append(key, value);
              }
            });
            response = await fetch(`/api/v1/admin/worker/${id}`, {
              method: 'PATCH',
              body: formData,
              credentials: 'include',
            });
          } else {
            response = await fetch(`/api/v1/admin/worker/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updateData),
              credentials: 'include',
            });
          }
          data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to update worker');
          queryClient.invalidateQueries(["/api/v1/admin/all-users"]);
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      // Admin: Delete any worker by ID
      adminDeleteWorker: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/v1/admin/worker/${id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to delete worker');
          queryClient.invalidateQueries(["/api/v1/admin/all-users"]);
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      // Delete admin by ID (for admin dashboard)
      adminDeleteAdmin: async (adminId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/v1/admin/admin/${adminId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to delete admin');
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      // Admin: Fetch verification requests
      adminFetchVerificationRequests: async (status = 'pending') => {
        const response = await fetch(`/api/v1/admin/verification-requests?status=${status}`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch verification requests');
        // Map _id to id for frontend consistency
        return data.map(req => ({ ...req, id: req._id }));
      },

      // Admin: Update (approve/reject) a verification request
      adminUpdateVerificationRequest: async (id, { status, notes }) => {
        const response = await fetch(`/api/v1/admin/verification-requests/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status, notes }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update verification request');
        // Invalidate queries for verification requests
        queryClient.invalidateQueries(['/api/admin/verification-requests']);
        return data;
      },

      // Admin: Delete a verification request by ID
      adminDeleteVerificationRequest: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/v1/admin/verification-requests/${id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to delete verification request');
          queryClient.invalidateQueries(["/api/admin/verification-requests"]);
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Admin forgot password: request OTP
      requestAdminOtp: async (email) => {
        const response = await fetch('/api/v1/admin/forgot-password/request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
        return data;
      },
      // Admin forgot password: verify OTP
      verifyAdminOtp: async ({ email, otp }) => {
        const response = await fetch('/api/v1/admin/forgot-password/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to verify OTP');
        return data;
      },
      // Admin forgot password: reset password with OTP
      resetAdminPasswordWithOtp: async ({ email, otp, newPassword }) => {
        const response = await fetch('/api/v1/admin/forgot-password/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, newPassword }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to reset password');
        return data;
      },

      // Submit feedback/support (public)
      submitFeedback: async ({ name, email, subject, message }) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/v1/admin/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, subject, message }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to submit feedback');
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      // Fetch all feedback (admin)
      fetchAllFeedback: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/v1/admin/feedback', { credentials: 'include' });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to fetch feedback');
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      // Fetch feedback by ID (admin)
      fetchFeedbackById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/v1/admin/feedback/${id}`, { credentials: 'include' });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to fetch feedback');
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      // Update feedback status (admin)
      updateFeedbackStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/v1/admin/feedback/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to update feedback status');
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      // Delete feedback (admin)
      deleteFeedback: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/v1/admin/feedback/${id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to delete feedback');
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      // Reply to feedback (admin)
      replyFeedback: async (feedbackId, replyMessage) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/v1/admin/feedback/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ feedbackId, replyMessage }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to send reply');
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      fetchAllMobileChats: async () => {
        const response = await fetch('/api/v1/mobile-chat/all', { credentials: 'include' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch chat conversations');
        return data;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        worker: state.worker,
        admin: state.admin,
        currentRole: state.currentRole,
        verifiedPhone: state.verifiedPhone,
        reviewsNeedRefresh: state.reviewsNeedRefresh,
        loginTimestamp: state.loginTimestamp,
      }),
    }
  )
);

export default useAuthStore;