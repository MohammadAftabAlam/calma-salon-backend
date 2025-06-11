import { Router } from "express";
import {
    filterServiceBasedOnCategoryPriceOrBoth,
    sortServicesBasedOnPrice,
} from "../controllers/salon_service_filter.controller.js";

const router = Router();

// get category based services 
// router.route('/:salonId/getCategoryBasedService').get(getCategoryBasedServices)

// // get price based services
// router.route('/:salonId/getPriceBasedService').get(getServicePriceBased)

// filter service based on price, category or both 
router.route('/:salonId/getPriceAndCategoryBasedService').get(filterServiceBasedOnCategoryPriceOrBoth)

// get both price and category based 
router.route('/:salonId/sort-services').get(sortServicesBasedOnPrice)

// get both price and category based 
// router.route('/:salonId/sort-services-descending').get(sortServicesBasedOnPriceInDescending)


export default router