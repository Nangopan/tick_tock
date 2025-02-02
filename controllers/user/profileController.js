const User=require("../../models/userSchema")

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
}