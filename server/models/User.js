import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  homeTown: String,
  mobile: String,
  nic: String,
  designation: String,
  role: String,
  username: String,
  status: String,
  createdDate: { type: Date, default: Date.now },
  password: { type: String, required: true }, // ✅ Must include this
  employeeNumber: String
});

export const User = mongoose.model("User", userSchema);