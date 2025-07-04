import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import fetch from 'node-fetch';

export const checkPhone = async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) return res.status(400).json({ exists: false, message: "Mobile is required" });
  const user = await User.findOne({ mobile });
  if (user) {
    return res.json({
      exists: true,
      user: {
        id: user._id,
        displayName: user.displayName || user.firstName || user.username,
        profileImage: user.profileImage || user.photo || '',
        role: 'client',
        mobile: user.mobile,
        email: user.email
      }
    });
  } else {
    return res.json({ exists: false });
  }
};

export const checkEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ exists: false, message: "Email is required" });
  const user = await User.findOne({ email });
  if (user) {
    return res.json({
      exists: true,
      user: {
        id: user._id,
        displayName: user.displayName || user.firstName || user.username,
        profileImage: user.profileImage || user.photo || '',
        role: 'client',
        mobile: user.mobile,
        email: user.email
      }
    });
  } else {
    return res.json({ exists: false });
  }
};

export async function registerWithPhone(req, res) {
  try {
    const { mobile, password, firstName, lastName, ...rest } = req.body;
    if (!mobile || !password) return res.status(400).json({ message: 'Phone number and password required' });

    let user = await User.findOne({ mobile });
    if (user) return res.status(409).json({ message: 'User already exists' });

    // Cross-service check: is this phone already used by a worker?
    try {
      const workerServiceRes = await fetch(`${process.env.WORKER_SERVICE_URL}/api/v1/workers/check-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      const workerServiceData = await workerServiceRes.json();
      if (workerServiceData.exists) {
        return res.status(409).json({ message: 'Phone number is already registered as a worker' });
      }
    } catch (err) {
      console.error('Error checking worker-service for phone:', err);
      return res.status(500).json({ message: 'Error checking phone in worker-service', error: err.message });
    }

    // Handle profile image upload
    let photoUrl = null, photoId = null;
    if (req.files && req.files.profileImage) {
      const uploadRes = await cloudinary.uploader.upload(req.files.profileImage.tempFilePath);
      photoUrl = uploadRes.secure_url;
      photoId = uploadRes.public_id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      username: `${firstName} ${lastName}`,
      mobile,
      password: hashedPassword,
      ...rest,
      photo: photoUrl,
      photoId: photoId,
      role: 'client',
      isVerified: true,
      joinedDate: new Date(),
    });
    await user.save();
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export async function loginWithPhone(req, res) {
  try {
    console.log('loginWithPhone called', req.body);
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      console.log('Missing mobile or password');
      return res.status(400).json({ message: 'Phone number and password required' });
    }
    const user = await User.findOne({ mobile });
    console.log('User found:', user);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      {
        id: user._id,
        role: 'client',
        mobile: user.mobile,
        username: user.username,
        photo: user.photo
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ user });
  } catch (err) {
    console.error('Error in loginWithPhone:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export async function getMe(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    // Exclude password and sensitive fields
    const { password, username, photo, ...userData } = req.user.toObject();
    let firstName = '', lastName = '';
    if (username) {
      const parts = username.split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }
    res.json({
      ...userData,
      firstName,
      lastName,
      profileImage: req.user.profileImage || req.user.photo || '',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export async function updateMe(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const updates = req.body;
    // Handle profile image upload if present
    if (req.files && req.files.profileImage) {
      const uploadRes = await cloudinary.uploader.upload(req.files.profileImage.tempFilePath);
      updates.photo = uploadRes.secure_url;
      updates.photoId = uploadRes.public_id;
    }
    // Update allowed fields
    if (updates.firstName || updates.lastName) {
      const firstName = updates.firstName || req.user.username.split(' ')[0];
      const lastName = updates.lastName || req.user.username.split(' ').slice(1).join(' ');
      updates.username = `${firstName} ${lastName}`;
    }
    // Only allow certain fields to be updated
    const allowed = ['username', 'address', 'country', 'state', 'photo', 'photoId'];
    for (const key of Object.keys(updates)) {
      if (!allowed.includes(key)) delete updates[key];
    }
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    // Exclude password and sensitive fields
    const { password, username, photo, ...userData } = updatedUser.toObject();
    let firstName = '', lastName = '';
    if (username) {
      const parts = username.split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }
    // Call admin-service to update reviewer info in reviews
    const updateData = {
      userId: updatedUser._id,
      username: updatedUser.username,
      photo: updatedUser.photo,
    };
    
    try {
      const response = await fetch(`${process.env.ADMIN_SERVICE_URL}/update-user-info`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Admin service responded with error:', errorData);
      } else {
        const result = await response.json();
        console.log('Successfully updated reviews:', result);
      }
    } catch (err) {
      console.error('Failed to update reviewer info in reviews:', err);
    }
    res.json({
      ...userData,
      firstName,
      lastName,
      profileImage: req.user.profileImage || req.user.photo || '',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export async function updatePassword(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    // Hash and update new password
    const hashed = await bcrypt.hash(newPassword, 10);
    req.user.password = hashed;
    await req.user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export async function resetPassword(req, res) {
  try {
    console.log('ResetPassword request body:', req.body);
    const { mobile, newPassword } = req.body;
    console.log('Reset password for mobile:', mobile);
    if (!mobile || !newPassword) {
      console.log('Missing mobile or newPassword');
      return res.status(400).json({ message: 'Mobile and new password are required' });
    }
    const user = await User.findOne({ mobile });
    console.log('User found:', user);
    if (!user) {
      console.log('User not found for mobile:', mobile);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User password before update:', user.password);
    user.password = await bcrypt.hash(newPassword, 10);
    console.log('User password after hash:', user.password);
    await user.save();
    const updatedUser = await User.findOne({ mobile });
    console.log('User password after save:', updatedUser.password);
    console.log('Password updated for user:', user.mobile);
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Error in resetPassword:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await User.find().select('-password');
    // Map to expected frontend fields
    const mapped = users.map(u => {
      const username = u.username || '';
      const [firstName, ...rest] = username.split(' ');
      const lastName = rest.join(' ');
      return {
        ...u.toObject(),
        firstName: firstName || '',
        lastName: lastName || '',
        profileImage: u.photo || '',
      };
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Get all users for admin management
export async function getAllUsersForAdmin(req, res) {
  try {
    const users = await User.find().select('-password');
    
    // Format users for admin dashboard
    const formattedUsers = users.map(user => {
      const username = user.username || '';
      const [firstName, ...rest] = username.split(' ');
      const lastName = rest.join(' ');
      
      return {
        _id: user._id,
        username: user.username,
        firstName: firstName || '',
        lastName: lastName || '',
        email: user.email || '',
        mobile: user.mobile,
        age: user.age,
        address: user.address,
        country: user.country,
        state: user.state,
        gender: user.gender,
        photo: user.photo,
        profileImage: user.photo,
        isVerified: user.isVerified,
        role: user.role,
        joinedDate: user.joinedDate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    });
    
    res.json(formattedUsers);
  } catch (err) {
    console.error('getAllUsersForAdmin error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Create client from admin dashboard
export async function createClientFromAdmin(req, res) {
  try {
    const { firstName, lastName, mobile, password, age, address, country, state, gender, profileImage } = req.body;
    
    if (!firstName || !lastName || !mobile || !password) {
      return res.status(400).json({ message: 'First name, last name, mobile, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this mobile number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = `${firstName} ${lastName}`;

    // Handle profile image upload if provided
    let photoUrl = '';
    if (profileImage) {
      try {
        const result = await cloudinary.uploader.upload(profileImage, {
          folder: 'labourhunt/users',
          width: 300,
          crop: "scale"
        });
        photoUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Profile image upload error:', uploadError);
        // Continue without profile image if upload fails
      }
    }

    const user = new User({
      username,
      mobile,
      password: hashedPassword,
      age: age || 0,
      address: address || '',
      country: country || '',
      state: state || '',
      gender: gender || '',
      email: '',
      photo: photoUrl,
      photoId: '',
      role: 'client',
      isVerified: true,
      joinedDate: new Date(),
    });

    await user.save();
    
    // Return user data without password
    const { password: _, ...userData } = user.toObject();
    res.status(201).json({ user: userData });
  } catch (err) {
    console.error('createClientFromAdmin error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Update any user by ID (admin use)
export async function updateUserById(req, res) {
  try {
    const updates = req.body;
    // Prevent password update here
    if (updates.password) delete updates.password;
    // Handle profile image upload if present
    if (req.files && req.files.profileImage) {
      const uploadRes = await cloudinary.uploader.upload(req.files.profileImage.tempFilePath);
      updates.photo = uploadRes.secure_url;
      updates.photoId = uploadRes.public_id;
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Delete any user by ID (admin use)
export async function deleteUserById(req, res) {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      _id: user._id,
      displayName: user.displayName || user.firstName || user.username,
      profileImage: user.profileImage || user.photo || '',
      role: user.role,
      mobile: user.mobile,
      email: user.email,
      // add any other fields needed by the frontend
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};