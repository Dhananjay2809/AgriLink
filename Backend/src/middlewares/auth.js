const adminAuth=(req,res,next)=>{
    console.log("Admin authentication middelware called");
    const token="xyz";
    const isAuthenticated=token==="xyz";
    if(isAuthenticated){
        next();
    }
    else{
        res.send("Admin not authenticated");
    }
};
module.exports={adminAuth};