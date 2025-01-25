const passport=require("passport")
const GoogleStrategy=require("passport-google-oauth20").Strategy
const User=require("../models/userSchema")
const { ProfilingLevel } = require("mongodb")
const env=require("dotenv").config()


passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"/auth/google/callback"
},
async (accessToken,refreshToken,ProfilingLevel,done)=>{
    try {
        let user=await User.findOne({googleId:Profile.id})
        if(user){
            return done(null,user)
        }else{
            user=new user({
                name:profile.displayname,
                email:profile.emails[0].value,
                googleID:profile.id,
            })
            await user.save()
            return done(null,user)
        }
    } catch (error) {
        return done(error,null)
    }
    }
))

passport.serializeUser((user,done)=>{
    done(null,user.id)
})


passport.deserializeUser((id,done)=>{
    User.findById(id)
    .then((user)=>{done(null,user)})
    .catch((err)=>{done(err,null)})
})


module.exports=passport