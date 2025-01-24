const User=require("../../models/userSchema")
const nodemailer=require("nodemailer")
const env=require("dotenv").config()

const loadSignup=async (req,res)=>{
    try{
        return res.render("signup")
    }
    catch(error){
        console.log("sign up page error",error)
        res.status(500).send("server error")
    }
}



const loadHomePage=async (req,res)=>{
try{
    return res.render("home")
}
catch(error){
 console.log("Home page not found")
 res.status(500).send("Server Error")
}
}

const pageNotFound=async (req,res)=>{
    try{
        res.render('page-404')
    }
    catch(error){
        res.redirect('/pageNotFound')
    }
}
 
function generateOtp(){
    return Math.floor(100000+Math.random()*900000).toString()
}

async function sendVerificationEmail(email,otp){
    try{
        const transporter=nodemailer.createTransport({
            service:"gmail",
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        })

        const info=await transporter.sendMail({
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:"Verify your account",
            text:`Your OTP is ${otp}`,
            html:`<b>YOUR OTP: ${otp}</b>`
        })
        return info.accepted.length>0
    }
    catch(error){
          console.error("Error sending email",error.message)
          return false
    }
}
const signup=async (req,res)=>{
const {name,phone,email,password,cPassword}=req.body
    try{
        if(password!==cPassword){
           return res.render("signup",{message:"Passwords do not match"})
        }

        const findUser=await User.findOne({email})
        if(findUser){
            return res.render("signup",{message:"User with this mail already exists"})
        }

        const otp=generateOtp()
        console.log(otp)

        const emailSent=await sendVerificationEmail(email,otp)
        if(!emailSent){
            return res.json("email-error")
        }

        req.session.userOtp=otp
        req.session.userData={name,phone,email,password}

        res.render('verify-otp')
        console.log("OTP Sent",otp)
}catch(error){
console.error("signup error",error)
res.redirect("/pageNotFound")
}
}


module.exports={
    loadHomePage,
    pageNotFound,
    loadSignup,
    signup,
}