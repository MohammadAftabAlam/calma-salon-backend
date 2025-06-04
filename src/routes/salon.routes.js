import Router from 'express';
import { loginSalon, registerSalon } from '../controllers/salon.controller.js';
import { upload } from '../middlewares/multer.middleware.js'

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
router.route('/login-salon').post(loginSalon);

export default router