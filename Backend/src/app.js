import express from 'express';
import connectDB from './config/database.js';
import User from './models/user.js';

const app = express();

// Middleware to parse JSON data
app.use(express.json());

// Signup route
app.post("/signup", async (req, res) => {
  try {
    const user = new User({
      firstname: "Dhananjay",
      lastname: "Kumar",
      username: "Dhananjay9211",
      email: "atul@gmail.com",
      password: "Dhanan@123",
      age: 21
    });

    await user.save();
    res.send("✅ User registered successfully");
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("❌ Error registering user");
  }
});

// Connect DB and start server
connectDB()
  .then(() => {
    console.log("✅ Database connected successfully");
    app.listen(3000, () => {
      console.log("🚀 Server running on port 3000");
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });
