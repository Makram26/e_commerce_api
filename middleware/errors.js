const ErrorHandler=require("../utils/errorHandler")

module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode || 500
    err.message=err.message || "Internal Server Error"


// wrong Mongodb Id error then Handle CastError 
if(err.name === "CastError"){
    const message =`Resource not found. Invalid: ${err.path}`
    err =new ErrorHandler(message,400)
}


//  Mongoose duplicate key Errors
if(err.code === 11000){
    const message=`Duplicate ${Object.keys(err.keyValue)} Entered`
    err = new ErrorHandler(message,400)
}
// Wrong JWT error 
if(err.name === "jsonWebTokenError"){
    const message =`Json web Token is Invalid, try again`
    err =new ErrorHandler(message,400)
}

// JWT EXPIRE Error
if(err.name === "TokenExpiredError"){
    const message =`Json web Token is Expired, try again`
    err =new ErrorHandler(message,400)
}
    res.status(err.statusCode).json({
        success:false,
        // error:err.stack
        // error:err
        message:err.message

    })

    console.log(err);

}