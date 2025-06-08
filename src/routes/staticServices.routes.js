import { Router } from "express"

import { upload } from '../middlewares/multer.middleware.js'
import {
    uploadStaticServicesImage,
    getAllStaticMenServices,
    getAllStaticWomenServices
} from "../controllers/staticService.controller.js";

const router = Router();


// services route
router.route("/addStaticServices").post(
    upload.fields(
        [{
            name: "serviceImage",
            maxCount: 1
        }]
    ),
    uploadStaticServicesImage
);

// get all men static services
router.route("/getMenStaticServices").get(getAllStaticMenServices);

// get all women static services
router.route("/getWomenStaticServices").get(getAllStaticWomenServices);

export default router