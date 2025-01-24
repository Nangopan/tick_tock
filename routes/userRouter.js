const express=require("express")
const router=express.Router()
const userController=require("../controllers/user/userController")

// router.get('/pageNotFound',userController.pageNotFound)


router.get("/signup",userController.loadSignup)
router.get('/',userController.loadHomePage)
router.post("/signup",userController.signup)






module.exports=router