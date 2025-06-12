import { Router } from "express"

import { upload } from '../middlewares/multer.middleware.js'
import {
    createStaticService,
    // getAllStaticMenServices,
    // getAllStaticWomenServices,
    retreiveStaticServicesForAGender
} from "../controllers/static_service.controller.js";

const router = Router();


// services route
router.route("/addStaticServices").post(
    upload.fields(
        [{
            name: "serviceImage",
            maxCount: 1
        }]
    ),
    createStaticService
);

// router to get static services for a specific gender
router.route("/retreiveStaticServices").get(retreiveStaticServicesForAGender);

// get all men static services
// router.route("/getMenStaticServices").get(getAllStaticMenServices);

// // get all women static services
// router.route("/getWomenStaticServices").get(getAllStaticWomenServices);

export default router