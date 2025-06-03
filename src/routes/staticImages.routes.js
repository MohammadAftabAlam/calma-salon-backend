import { Router } from "express"

import {upload } from '../middlewares/multer.middleware.js'
import { uploadStaticServicesImage, getAllStaticMenServices, getAllStaticWomenServices } from "../controllers/uploadImages.controller.js";

const router = Router();


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

// get all men static services
router.route("/getMenServices").get(getAllStaticMenServices);

// get all women static services
router.route("/getWomenServices").get(getAllStaticWomenServices);

export default router