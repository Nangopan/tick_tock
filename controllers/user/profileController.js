const User=require("../../models/userSchema")
const nodemailer=require("nodemailer")
const bcrypt=require("bcrypt")
const session=require("express-session")
const env=require("dotenv").config()

function generateOtp(){
    const digits="1234567890"
    let otp=""
    for(let i=0;i<6;i++){
        otp+=digits[Math.floor(Math.random()*10)]
    }
    return otp
}

const sendVerificationEmail=async(req,res)=>{
    try {
        const transporter=nodemailer.createTransport({
            service:"gmail",
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD,
            },
            tls: {
              rejectUnauthorized: false,
            },
        })

        const mailOptions={
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:"Your OTP for password reset",
            text:`Your OTP is ${otp}`,
            html:`<b><h4>Your OTP:${otp}</h4><br></b>`
        }

        const info=await transporter.sendMail(mailOptions)
        console.log("Email sent",info.messageId)
        return true
    } catch (error) {
        console.error("Error sending email",error)
        return false
    }
}

const getForgotPassPage=async (req,res)=>{
    try {
        res.render("forgot-password")
    } catch (error) {
        res.redirect("/pageNotFound")
    }
}

const forgotEmailValid=async (req,res)=>{
    try {
        const {email}=req.body
        const findUser=await User.findOne({email:email})
        if(findUser){
            const otp=generateOtp()
            const emailSent=await sendVerificationEmail(email,otp)
            if(emailSent){
                req.session.userOtp=otp
                req.session.email=email
                res.render("forgotPass-otp")
                console.log("OTP",otp)

            }else{
                res.json({success:false,message:"Failed to send OTP.Please try again"})
            }
        }else{
            res.render("forgot-password",{
                message:"User with this email does not exists"
            })
        }
    } catch (error) {
        console.log("Error in forgot password",error)
        res.redirect("pageNotFound")
    }
}


const userProfile=async(req,res)=>{
    try {
        const userId=req.session.user
        const userData=await User.findById(userId)
        res.render("profile",{
            user:userData,
        })
    } catch (error) {
        console.log("Error in loading user Profile",error)
        res.redirect("/pageNotFound")
    }
}

const changeEmail=async(req,res)=>{
    try {
        res.render("change-email")
    } catch (error) {
        console.log("Error loading change-email",error)
        res.redirect("/pageNotFound")
    }
}

const changeEmailValid=async(req,res)=>{
try {
    const {email}=req.body

    const userExists=await User.findOne({email})
    if(userExists){
        const otp=generateOtp()
        const emailSent=await sendVerificatioEmail(email,otp)
        if(emailSent){
            req.session.userOtp=otp
            req.session.userData=req.body
            req.session.email=email
            res.render("change-email-otp")
            console.log("Email sent:",email)
            console.log("OTP:",otp)
        }else{
            res.json("email-error")
        }
    }else{
        res.render('change-email',{
            message:"User with this email already exists"
        })
    }
} catch (error) {
    console.log("Error validating change email",error)
    res.redirect("/pageNotFound")
}
}

module.exports={
    userProfile,
    changeEmailValid,
    changeEmail,
    getForgotPassPage,
    forgotEmailValid,
}