import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  fname: { type: String, required: true },
  lname: { type: String, default: ''},
  email: { type: String, required: true, unique: true },
  password: { type: String },
  profileImage: { type: String, default: '' },
  address: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});


const User = mongoose.models.user || mongoose.model('User', userSchema)

export default User
