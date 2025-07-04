import Admin from '../models/adminModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import fetch from 'node-fetch';
import VerificationRequest from '../models/verificationRequestModel.js';
import AdminOTP from '../models/otpModel.js';
import { sendMail } from '../utils/mailer.js';
import crypto from 'crypto';

// Register admin
export const registerAdmin = async (req, res) => {
  try {
    const { username, email, password, age, address, gender, country, state } = req.body;
    if (!username || !email || !password || !age || !address || !gender) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin already exists' });
    }
    // Handle profile image upload
    let photoUrl = '', photoId = '';
    if (req.files && req.files.profileImage) {
      const uploadRes = await cloudinary.uploader.upload(req.files.profileImage.tempFilePath);
      photoUrl = uploadRes.secure_url;
      photoId = uploadRes.public_id;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({
      username,
      email,
      password: hashedPassword,
      age,
      address,
      gender,
      country,
      state,
      role: 'admin',
      photo: photoUrl,
      photoId: photoId,
      mobile: req.body.mobile || '',
    });
    await admin.save();
    res.status(201).json({ admin });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Generate JWT (replace 'secret' with your secret key)
    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    
    // Set cookie
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });
    
    // Return full admin data without password
    const { password: _, ...adminData } = admin.toObject();
    res.status(200).json({ admin: adminData });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({
      username: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      mobile: phone,
      role: 'admin',
      age: 0,
      address: '',
      gender: '',
      country: '',
      state: '',
      photo: '',
      photoId: ''
    });
    await admin.save();
    res.status(201).json({ admin });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    // Map to expected frontend fields
    const mapped = admins.map(a => {
      const username = a.username || '';
      const [firstName, ...rest] = username.split(' ');
      const lastName = rest.join(' ');
      return {
        ...a.toObject(),
        firstName: firstName || '',
        lastName: lastName || '',
        profileImage: a.photo || '',
      };
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get current admin profile
export const getMe = async (req, res) => {
  try {
    if (!req.admin) return res.status(401).json({ message: 'Unauthorized' });
    const { password, ...adminData } = req.admin.toObject();
    res.json(adminData);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update current admin profile
export const updateMe = async (req, res) => {
  try {
    if (!req.admin) return res.status(401).json({ message: 'Unauthorized' });
    const updates = req.body;
    // Only allow certain fields to be updated
    const allowed = ['username', 'age', 'address', 'gender', 'country', 'state', 'mobile', 'photo', 'photoId'];
    for (const key of Object.keys(updates)) {
      if (!allowed.includes(key)) delete updates[key];
    }
    // Handle profile image upload if present
    if (req.files && req.files.profileImage) {
      const uploadRes = await cloudinary.uploader.upload(req.files.profileImage.tempFilePath);
      updates.photo = uploadRes.secure_url;
      updates.photoId = uploadRes.public_id;
    }
    const updatedAdmin = await Admin.findByIdAndUpdate(req.admin._id, updates, { new: true });
    const { password, ...adminData } = updatedAdmin.toObject();
    res.json(adminData);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update current admin password
export const updatePassword = async (req, res) => {
  try {
    if (!req.admin) return res.status(401).json({ message: 'Unauthorized' });
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, req.admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    // Hash and update new password
    const hashed = await bcrypt.hash(newPassword, 10);
    req.admin.password = hashed;
    await req.admin.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all users and workers for admin management
export const getAllUsersForAdmin = async (req, res) => {
  try {
    // Fetch users from user service
    const userServiceUrl = process.env.USER_SERVICE_URL ;
    const workerServiceUrl = process.env.WORKER_SERVICE_URL ;
    
    let users = [];
    let workers = [];
    
    try {
      const usersResponse = await fetch(`${userServiceUrl}/api/v1/users/all-for-admin`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any necessary auth headers if required
        }
      });
      
      if (usersResponse.ok) {
        users = await usersResponse.json();
      } else {
        console.error('Failed to fetch users:', usersResponse.status);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    
    try {
      const workersResponse = await fetch(`${workerServiceUrl}/api/v1/workers/all-for-admin`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any necessary auth headers if required
        }
      });
      
      if (workersResponse.ok) {
        workers = await workersResponse.json();
      } else {
        console.error('Failed to fetch workers:', workersResponse.status);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
    
    // Combine and format the data
    const allUsers = [
      ...users.map(user => ({
        ...user,
        type: 'client',
        displayName: user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        status: user.isVerified ? 'verified' : 'pending',
        joinedDate: user.joinedDate || user.createdAt,
        profileImage: user.photo || user.profileImage
      })),
      ...workers.map(worker => ({
        ...worker,
        type: 'worker',
        displayName: worker.username || worker.firstName || 'Unknown Worker',
        status: worker.status || (worker.isVerified ? 'verified' : 'pending'),
        joinedDate: worker.joinedDate || worker.createdAt,
        profileImage: worker.photo,
        category: worker.category
      }))
    ];
    
    res.json(allUsers);
  } catch (err) {
    console.error('getAllUsersForAdmin error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create client from admin dashboard
export const createClient = async (req, res) => {
  try {
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3004';
    
    const response = await fetch(`${userServiceUrl}/api/v1/users/create-from-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.status(201).json(data);
  } catch (err) {
    console.error('createClient error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create worker from admin dashboard
export const createWorker = async (req, res) => {
  try {
    const workerServiceUrl = process.env.WORKER_SERVICE_URL || 'http://localhost:3005';
    
    const response = await fetch(`${workerServiceUrl}/api/v1/workers/create-from-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.status(201).json(data);
  } catch (err) {
    console.error('createWorker error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

// Proxy: Update any user by ID
export const updateUserById = async (req, res) => {
  try {
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3004';
    const id = req.params.id;
    const response = await fetch(`${userServiceUrl}/api/v1/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Proxy error', error: err.message });
  }
};

// Proxy: Delete any user by ID
export const deleteUserById = async (req, res) => {
  try {
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3004';
    const id = req.params.id;
    const response = await fetch(`${userServiceUrl}/api/v1/users/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Proxy error', error: err.message });
  }
};

// Proxy: Update any worker by ID
export const updateWorkerById = async (req, res) => {
  try {
    const workerServiceUrl = process.env.WORKER_SERVICE_URL || 'http://localhost:3005';
    const id = req.params.id;
    const response = await fetch(`${workerServiceUrl}/api/v1/workers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Proxy error', error: err.message });
  }
};

// Proxy: Delete any worker by ID
export const deleteWorkerById = async (req, res) => {
  try {
    const workerServiceUrl = process.env.WORKER_SERVICE_URL || 'http://localhost:3005';
    const id = req.params.id;
    const response = await fetch(`${workerServiceUrl}/api/v1/workers/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Proxy error', error: err.message });
  }
};

// Delete admin by ID
export const deleteAdminById = async (req, res) => {
  try {
    // Prevent deletion of the protected admin
    if (req.params.id === '685c066ba753fb7570116403') {
      return res.status(403).json({ message: 'This admin account cannot be deleted.' });
    }
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// List verification requests (by status)
export const getVerificationRequests = async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const requests = await VerificationRequest.find({ status }).sort({ requestDate: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Approve/reject a verification request
export const updateVerificationRequest = async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const request = await VerificationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = status;
    request.notes = notes || '';
    request.reviewDate = new Date();
    await request.save();

    // Update worker status in worker-service
    if (request.user && request.user.userId) {
      const workerServiceUrl = process.env.WORKER_SERVICE_URL || 'http://localhost:3005';
      const workerStatus = status === 'verified' ? 'approved' : 'rejected';
      try {
        const response = await fetch(`${workerServiceUrl}/api/v1/workers/${request.user.userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: workerStatus }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to update worker status:', errorData);
        }
      } catch (err) {
        console.error('Error updating worker status in worker-service:', err);
      }
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a new verification request
export const createVerificationRequest = async (req, res) => {
  try {
    const { user } = req.body;
    if (!user || !user.userId) {
      return res.status(400).json({ message: 'User info is required' });
    }
    // Prevent duplicate pending requests for the same worker
    const existing = await VerificationRequest.findOne({ 'user.userId': user.userId, status: 'pending' });
    if (existing) {
      return res.status(409).json({ message: 'A pending verification request already exists for this worker.' });
    }
    const request = new VerificationRequest({ user });
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Request OTP for admin forgot password
export const requestAdminOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(404).json({ message: 'Admin not found' });
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await AdminOTP.deleteMany({ email }); // Remove old OTPs
  await AdminOTP.create({ email, otp, expiresAt });
  // Send email
  await sendMail({
    to: email,
    subject: 'Your LabourHunt Admin OTP',
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    type: 'otp',
    otp, // pass the OTP value
  });
  res.json({ message: 'OTP sent to email' });
};

// Verify OTP
export const verifyAdminOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });
  const record = await AdminOTP.findOne({ email, otp, used: false });
  if (!record) return res.status(400).json({ message: 'Invalid OTP' });
  if (record.expiresAt < new Date()) return res.status(400).json({ message: 'OTP expired' });
  record.used = true;
  await record.save();
  res.json({ message: 'OTP verified' });
};

// Reset password with OTP
export const resetAdminPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ message: 'All fields required' });
  const record = await AdminOTP.findOne({ email, otp, used: true });
  if (!record) return res.status(400).json({ message: 'OTP not verified' });
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(404).json({ message: 'Admin not found' });
  admin.password = await bcrypt.hash(newPassword, 10);
  await admin.save();
  res.json({ message: 'Password reset successful' });
};

// Delete a verification request by ID
export const deleteVerificationRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await VerificationRequest.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Verification request not found' });
    res.json({ message: 'Verification request deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const checkAdminEmailExists = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ exists: false, message: "Email is required" });
  try {
    const admin = await Admin.findOne({ email });
    return res.json({ exists: !!admin });
  } catch (err) {
    return res.status(500).json({ exists: false, message: 'Error checking email', error: err.message });
  }
}; 