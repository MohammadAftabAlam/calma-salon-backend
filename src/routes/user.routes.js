import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";

const router = Router();

router.get("/aftab", (req, res) => {
    res.send("Aftab")
})
// route to register user
router.route("/register").post(registerUser);

// route to login user
router.route("/login").post(loginUser);

export default router