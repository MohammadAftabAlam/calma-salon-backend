import { Router } from "express";

import { verifyUserWithJWT } from "../middlewares/auth.middleware.js";
import { uploadStaticServicesImage, getAllStaticMenServices, getAllStaticWomenServices } from "../controllers/uploadImages.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser, loginUser, logoutUser, refreshAccessToken, updateAccountDetail, changeCurrentUserPassword } from "../controllers/user.controller.js";

const router = Router();

// router.get("/aftab", (req, res) => {
//     res.send("Aftab")
// })

// route to register user
router.route("/register").post(registerUser);

// route to login user
router.route("/login").post(loginUser);

//logout route
router.route("/logout").post(verifyUserWithJWT, logoutUser);

//edit profile route
router.route("/edit-profile").post(verifyUserWithJWT, updateAccountDetail);

//change password route
router.route("/change-password").post(verifyUserWithJWT, changeCurrentUserPassword);

// services route
router.route("/addServices").post(
    upload.fields(
        [{
            name: "serviceImage",
            maxCount: 1
        }]
    ),
    uploadStaticServicesImage
);

// refresh token route
router.route("/refresh-token").post(verifyUserWithJWT, refreshAccessToken);

// get all men static services
// router.route("/getMenServices").get(getAllStaticMenServices);

// get all women static services
// router.route("/getWoenServices").get(getAllStaticWomenServices);
export default router