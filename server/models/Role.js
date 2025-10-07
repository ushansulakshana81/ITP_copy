import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  roleID: { type: String, required: true, unique: true },
  roleName: { type: String, required: true }
});

const Role = mongoose.model("Role", roleSchema);

export default Role;