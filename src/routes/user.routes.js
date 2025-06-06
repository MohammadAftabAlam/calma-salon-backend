import { Router } from "express";

import { verifyUserWithJWT } from "../middlewares/user.auth.middleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateAccountDetail,
    changeCurrentUserPassword
} from "../controllers/user.controller.js";

// import { uploadStaticServicesImage, getAllStaticMenServices, getAllStaticWomenServices } from "../controllers/uploadImages.controller.js";

// import { upload } from "../middlewares/multer.middleware.js";

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
router.route("/edit-profile").put(verifyUserWithJWT, updateAccountDetail);

//change password route
router.route("/change-password").put(verifyUserWithJWT, changeCurrentUserPassword);

// refresh token route
router.route("/refresh-token").put(verifyUserWithJWT, refreshAccessToken);


// services route
// router.route("/addServices").post(
//     upload.fields(
//         [{
//             name: "serviceImage",
//             maxCount: 1
//         }]
//     ),
//     uploadStaticServicesImage
// );


// get all men static services
// router.route("/getMenServices").get(getAllStaticMenServices);

// get all women static services
// router.route("/getWoenServices").get(getAllStaticWomenServices);

export default router