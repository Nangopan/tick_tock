const express = require("express");
const router = express.Router();
const passport = require("passport");
const { userAuth, adminAuth } = require("../middlewares/auth");
const userController = require("../controllers/user/userController");

router.get("/pageNotFound", userController.pageNotFound);
router.get("/signup", userController.loadSignup);
router.post("/signup", userController.signup);
router.post("/verify-otp", userController.verifyOtp);
router.post("/resend-otp", userController.resendOtp);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/signup" }),
  (req, res) => {
    res.redirect("/");
  }
);
router.get("/login", userController.loadLogin);
router.post("/login", userController.login);
router.get("/", userController.loadHomePage);
router.get("/shop", userAuth, userController.loadshoppingPage);
router.get("/logout", userController.logout);

module.exports = router;
