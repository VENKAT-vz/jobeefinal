const mongoose=require('mongoose');
const validator=require('validator');

const bcrypt=require('bcryptjs');
const jwt= require('jsonwebtoken');
const crypto=require('crypto');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Please enter your name']
    },
    email:{
        type:String,
        required:[true,'Please enter you email address'],
        unique:true,
        validate:[validator.isEmail,'Please enter valid email address']
    },
    role:{
        type:String,
        enum:{
            values:['user','employeer'],
            message:'Please select correct role'
        },
        default:'user'
    },
    password:{
        type:String,
        required:[true,'Please enter password for your account'],
        minlenght:[8,'Your password must be atleast 8 characters long'],
        select:false
    }, 
    createdAt:{
        type:Date,
        default:Date.now
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date
},
{
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
});


//Encrypting passworf before saving
userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        next();
    }
    this.password=await bcrypt.hash(this.password,10);
})


//return JSON web token
userSchema.methods.getJwtToken=function(){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRE_TIME
    });
}

//compare user password with db password
userSchema.methods.comparePassword=async function(enterPassword){
    return await bcrypt.compare(enterPassword,this.password);
}

//generate password reset token
userSchema.methods.getResetPasswordToken= function(){
    //generate token
    const resetToken=crypto.randomBytes(20).toString('hex');

    //hash and reset password token
    this.resetPasswordToken=crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
    
    //set token expire time
    this.resetPasswordExpire=Date.now() + 30*60*1000;

    return resetToken;
}

userSchema.virtual('jobsPublished', {
    ref: 'Job',
    localField: '_id',                 
    foreignField: 'user', 
    justOne: false
});


module.exports=mongoose.model('User',userSchema);