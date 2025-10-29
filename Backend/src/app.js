import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import User from './models/user.js';
const app = express();
dotenv.config();
// Middleware to parse JSON data
app.use(express.json());

// now i make the route to find the user from the database
app.get("/user", async (req, res) => {
    const userEmail = req.query.email; // get email from query string
    try {
        const users = await User.find({ email: userEmail });
        if (!users || users.length === 0) {
            return res.status(404).send("User not found");
        }
        res.status(200).json(users);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).send("Internal server error");
    }
});


//make to find all the data from the database
app.get("/feed", async (req,res)=>{
  try{
    const users=await User.find({});;
    res.status(200).send(users);
  }
    catch(err){
        res.status(500).send("internal server error");
    }
});
// Signup route this store the data of the user in the database
app.post("/signup", async (req, res) => {
    const user=new User(req.body);
  
   try{
    await user.save();
    res.send("✅ User registered successfully");
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("❌ Error registering user");
  }
});

//delete the user from thr database
app.delete("/deleteuser", async (req,res)=>{
    const userID=req.body.id;
    try{
        const user= await user.findByIdAndDelete(userID);
        res.status(200).send("user deleted successfully");
    }
    catch(err){
        res.status(500).send("internal server error");
    }
});
app.patch("/update", async (req, res) => {
  const userID = req.body.id;
  const data = req.body;
  console.log(data);
  try {
    await User.findByIdAndUpdate(userID, data, { new: true }); // corrected
    res.status(200).send("✅ User data updated successfully");
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("❌ Internal server error");
  }
});

// Connect DB and start server
connectDB()
.then(()=>{
    console.log("Database connected");
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((err)=>{
    console.log("Database connection failed", err);
});

