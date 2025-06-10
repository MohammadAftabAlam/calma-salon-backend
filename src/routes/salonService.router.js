import { Router } from 'express';

import {
    createService,
    getAllServices,
    updateService,
    deleteService,
} from '../controllers/salon_services.controller.js';

const router = Router();

// router to add service
router.route('/:salonId/create-service').post(createService);

// router to getallservices
router.route('/:salonId/getAllServices').get(getAllServices);

// router to edit a service 
router.route('/:salonId/services/:serviceId/update-service').put(updateService);

// router to delete services
router.route('/:salonId/services/:serviceId/delete-service').delete(deleteService);

export default router;