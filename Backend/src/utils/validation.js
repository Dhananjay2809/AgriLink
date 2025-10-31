import validator from 'validator';
import User from '../models/user.js';


export const validateSignupData = async (req) => {
  const { email, password, firstname, age } = req.body;

  // Check required fields
  if (!email || !password || !firstname) {
    throw new Error("Missing required fields");
  }

  // Validate email
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }

  // Validate strong password
  if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }

  // Optional: Validate age (if required)
  if (age && (isNaN(age) || age <= 0)) {
    throw new Error("Invalid age");
  }

  // Optional: Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  return true;
};
