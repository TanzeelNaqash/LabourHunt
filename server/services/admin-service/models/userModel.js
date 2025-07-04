import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: String,
  photo: String,
  // Add other fields if needed
});

// The model name must match the ref: 'users'
export default mongoose.model('users', userSchema); 