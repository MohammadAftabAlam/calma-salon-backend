// import Salon from '../models/salon.models.js'
import SalonExpert from '../models/salonExperts.model.js'

import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { findNearestSalonWithin4KmToUserFn } from './nearest_salon.controller.js';


const findNearestSalonExpert = async (req, res) => {
    const { userLat, userLong } = req.body;
    const nearestSalonFound = await findNearestSalonWithin4KmToUserFn(userLat, userLong);

    let nearestSalonExpertFound = [];

    for (const salon of nearestSalonFound) {
        const salonExperts = await SalonExpert.find({ salonId: salon._id.toString() })
        nearestSalonExpertFound = [...nearestSalonExpertFound, ...salonExperts]
    }

    // nearestSalonFound.forEach(async (salon) => {
    //     // console.log(`salonId: ${salon._id.toString()}`)
    //     let salonExperts = await SalonExpert.find({ salonId: salon._id.toString() })
    //     // console.log(salonExperts)
    //     nearestSalonExpertFound = [...nearestSalonExpertFound, ...salonExperts]

    // })

    // nearestSalonExpertFound.forEach((salonExpert) => {
    //     console.log(`Salon Name:  Expert Name: ${salonExpert.fullName}`)
    // })

    return res
        .status(200)
        .json(new ApiResponse(200,
            { nearestSalonExpert: nearestSalonExpertFound },
            "Nearest salon experts fetched successfully")
        )
}

export { findNearestSalonExpert }