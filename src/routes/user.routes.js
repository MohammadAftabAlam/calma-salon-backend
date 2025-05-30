import { Router } from "express";
import { verifyUserWithJWT } from "../middlewares/auth.middleware.js";
import { uploadStaticServicesImage } from "../controllers/uploadImages.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

import { registerUser, loginUser, logoutUser, editProfile, changePassword } from "../controllers/user.controller.js";

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
router.route("/edit-profile").post(verifyUserWithJWT, editProfile);

//change password route
router.route("/change-password").post(verifyUserWithJWT, changePassword);

// services route
router.route("/addServices").post(
    verifyUserWithJWT,
    upload.fields(
        [{
            name: "serviceImage",
            maxCount: 1
        }]
    ),
    uploadStaticServicesImage
);

export default router