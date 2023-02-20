const mongoose = require("mongoose");
const URI = `mongodb+srv://Admin:FuyynHl6Hh0uQ2mt@cluster0.8vefv.mongodb.net/E-Commerce?retryWrites=true&w=majority`;
// const URI = `mongodb+srv://admin:${process.env.PASSWORD}@cluster0.t2qpckh.mongodb.net/Inotebook?retryWrites=true&w=majority`;

const ConnectToMongoose = () => {
  mongoose
    .connect(URI, ()=>{
        console.log("Database connected successfully")
    });
};
module.exports = ConnectToMongoose;


