import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import Service from "../models/services.models.js";

// Controller to filter based on both price & category of services
const filterServiceBasedOnCategoryPriceOrBoth = asyncHandler(
    async (req, res) => {
        const { salonId } = req.params;
        const { category, price } = req.query;

        //Validating salonId
        if (!salonId) {
            throw new ApiError(400, "Salon id is required");
        }

        // Validating category
        if (!price && !category) {
            throw new ApiError(400, "price or category is required");
        }

        // Validating category
        if ((category !== undefined) && !(category === "men" || category === "women")) {
            throw new ApiError(400, `Invalid category type. Category must be either 'men' or 'women`);
        }

        let services;

        if (category !== undefined) {
            services = await Service.find({ salonId, category })
        }
        else if (price !== undefined) {
            services = await Service.find({ salonId, price: { $gte: price } })
        }
        else if ((price !== undefined) && (category !== undefined)) {
            services = await Service.find({ salonId, price: { $lte: price }, category });
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { services },
                    services.length == 0 ? "No services found matching this filter" : `Service price less than ₹ ${price} fetched successfully`
                )
            )
    }
);

// Controllers to sort based on price in ascending order
const sortServicesBasedOnPrice = asyncHandler(
    async (req, res) => {
        const { salonId } = req.params;
        const { category, sortingType } = req.query;

        if (!sortingType || typeof sortingType !== 'string') {
            throw new ApiError(400, "sortingType is required and of string type")
        }

        if (!(sortingType === "asc" || sortingType === "desc")) {
            throw new ApiError(400, "Invalid sorting type. Sorting type must be either 'asc' or 'desc")
        }

        if ((category !== undefined) && !(category === "men" || category === "women")) {
            throw new ApiError(400, `Invalid category type. Category must be either 'men' or 'women`);
        }

        let ascendingOrderServices;
        if (category !== undefined) {
            ascendingOrderServices = await Service.find({ salonId, category }).sort({ price: sortingType === 'asc' ? 1 : -1 })
        }
        else if (category === undefined) {
            ascendingOrderServices = await Service.find({ salonId }).sort({ price: sortingType === 'asc' ? 1 : -1 })
        }


        return res.status(200)
            .json(new ApiResponse(200, { services: ascendingOrderServices }, "Services fetched successfully"))
    }
);




// Controller to get category based services of a salon
// const getCategoryBasedServices = asyncHandler(
//     async (req, res) => {
//         const { salonId } = req.params;
//         const { category } = req.query;

//         //Validating salonId
//         if (!salonId) {
//             throw new ApiError(400, "Salon id is required");
//         }

//         if (!category || typeof category !== 'string') {
//             throw new ApiError(400, "Category is required");
//         }

//         // Validating category
//         if (!(category === "men" || category === "women")) {
//             throw new ApiError(400, `${category} is not a valid category`);
//         }

//         // finding services from db
//         const services = await Service.find({ salonId, category });

//         // console.log(services);
//         return res
//             .status(200)
//             .json(
//                 new ApiResponse(
//                     200,
//                     { services },
//                     services.length == 0 ? "No services found matching this category filter" : `${category} services feteched successfully`
//                 )
//             )
//     }
// );

// // Controller to filter based on price of services
// const getServicePriceBased = asyncHandler(
//     async (req, res) => {
//         const { salonId } = req.params;
//         const { price } = req.query;

//         //Validating salonId
//         if (!salonId) {
//             throw new ApiError(400, "Salon id is required");
//         }

//         // Validating category
//         if (!price) {
//             throw new ApiError(400, "price is required");
//         }

//         const services = await Service.find({ salonId, price: { $gte: price } });

//         return res
//             .status(200)
//             .json(
//                 new ApiResponse(
//                     200,
//                     { services },
//                     services.length == 0 ? "No services found matching this price filter" : `Service price greater than ₹ ${price} fetched successfully`
//                 )
//             )
//     }
// );
export {
    // getCategoryBasedServices,
    // getServicePriceBased,
    filterServiceBasedOnCategoryPriceOrBoth,
    sortServicesBasedOnPrice,
}