import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import User from './models/user.js';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { validateSignupData } from './utils/validation.js';

const app = express();

dotenv.config();

// Middleware to parse JSON data
app.use(express.json());

/* ============================
   📘 ROUTES
============================ */

// ✅ FIND USER BY EMAIL
app.get("/user", async (req, res) => {
  const userEmail = req.query.email; // get email from query string
  try {
    const users = await User.find({ email: userEmail });
    if (!users || users.length === 0) {
      return res.status(404).send("❌ User not found");
    }
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("❌ Internal server error");
  }
});

// ✅ FETCH ALL USERS
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("❌ Internal server error");
  }
});

// ✅ SIGNUP (REGISTER NEW USER)
app.post("/signup", async (req, res) => {
  try {
    // validate data
    await validateSignupData(req);

    const { firstname, lastname, username, email, password, age } = req.body;
   // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const user = new User({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
      age,
    });

    await user.save();
    res.status(201).send("✅ User registered successfully");
  } catch (err) {
    console.error("Error:", err.message);
    res.status(400).send(`❌ ${err.message}`);
  }
});
app.post("/login", async (req,res)=>{
  try{
  const {email, password} = req.body;
   
  const user=await User.findOne({email});
  if(!user){
    return  res.status(404).send("❌ User not found");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if(!isPasswordValid){
    res.status(401).send("❌ Invalid password");
  }
  res.status(200).send("✅ Login successful");
}
  catch (err) {
    console.error("Error:", err.message);
    res.status(400).send(`❌ ${err.message}`);
  }
    
});

// ✅ DELETE USER
app.delete("/deleteuser", async (req, res) => {
  const userID = req.body.id;
  try {
    const deletedUser = await User.findByIdAndDelete(userID);
    if (!deletedUser) {
      return res.status(404).send("❌ User not found");
    }
    res.status(200).send("✅ User deleted successfully");
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("❌ Internal server error");
  }
});

// ✅ UPDATE USER
app.patch("/update", async (req, res) => {
  const userID = req.body.id;
  const data = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(userID, data, { new: true });
    if (!updatedUser) {
      return res.status(404).send("❌ User not found");
    }
    res.status(200).send("✅ User data updated successfully");
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).send("❌ Internal server error");
  }
});

/* ============================
   🗄️ DATABASE & SERVER START
============================ */
connectDB()
  .then(() => {
    console.log("✅ Database connected");
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed", err);
  });
