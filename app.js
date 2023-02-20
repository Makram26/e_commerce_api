const express=require("express")
const cors=require("cors")

const errorMiddleware=require("./middleware/errors")

const cookieParser=require("cookie-parser")

const app=express();

app.use(express.json())
app.use(cookieParser())
app.use(cors())

// Route imports

const product=require("./routes/productRoute");
const user =require("./routes/userRoute")
const order=require("./routes/orderRoute")

app.use("/api/v1",user)

app.use("/api/v2",product);

app.use("/api/v3",order)

app.use(errorMiddleware)


module.exports=app;