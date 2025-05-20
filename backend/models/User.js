import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, default: ''},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: '' },
  address: { type: String, default: '' }
});


const User = mongoose.models.user || mongoose.model('User', userSchema)

export default User
