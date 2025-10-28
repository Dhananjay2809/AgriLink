const express=require('express');
const app=express();
const {adminAuth}=require('./middlewares/auth');

app.use("/admin",adminAuth);
app.get("user",(req,res)=>{
res.send("Get the all data from the api")
});
app.get("/admin/deletedata",(req,res)=>{
    res.send("Admin deleted the data from the api")
});
app.use("/name",(req,res,next)=>{
    console.log("To test the middelware");
     next();
    res.send("This is the first rersponse from the server");
   
    },
    (req,res)=>{
        console.log("Second middelware");
        res.send("This is the second response from the server");
        
    }
);


// here i separetely created the get request for the server
app.get("/user/:userid/:name", (req,res)=>{
    console.log(req.params);
    res.send({name:"Dhananjay", lastname:"Singh"});
});
// created the post request for the server
app.get("/name",(req,res)=>{
    console.log("Post request received");
    // res.send("Atul Pratapp Singh")
});

app.listen(3000, ()=>{
    console.log("Server kaam kr ra hai on port 3000");
});