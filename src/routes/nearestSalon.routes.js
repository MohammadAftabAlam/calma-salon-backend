import { Router } from "express";
import { findNearestSalonWithin4KmToUser } from "../controllers/nearest_salon.controller.js";
import { findNearestSalonExpert } from "../controllers/nearest_salon_expert.controller.js";

const router = Router();

router.route("/nearestSalonFinder").get(findNearestSalonWithin4KmToUser)
router.route("/nearestSalonExpert").get(findNearestSalonExpert)

export default router