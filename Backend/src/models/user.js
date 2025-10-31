import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 20,
    },
    lastname: {
      type: String,
    },
    username: {
      type: String,
      unique: true, // optional but recommended
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // to prevent duplicate emails
      lowercase: true, // ensures consistency
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // good practice
    },
    age: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true, // ✅ Correct placement (outside the field definitions)
  }
);

const User = mongoose.model('User', userSchema);
export default User;
