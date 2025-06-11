import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import {
    createSalonExpert,
    getAllExpertOfSalon,
    updateSalonExpertDetails,
    deleteASalonExpertFromSalon,
    updateSalonExpertAvatarImage
} from "../controllers/salon_expert.controller.js";

const router = Router();

// router to create salonExpert
router.route("/:salonId/salonExpert/create-salonExpert").post(
    upload.fields([
        {
            name: "salonExpertAvatarImage",
            maxCount: 1
        }]
    ),
    createSalonExpert
);

// router to view all salon expert of a salon
router.route("/:salonId/salonExpert/viewall-salonExpert").get(getAllExpertOfSalon)

// router to update salon expert details such as: Name, services & experience
router.route("/:salonId/salonExpert/:salonExpertId/update-salonExpertDetail").put(
    upload.none(),          // since data is coming in form of form-data
    updateSalonExpertDetails)

// router to update salon expert avatar image
router.route("/:salonId/salonExpert/:salonExpertId/update-salonExpertAvatarImage").put(
    upload.fields([
        {
            name: "salonExpertAvatarImage",
            maxCount: 1
        }]
    ),
    updateSalonExpertAvatarImage)

// router to delete a salon expert from salon
router.route("/:salonId/salonExpert/:salonExpertId/delete-salonExpert").delete(deleteASalonExpertFromSalon)

export default router