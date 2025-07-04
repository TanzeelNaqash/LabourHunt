import Worker from '../models/workerModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cloudinary from 'cloudinary';
import fetch from 'node-fetch';

export const checkPhone = async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) return res.status(400).json({ exists: false, message: "Mobile is required" });
  const worker = await Worker.findOne({ mobile });
  if (worker) {
    return res.json({
      exists: true,
      worker: {
        id: worker._id,
        displayName: worker.displayName || worker.firstName || worker.username,
        profileImage: worker.profileImage || worker.photo || '',
        role: 'worker',
        mobile: worker.mobile,
        email: worker.email
      }
    });
  } else {
    return res.json({ exists: false });
  }
};

export async function registerWithPhone(req, res) {
  try {
    const { mobile, password, category, otherCategory, firstName, lastName, age, address, gender, country, state, ...rest } = req.body;
    if (!mobile || !password) return res.status(400).json({ message: 'Phone number and password required' });

    let worker = await Worker.findOne({ mobile });
    if (worker) return res.status(409).json({ message: 'Worker already exists' });

    // Check if phone is already used by a client (user-service)
    try {
      const userServiceRes = await fetch(`${process.env.USER_SERVICE_URL}/api/v1/users/check-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      const userServiceData = await userServiceRes.json();
      if (userServiceData.exists) {
        return res.status(409).json({ message: 'Phone number is already registered as a client' });
      }
    } catch (err) {
      console.error('Error checking user-service for phone:', err);
      return res.status(500).json({ message: 'Error checking phone in user-service', error: err.message });
    }

    // Handle profile image upload
    let photoUrl = null, photoId = null;
    if (req.files && req.files.profileImage) {
      const uploadRes = await cloudinary.v2.uploader.upload(req.files.profileImage.tempFilePath);
      photoUrl = uploadRes.secure_url;
      photoId = uploadRes.public_id;
    }

    // Handle ID proof upload
    let idProofUrl = null, idProofId = null;
    if (req.files && req.files.idProof) {
      const uploadRes = await cloudinary.v2.uploader.upload(req.files.idProof.tempFilePath);
      idProofUrl = uploadRes.secure_url;
      idProofId = uploadRes.public_id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalCategory = category === 'other' ? otherCategory : category;

    worker = new Worker({
      username: `${firstName} ${lastName}`,
      mobile,
      age,
      area: address,
      gender: gender,
      country: country,
      state: state,
      photo: photoUrl,
      photoid: photoId,
      category: finalCategory,
      otherCategory: otherCategory || '',
      labourDocument: idProofUrl,
      documentId: idProofId,
      role: 'worker',
      password: hashedPassword,
      isVerified: false,
      status: 'pending',
      joinedDate: new Date(),
    });
    await worker.save();
    // Create verification request in admin-service
    try {
      const verificationBody = {
        user: {
          userId: worker._id,
          firstName,
          lastName,
          email: rest.email || '',
          phone: mobile,
          profilePicture: photoUrl,
          category: finalCategory,
          location: address,
          isEmailVerified: false,
          isPhoneVerified: false,
          bio: rest.bio || '',
          skills: rest.skills || [],
          experience: rest.experience || '',
          education: rest.education || '',
          idProofUrl: idProofUrl || '',
        }
      };
      console.log('Posting verification request to admin-service...', verificationBody);
      const response = await fetch(`${process.env.ADMIN_SERVICE_URL}/api/v1/admin/verification-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationBody)
      });
      console.log('Admin-service response status:', response.status);
      const data = await response.json();
      console.log('Admin-service response data:', data);
    } catch (err) {
      console.error('Failed to create verification request in admin-service:', err);
    }
    res.status(201).json({ worker });
  } catch (err) {
    console.error('Worker registration error:', err);
    res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
  }
}

export async function loginWithPhone(req, res) {
  const { mobile, password } = req.body;
  if (!mobile || !password) return res.status(400).json({ message: 'Phone number and password required' });

  const worker = await Worker.findOne({ mobile });
  if (!worker) return res.status(404).json({ message: 'Worker not found' });

  const isMatch = await bcrypt.compare(password, worker.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    {
      id: worker._id,
      role: 'worker',
      mobile: worker.mobile
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ worker });
}

// Get current worker profile
export async function getMe(req, res) {
  try {
    if (!req.worker) return res.status(401).json({ message: 'Unauthorized' });
    const { password, ...workerData } = req.worker.toObject();
    res.json({
      ...workerData,
      profileImage: req.worker.profileImage || req.worker.photo || '',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Update current worker profile
export async function updateMe(req, res) {
  try {
    if (!req.worker) return res.status(401).json({ message: 'Unauthorized' });
    const updates = req.body;
    // Only allow certain fields to be updated
    const allowed = ['username', 'age', 'area', 'gender', 'country', 'state', 'category', 'otherCategory', 'photo', 'photoid', 'status'];
    for (const key of Object.keys(updates)) {
      if (!allowed.includes(key)) delete updates[key];
    }
    // Handle profile image upload if present
    if (req.files && req.files.profileImage) {
      const uploadRes = await cloudinary.v2.uploader.upload(req.files.profileImage.tempFilePath);
      updates.photo = uploadRes.secure_url;
      updates.photoid = uploadRes.public_id;
    }
    // Handle ID proof upload if present (for resubmission)
    let idProofUrl = null, idProofId = null;
    if (req.files && req.files.idProof) {
      const uploadRes = await cloudinary.v2.uploader.upload(req.files.idProof.tempFilePath);
      updates.labourDocument = uploadRes.secure_url;
      updates.documentId = uploadRes.public_id;
      idProofUrl = uploadRes.secure_url;
      idProofId = uploadRes.public_id;
      // If worker is resubmitting ID proof, set status to pending
      updates.status = 'pending';
    }
    const updatedWorker = await Worker.findByIdAndUpdate(req.worker._id, updates, { new: true });
    const { password, ...workerData } = updatedWorker.toObject();

    // If status is pending and a new ID proof was uploaded, create a new verification request
    if (updates.status === 'pending' && idProofUrl) {
      try {
        // 1. Check how many requests in the last 24 hours
        const now = new Date();
        const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const adminServiceUrl = process.env.ADMIN_SERVICE_URL;
        const recentReqRes = await fetch(`${adminServiceUrl}/api/v1/admin/verification-requests?userId=${updatedWorker._id}&since=${since.toISOString()}`);
        const recentRequests = await recentReqRes.json();
        if (Array.isArray(recentRequests) && recentRequests.length >= 2) {
          return res.status(429).json({ message: 'You have reached the limit of 2 verification requests per day. Please try again later.' });
        }
        // 2. Delete any existing pending requests for this worker
        await fetch(`${adminServiceUrl}/api/v1/admin/verification-requests/worker/${updatedWorker._id}/pending`, {
          method: 'DELETE',
        });
        // 3. Create the new verification request
        const verificationBody = {
          user: {
            userId: updatedWorker._id,
            firstName: updatedWorker.username.split(' ')[0] || '',
            lastName: updatedWorker.username.split(' ').slice(1).join(' ') || '',
            email: updatedWorker.email || '',
            phone: updatedWorker.mobile,
            profilePicture: updatedWorker.photo,
            category: updatedWorker.category,
            location: updatedWorker.area,
            isEmailVerified: false,
            isPhoneVerified: false,
            bio: updatedWorker.bio || '',
            skills: updatedWorker.skills || [],
            experience: updatedWorker.experience || '',
            education: updatedWorker.education || '',
            idProofUrl: idProofUrl,
          }
        };
        await fetch(`${adminServiceUrl}/api/v1/admin/verification-requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(verificationBody)
        });
      } catch (err) {
        console.error('Failed to create verification request in admin-service:', err);
      }
    }

    // Call admin-service to update reviewer info in reviews
    const updateData = {
      userId: updatedWorker._id,
      username: updatedWorker.username,
      photo: updatedWorker.photo,
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
        console.log('Successfully updated reviews for worker:', result);
      }
    } catch (err) {
      console.error('Failed to update reviewer info in reviews:', err);
    }
    res.json({
      ...workerData,
      profileImage: updatedWorker.profileImage || updatedWorker.photo || '',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Update current worker password
export async function updatePassword(req, res) {
  try {
    if (!req.worker) return res.status(401).json({ message: 'Unauthorized' });
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, req.worker.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    // Hash and update new password
    const hashed = await bcrypt.hash(newPassword, 10);
    req.worker.password = hashed;
    await req.worker.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Reset worker password (forgot password)
export async function resetPassword(req, res) {
  try {
    console.log('Worker ResetPassword request body:', req.body);
    const { mobile, newPassword } = req.body;
    console.log('Reset password for worker mobile:', mobile);
    if (!mobile || !newPassword) {
      console.log('Missing mobile or newPassword');
      return res.status(400).json({ message: 'Mobile and new password are required' });
    }
    const worker = await Worker.findOne({ mobile });
    console.log('Worker found:', worker);
    if (!worker) {
      console.log('Worker not found for mobile:', mobile);
      return res.status(404).json({ message: 'Worker not found' });
    }
    console.log('Worker password before update:', worker.password);
    worker.password = await bcrypt.hash(newPassword, 10);
    console.log('Worker password after hash:', worker.password);
    await worker.save();
    const updatedWorker = await Worker.findOne({ mobile });
    console.log('Worker password after save:', updatedWorker.password);
    console.log('Password updated for worker:', worker.mobile);
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Error in worker resetPassword:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export async function getAllWorkers(req, res) {
  try {
    const workers = await Worker.find({ status: 'approved' }).select('-password');
    // Fetch reviews for all workers in parallel
    const mapped = await Promise.all(workers.map(async (w) => {
      const username = w.username || '';
      const [firstName, ...rest] = username.split(' ');
      const lastName = rest.join(' ');
      let reviewCount = 0;
      let avgRating = 0;
      try {
        const reviewsRes = await fetch(`${process.env.ADMIN_SERVICE_URL}/api/v1/reviews?targetId=${w._id}`);
        const reviews = await reviewsRes.json();
        if (Array.isArray(reviews) && reviews.length > 0) {
          reviewCount = reviews.length;
          avgRating = (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount).toFixed(1);
        }
      } catch (err) {
        // If admin service is down, fallback to 0
      }
      return {
        ...w.toObject(),
        firstName: firstName || '',
        lastName: lastName || '',
        profileImage: w.photo || '',
        reviewCount,
        rating: avgRating,
      };
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export async function getWorkerById(req, res) {
  try {
    const worker = await Worker.findById(req.params.id).select('-password');
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    // Fetch reviews for this worker
    let reviewCount = 0;
    let avgRating = 0;
    try {
      const reviewsRes = await fetch(`${process.env.ADMIN_SERVICE_URL}/api/v1/reviews?targetId=${worker._id}`);
      const reviews = await reviewsRes.json();
      if (Array.isArray(reviews) && reviews.length > 0) {
        reviewCount = reviews.length;
        avgRating = (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount).toFixed(1);
      }
    } catch (err) {
      // If admin service is down, fallback to 0
    }
    res.json({
      ...worker.toObject(),
      reviewCount,
      rating: avgRating,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Get all workers for admin management
export async function getAllWorkersForAdmin(req, res) {
  try {
    const workers = await Worker.find().select('-password');
    
    // Format workers for admin dashboard
    const formattedWorkers = workers.map(worker => {
      return {
        _id: worker._id,
        username: worker.username,
        mobile: worker.mobile,
        age: worker.age,
        gender: worker.gender,
        area: worker.area,
        address: worker.area, // For consistency with user format
        country: worker.country,
        state: worker.state,
        photo: worker.photo,
        profileImage: worker.photo,
        category: worker.category,
        otherCategory: worker.otherCategory,
        isVerified: worker.isVerified,
        status: worker.status,
        role: worker.role,
        joinedDate: worker.joinedDate,
        createdAt: worker.createdAt,
        updatedAt: worker.updatedAt
      };
    });
    
    res.json(formattedWorkers);
  } catch (err) {
    console.error('getAllWorkersForAdmin error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Create worker from admin dashboard
export async function createWorkerFromAdmin(req, res) {
  try {
    const { firstName, lastName, mobile, password, age, address, country, state, gender, category, otherCategory, profileImage } = req.body;
    
    if (!firstName || !lastName || !mobile || !password) {
      return res.status(400).json({ message: 'First name, last name, mobile, and password are required' });
    }

    // Check if worker already exists
    const existingWorker = await Worker.findOne({ mobile });
    if (existingWorker) {
      return res.status(409).json({ message: 'Worker with this mobile number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = `${firstName} ${lastName}`;
    const finalCategory = category === 'other' ? otherCategory : category;

    // Handle profile image upload if provided
    let photoUrl = '';
    if (profileImage) {
      try {
        const result = await cloudinary.uploader.upload(profileImage, {
          folder: 'labourhunt/workers',
          width: 300,
          crop: "scale"
        });
        photoUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Profile image upload error:', uploadError);
        // Continue without profile image if upload fails
      }
    }

    const worker = new Worker({
      username,
      mobile,
      age: age || 0,
      area: address || '',
      gender: gender || '',
      country: country || '',
      state: state || '',
      photo: photoUrl,
      photoid: '',
      category: finalCategory || '',
      otherCategory: otherCategory || '',
      labourDocument: '',
      documentId: '',
      role: 'worker',
      password: hashedPassword,
      isVerified: false,
      status: 'pending',
      joinedDate: new Date(),
    });

    await worker.save();
    
    // Return worker data without password
    const { password: _, ...workerData } = worker.toObject();
    res.status(201).json({ worker: workerData });
  } catch (err) {
    console.error('createWorkerFromAdmin error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
} 

// Update any worker by ID (admin use)
export async function updateWorkerById(req, res) {
  try {
    const updates = req.body;
    // Prevent password update here
    if (updates.password) delete updates.password;
    // Handle profile image upload if present
    if (req.files && req.files.profileImage) {
      const uploadRes = await cloudinary.v2.uploader.upload(req.files.profileImage.tempFilePath);
      updates.photo = uploadRes.secure_url;
      updates.photoid = uploadRes.public_id;
    }
    const updatedWorker = await Worker.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updatedWorker) return res.status(404).json({ message: 'Worker not found' });
    res.json(updatedWorker);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Delete any worker by ID (admin use)
export async function deleteWorkerById(req, res) {
  try {
    const deleted = await Worker.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Worker not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
} 