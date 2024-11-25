import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "images/default-avatar.png" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);