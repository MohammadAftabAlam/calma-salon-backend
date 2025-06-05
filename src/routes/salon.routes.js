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
    changeCurrentUserPassword,
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

//route to logout salon
router.route('/logout').post(verifySalonWithJwt, logoutSalon)

// route to get salon profile
router.route('/salon-profile').get(verifySalonWithJwt, getCurrentSalon)

// route to update salon profile
router.route('/update-profile').put(verifySalonWithJwt, updateAccountDetail);

// route to update access token
router.route('/update-access-token').get(verifySalonWithJwt, refreshAccessToken);

//route to update passwors
router.route('/update-password').put(verifySalonWithJwt, changeCurrentUserPassword);


export default router