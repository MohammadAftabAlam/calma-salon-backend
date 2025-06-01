import { Router } from "express"

import { getAllStaticMenServices, getAllStaticWomenServices } from "../controllers/uploadImages.controller.js";

const router = Router();

// get all men static services
router.route("/getMenServices").get(getAllStaticMenServices);

// get all women static services
router.route("/getWomenServices").get(getAllStaticWomenServices);

export default router