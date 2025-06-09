import { Router } from 'express';

import { addService, getAllServices } from '../controllers/salon_services.controller.js';

const router = Router();

router.route('/:salonId/addServices').post(addService)
router.route('/:salonId/salon-services').get(getAllServices)

export default router;