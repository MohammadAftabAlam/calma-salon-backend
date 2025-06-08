import Router from 'express';
import { upload } from '../middlewares/multer.middleware.js'
import verifySalonWithJwt from '../middlewares/salon.auth.middleware.js';
import {
    loginSalon,
    logoutSalon,
    registerSalon,
    getCurrentSalon,
    refreshAccessToken,
    updateAccountDetail,
    changeSalonCoverImage,
    changeCurrentUserPassword,
    deleteSalonAccount,
} from '../controllers/salon.controller.js';

const router = Router();

// route to register salon
router.route('/register-salon').post(
    upload.fields([
        {
            name: "salonImage",
            maxCount: 1
        }]
    ),
    registerSalon
);

// rotuer to login salon
router.route('/login').post(loginSalon);

// route to update access token
router.route('/update-token').get(refreshAccessToken);

// route to get salon profile
router.route('/profile').get(verifySalonWithJwt, getCurrentSalon);

// route to update salon profile    
router.route('/update-profile').put(verifySalonWithJwt, updateAccountDetail);

// route to update salon cover image
router.route('/update-coverImage').put(
    verifySalonWithJwt,
    upload.fields([
        {
            name: "salonCoverImage",
            maxCount: 1
        }
    ]),
    changeSalonCoverImage
);

//route to update passwors
router.route('/update-password').put(verifySalonWithJwt, changeCurrentUserPassword);

//route to logout salon
router.route('/logout').post(verifySalonWithJwt, logoutSalon);

router.route('/delete-account').delete(verifySalonWithJwt, deleteSalonAccount);

export default router