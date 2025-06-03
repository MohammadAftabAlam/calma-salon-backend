import Router from 'express';
import { registerSalon } from '../controllers/salon.controller.js';
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

export default router