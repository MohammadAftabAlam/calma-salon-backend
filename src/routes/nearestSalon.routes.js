import { Router } from "express";
import { findNearestSalonWithin4KmToUser } from "../controllers/nearest_salon.controller.js";
const router = Router();

router.route("/nearestSalonFinder").get(findNearestSalonWithin4KmToUser)

export default router