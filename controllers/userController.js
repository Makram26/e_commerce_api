const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../modals/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require('../utils/sendEmail')

const crypto = require("crypto")


// Register a User 
exports.registrerUser = catchAsyncErrors(async (req, res, next) => {

    const { name, email, password } = req.body;

    const user = await User.create({
        name, email, password,
        image: {
            public_id: "this is a sample id ",
            url: "profilepicUrl"
        }
    })


    // const token =user.getJWTToken();

    // res.status(201).json({
    //     success:true,
    //     token
    // })

    sendToken(user, 201, res)

})


//  Login User 


exports.login = catchAsyncErrors(async (req, res, next) => {

    const { email, password } = req.body;

    // checking if user has given password and email both
    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email & Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401))
    }


    const isPasswordmatched = await user.comparePassword(password);
    console.log(isPasswordmatched)

    if (!isPasswordmatched) {
        return next(new ErrorHandler("Invalid email or password", 401))
    }

    // const token =user.getJWTToken();

    // res.status(201).json({
    //     success:true,
    //     token
    // })

    sendToken(user, 201, res)

})


// Logout User


exports.logout = catchAsyncErrors(async (req, res, next) => {


    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })


    res.status(200).json({
        success: true,
        message: "Logged Out"
    })

})

// Forgot Password 

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {


    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new ErrorHandler("User not found", 404))
    }

    // Get ResetPassword Token 
    const resetToken = await user.getPasswordResetToken()


    await user.save({ validateBeforeSave: false })

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nif you have not requested this email then, Pleasee ignore it `;


    try {

        await sendEmail({
            email: user.email,
            subject: "Ecommerce Password Recovery",
            message: message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        console.log("akram")

        await user.save({ validateBeforeSave: false })

        return next(new ErrorHandler(error.message, 500))
    }


    // res.status(200).json({
    //  success :true,
    //  message:"Logged Out"
    // })

})

//  Reset Password 

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {


    // creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    })
    if (!user) {
        return next(new ErrorHandler("Reset Password Token is Invalid or has been expired", 400))
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match password ", 400))
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save();
    sendToken(user, 200, res)
})



//  Get User Details

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id)


    res.status(200).json({
        success: true,
        user,
    })

})

// Update User Password  
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id).select("+password");


    const isPasswordmatched = await user.comparePassword(req.body.oldPassword)

    if(!isPasswordmatched){
        return next(new ErrorHandler("Old password is incorrect",400));
    }
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("password does not match",400));
    }

    user.password = req.body.newPassword
    await user.save()

   sendToken(user,200,res)

})


// Update User Profiles 
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {


    const newUserData={
        name:req.body.name,
        email:req.body.email,
    }

    // we will add cloudinary later

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        userFindAndModify:false
    })
    
   res.status(200).json({
    success:true,
   })

})


// Get All users (admin)

exports.getAllUser = catchAsyncErrors(async (req, res, next) => {

    const users= await User.find()


    const UsersCount= await User.countDocuments()

    res.status(200).json({
        success: true,
        UsersCount,
        users,
    })

})

//  Get Single User Details (admin)

exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {

    const user= await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`))
    }
 

    res.status(200).json({
        success: true,
        user,
    })

})



// Update User Role (Admin)
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {


    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }


    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        userFindAndModify:false
    })
    
   res.status(200).json({
    success:true,
   })

})


// Delete User  (Admin)
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {

    const user= await User.findById(req.params.id)
 // we will remove cloudinary later
if(!user){
    return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`))
}
await User.findByIdAndDelete(req.params.id)
res.status(200).json({
   success:true,
   message:"User Delete Successfully!"
})
})