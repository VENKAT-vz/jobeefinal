const User=require('../models/users');
const catchAsyncErrors=require('../middlewares/catchAsyncErrors')
const ErrorHandler=require('../utils/errorhandler')
const sendToken =require('../utils/jwtToken');
const sendEmail=require('../utils/sendEmail');
const crypto=require('crypto');
//register user
//api/v1/register
exports.registerUser= catchAsyncErrors (async (req,res,next)=>{
    const {name,email,password,role}=req.body;

    const user=await User.create({
        name,
        email,
        password,
        role
    });

    sendToken(user,200,res);
});

//login user 
// - api/v1/login
exports.loginUser =catchAsyncErrors(async (req,res,next)=>{
    const{email,password}=req.body;

    //checks if email or password is entered by the user
    if(!email || !password){
        return next(new ErrorHandler('Please enteremail and password ',400))
    }

    //finding user in db
    const user=await User.findOne({email}).select('+password');
    if(!user){
        return next(new ErrorHandler('Invalid Email or Password'),401);
    }

    //check password
    const isPasswordMatches=await user.comparePassword(password);
    if(!isPasswordMatches){
        return next(new ErrorHandler('Invalid Email or Password',401));
    }

    sendToken(user,200,res);

});

//forgot password 
//->/api/v1/password/forgot
exports.forgotPassword= catchAsyncErrors ( async (req,res,next) =>{
    const user =await User.findOne({email:req.body.email});

    //check if user email exists
    if(!user){
        return next(new ErrorHandler('No user found with this email',404));
    }


    //get reset token
    const resetToken = user.getResetPasswordToken();
    console.log(resetToken);
    
    await user.save({validateBeforeSave:false});

    //create reset password url
    const resetUrl=`${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
    const message=`Your password reset link is as follow:\n\n${resetUrl}\n\n 
    if you have not request this, then please ignore `

    try{
        await sendEmail({
            email:user.email,
            subject:'Jobee-API Password recovery',
            message
        });
    
        res.status(200).json({
            success:true,
            message:`Email sent successfully to: ${user.email}`
        });

    }catch(error){
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;

    await user.save({validateBeforeSave:false});
    return next(new ErrorHandler('Email is not sent.'),500);
    }
});

//reset password
//->/api/v1/password/reset:token

exports.resetPassword=catchAsyncErrors(async(req,res,next)=>{
    //hash url token
    const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() } 
    });

    if(!user){
        return next(new ErrorHandler('Password reset token is invalid',400));
    }

    //setup new password
    user.password=req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;
    await user.save();

    sendToken(user,200,res);
});


//logout user->api/v1/logout

exports.logout=catchAsyncErrors(async(req,res,next)=>{
    res.cookie('token','none',{
        expires : new Date(Date.now()),
        httpOnly:true
    });
    res.status(200).json({
        success:true,
        message:'Logged out successfully'
    });
})