import mongoose from 'mongoose';

const userSchema= new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
        length:50
    },
    lastname:{
        type:String,
    },
    username:{
        type:String
    },
    email:{
        type:String,
        required:true,
        
    },
    password:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    }
})

const User = mongoose.model('User',userSchema);
export default User;