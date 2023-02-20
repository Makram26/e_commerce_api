const nodeMailer=require("nodemailer")



const sendEmail = async (options) =>{


   const transporter= nodeMailer.createTransport({
    // if issues in gmail side then add host and port may be executed and resolved your issues 
    // host: "smtp.gmail.com"
    // port : 465
    service: process.env.SMPT_SERVICE,
     //   service:"gmail",
      auth:{
        user: process.env.SMPT_MAIL,
        pass:process.env.SMPT_PASSWORD, 
      }
      // this password is the app password not the your orginal password used 
      // these are created after login your google account then create a google app
     // then get a password and paste it 
   })

   const mailOptions = {
    from :process.env.SMPT_MAIL,
    to:options.email,
    subject:options.subject,
    text:options.message
   }
   

  await transporter.sendMail(mailOptions)

}


module.exports = sendEmail