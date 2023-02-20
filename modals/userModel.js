const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt =require("bcryptjs")

const jwt = require("jsonwebtoken")

const crypto=require("crypto")

const usersSchema =new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter your Name"],
        maxLength:[30,"Name cannot exceed 30 characters"],
        minLength:[4,"Name should have more then 4 characters"]
    },
    email: {
        type: String,
        required: [true, "Please Enter your Email"],
        unique:true,
        validate:[validator.isEmail,"Please Enter a valid Email"]
       
    },
    password: {
        type: String,
        required: [true, "Please Enter Your password"],
        minLength:[8,"Password should be  greater then 8 characters"],
        select:false  // this field add beacuse password field not show on database if any user find out the value of any specific user
    },
    image: 
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        },
    role: {
        type: String,
        default:"user"
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
   
}, { timestamps: true })

// this function execute during saving data in DB and
usersSchema.pre("save",async function(next){
    // this condition check passowrd modified or not if modified then add hash value otherwise not change or add hash value  
     if(!this.isModified("password")){
        next()
     }
    this.password =await bcrypt.hash(this.password,10)
})


// Json Web Tokens Handle 
usersSchema.methods.getJWTToken =function (){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn :process.env.JWT_EXPIRE,
    })
}


// Compare Password

usersSchema.methods.comparePassword = async function (enterPassword){
    return await bcrypt.compare(enterPassword,this.password);
}

// Generating password Reset Token
usersSchema.methods.getPasswordResetToken = function () {
    // Generating Token 
    const resetToken = crypto.randomBytes(20).toString("hex")

    // Hashing and adding reset Password Token to userSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire =Date.now() + 15 * 60 * 1000;

    return resetToken;
}

module.exports = mongoose.model("User", usersSchema)