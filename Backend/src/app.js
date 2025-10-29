import express from 'express';
import connectDB from './config/database.js';
import User from './models/user.js';
const app = express();
// Middleware to parse JSON data
app.use(express.json());

// now i make the route to find the user from the database
app.get("/user", async(req,res)=>{
    const userEmail=req.body.email;
    try{
        const users=await user.find({email:userEmail});
        if(users.length===0){
            res.status(201).send("user not found");
        }
        else{
            res.status(200).send(users);
        }
    }
    catch(err){
        res.status(500).send("internal server error");
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
app.patch("/update", async (req,res)=>{
   const userID=req.body.id;;
   const data=req.body;;
   try{
    await user.findByIdAndUpdate(id:userID,update:data);
    res.status(200).send("user data updated successfully");
   }
   catch(err){
    res.status(500).send("internal server error");
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
