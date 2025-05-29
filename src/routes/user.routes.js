import { Router } from "express";
import { registerUser, loginUser, logoutUser, editProfile, changePassword } from "../controllers/user.controller.js";
import { verifyUserWithJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/aftab", (req, res) => {
    res.send("Aftab")
})
// route to register user
router.route("/register").post(registerUser);

// route to login user
router.route("/login").post(loginUser);

//logout route
router.route("/logout").post(verifyUserWithJWT, logoutUser);

//edit profile route
router.route("/editProfile").post(verifyUserWithJWT, editProfile);

//change password route
router.route("/changePassword").post(verifyUserWithJWT, changePassword);

export default router