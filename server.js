const app = require("./app");
const ConnectToMongoose = require("./config/database")

// Handling Uncaught Exception
process.on('uncaughtException',(err)=>{
    console.log(`Error: ${err.message}`)
    console.log("shutting down the server due to Uncaught Exception")

    process.exit(1)
})

ConnectToMongoose();
const dotenv=require("dotenv")

dotenv.config({path:"config/config.env"})

// console.log(">>>>>>>",process.env.JWT_SECRET)

// console.log(youtube)  // this type of caught error e.g not defind some values
const PORT = 4000


const server = app.listen(PORT, () => {
    console.log(`Server is working on http://localhost:${PORT}`)
})

// Unhandled Promise Rejections
process.on('unhandledRejection', err => {
    console.log(`Error: ${err.message}`)
    console.log("shutting down the server due to Unhandled Promise Rejection ")

    server.close(() => {
        process.exit(1)
    })

})