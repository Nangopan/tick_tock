const User=require("../../models/userSchema")
const nodemailer=require("nodemailer")
const bcrypt=require("bcrypt")
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

const securePassword=async (password)=>{
    try{
        const passwordHash=await bcrypt.hash(password,10)
        return passwordHash
    }catch(error){
        console.log("Error in hashing password",error)
    }
}

const verifyOtp= async (req,res)=>{
    try{
        const {otp}=req.body

    console.log(otp)
    console.log(req.session.userOtp)

        if(otp===req.session.userOtp){
            const user=req.session.userData
            const passwordHash=await securePassword(user.password)

            const saveUserData= new User({
                name:user.name,
                email:user.email,
                phone:user.phone,
                password:passwordHash
            })
            await saveUserData.save();
            console.log(saveUserData)
            req.session.user=saveUserData._id
             res.json({success:true,redirectUrl:"/"})
        }else{
            res.status(400).json({success:false,message:"Invalid OTP,Please try again"})
        }
    }
    catch(error){
        console.error("Error Verifying OTP",error)
        res.status(500).json({success:false,message:"An error occured"})

    }
}


const resendOtp=async(req,res)=>{
    try{
        const {email}=req.session.userData
        if(!email){
            return res.status(400).json({success:false,message:"Email not found in session"})
        }
        const otp=generateOtp()
        req.session.userOtp=otp

        const emailSent=await sendVerificationEmail(email,otp)
        if(emailSent){
            console.log("Resend OTP:",otp)
            res.status(200).json({success:true,message:"OTP Resend Successfully"})
        }else{
            res.status(500).json({success:false,message:"Failed to resend OTP. "})
        }
    }catch(error){
         console.error("Error resending OTP",error)
         res.status(500).json({success:false,message:"Internal Server Error. Please try again."})
    }
}
module.exports={
    loadHomePage,
    pageNotFound,
    loadSignup,
    signup,
    verifyOtp,
    resendOtp,
}