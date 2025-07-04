import mongoose from 'mongoose';
const schema = mongoose.Schema({
    username: {
        type: String,
        Required: true
    },
    age: {
        type: Number,
        Required: true
    },
  
    photo: {
        type: String,
        Required: true
    },
    photoId: {
        type: String,
        Required: true
    },
    address: {
        type: String,
        Required: true
    },
    country:{
        type: String,
        Required: true
    },
    state:{
        type: String,
        Required: true
    },
    mobile: {
        type: String,
        Required: true,
        unique: true,
    },
    gender:{
        type: String,
        Required: true
    },
   
    role:{
        type: String,
        Required: true
    },
    isVerified: {
        type: Boolean,
        Required: true,
    },
    joinedDate: {
        type: Date,
        Required: false
    },
    password:{
        type: String,
        Required: true
    }
})
const User = mongoose.model('users',schema)
export default User;