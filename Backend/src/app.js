const express=require('express');
const app=express();


app.use("/name", (req,res)=>{
    res.send("My name is Dhananjay Pratap Singh");
});
app.use("/age", (req,res)=>{
    res.send("My age is 21");
});
app.use("/intro",(req,res)=>{
    res.send("I am a student of Computer Science Engineering at GLBITM");
});
app.use("/default", (req,res)=>{
  res.send("This server is rumming on the port 3000");
});
app.listen(3000, ()=>{
    console.log("Server kaam kr ra hai on port 7000");
});