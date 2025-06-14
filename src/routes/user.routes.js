import { Router } from "express";

import { verifyUserWithJWT } from "../middlewares/user.auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateAccountDetail,
    changeCurrentUserPassword,
    retreiveCurrentUser,
    updateUserAvatarImage,
    deleteUser
} from "../controllers/user.controller.js";


const router = Router();

// route to register user
router.route("/register").post(
    upload.fields([
        {
            name: "avatarImage",
            maxCount: 1
        }
    ]),
    registerUser
);

// route to login user
router.route("/login").post(loginUser);

//logout route
router.route("/logout").post(verifyUserWithJWT, logoutUser);

//route to update profile
router.route("/update-profile").put(verifyUserWithJWT, updateAccountDetail);

//route to update avatarImage
router.route("/update-avatarImage").put(
    verifyUserWithJWT,
    upload.fields([
        {
            name: "avatarImage",
            maxCount: 1
        }
    ]),
    updateAccountDetail
);

//route to update password
router.route("/update-password").put(verifyUserWithJWT, changeCurrentUserPassword);

// route to refresh accesstoken
router.route("/update-accessToken").put(verifyUserWithJWT, refreshAccessToken);

// route to update profile pic
router.route("/update-avatarImage").put(
    verifyUserWithJWT,
    upload.fields([
        {
            name: "userAvatarImage",
            maxCount: 1
        }
    ]),
    updateUserAvatarImage
);

// route to get current user profile
router.route('/retrieve-currentUser').get(verifyUserWithJWT, retreiveCurrentUser)

// route to delete current user
router.route("/delete-user").delete(verifyUserWithJWT, deleteUser)

export default router