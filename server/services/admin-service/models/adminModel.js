import mongoose from "mongoose"

const schema = mongoose.Schema({
    username: {
        type: String,
        Required: true
    },
    age: {
        type: Number,
        Required: true
    },
    email: {
        type: String,
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
    mobile: {
        type: Number,
        Required: true
    },
    gender:{
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
    password:{
        type: String,
        Required: true
    },
    role:{
        type: String,
        Required: true
    }
})
const Admin = mongoose.model('admin',schema)
export default Admin;