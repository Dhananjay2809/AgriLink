const express=require('express');
const app=express();

// here i separetely created the get request for the server
app.get("/user/:userid/:name", (req,res)=>{
    console.log(req.params);
    res.send({name:"Dhananjay", lastname:"Singh"});
});
// created the post request for the server
app.post("/name",(req,res)=>{
    console.log("Post request received");
    res.send("Atul Pratapp Singh")
});

app.listen(3000, ()=>{
    console.log("Server kaam kr ra hai on port 3000");
});