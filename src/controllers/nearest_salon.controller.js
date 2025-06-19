import Salon from "../models/salon.models.js";
import SalonExpert from "../models/salonExperts.model.js";
import Services from "../models/services.models.js"

import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getNearestSalonExpert = async (nearestSalonFound) => {
    let nearestSalonExpertFound = [];

    for (const salon of nearestSalonFound) {
        const salonExperts = await SalonExpert.find({ salonId: salon._id.toString() })
        nearestSalonExpertFound = [...nearestSalonExpertFound, ...salonExperts]
    }
    return nearestSalonExpertFound
}

const populateServicesInsideSalon = async (nearestSalonFound) => {
    let nearestSalonExpertFound = [];

    // for (const salon of nearestSalonFound) {
    //     const salonServices = await Services.find({ salonId: salon._id.toString() }).select("-price -duration -isActive -category -salonId -_id -__v")

    // let newService = [];
    salonServices.forEach((service) => {
        console.log(service)
        // const serviceName = Object.values(service)
        console.log(serviceName)
        // newService.push()
    })

    // // console.log(salonServices)
    // console.log(newService)

    // nearestSalonExpertFound = [...nearestSalonExpertFound, ...salonExperts]
    // const populatedsalonservices = await Salon.findById({ _id: salon._id.toString() }).populate(newService)

    //     console.log(populatedsalonservices)
    // }



    const salonIds = nearestSalonFound.map(salon => salon._id.toString());

    const allServices = await Services.find({
        salonId: { $in: salonIds }
    }).select("salonId serviceName"); // Add more fields if needed

    const servicesBySalon = {};

    allServices.forEach(service => {
        const salonId = service.salonId.toString();
        if (!servicesBySalon[salonId]) {
            servicesBySalon[salonId] = [];
        }
        servicesBySalon[salonId].push(service.serviceName);
    });


    return allServices
}

const findNearestSalonWithin4KmToUser = asyncHandler(
    async (req, res) => {
        const { userLat, userLong } = req.body;

        console.log(typeof userLat)
        // Validating user latitude and longitude
        if (!userLat || !userLong) {
            throw new ApiError(400, "All fields are required")
        }

        // Validating typeof user longitude and latitude
        // if (!(typeof userLat === number || typeof userLong === number)) {
        //     throw new ApiError(400, "Latitude and longitude must be of number type")
        // }

        // finding nearest Salon from db
        const nearestSalon = await Salon.find({
            // location is name that is used to store salon coordinates inside salon.models.js 
            location:
            {
                $near: {
                    $geometry: {
                        type: "Point", coordinates: [userLong, userLat],
                    },
                    // This is specifying how much km it consider while fetching salon from db
                    $maxDistance: 4000  // in meters
                }
            }
        }).select("-password -refreshToken -createdAt -updatedAt")

        if (!nearestSalon) {
            throw new ApiError(500, "Something went wrong while fetching nearest salon")
        }

        // const salonExpert = await getNearestSalonExpert(nearestSalon);
        const populatedSalonWithServices = await populateServicesInsideSalon(nearestSalon);

        return res
            .status(200)
            .json(new ApiResponse(200,
                {
                    nearestSalon: populatedSalonWithServices,

                    // nearestSalonExpert: salonExpert
                },
                nearestSalon.length !== 0 ? "fetched successfully" : "Nearest salon not found")
            )
    }
)


const findNearestSalonWithin4KmToUserFn = async (userLat, userLong) => {

    // Validating user latitude and longitude
    if (!userLat || !userLong) {
        throw new ApiError(400, "All fields are required")
    }

    // // Validating typeof user longitude and latitude
    // if (!(typeof userLat === Number || typeof userLong === Number)) {
    //     throw new ApiError(400, "Latitude and longitude must be of number type")
    // }

    // finding nearest Salon from db
    const nearestSalon = await Salon.find({
        // location is name that is used to store salon coordinates inside salon.models.js 
        location:
        {
            $near: {
                $geometry: {
                    type: "Point", coordinates: [userLong, userLat],
                },
                // This is specifying how much km it consider while fetching salon from db
                $maxDistance: 4000  // in meters
            }
        }
    }).select("-password -refreshToken -createdAt -updatedAt")

    if (!nearestSalon) {
        throw new ApiError(500, "Something went wrong while fetching nearest salon")
    }

    // return res
    //     .status(200)
    //     .json(new ApiResponse(200,
    //         { nearestSalon },
    //         nearestSalon.length !== 0 ? "fetched successfully" : "Nearest salon not found")
    //     )

    // console.log(nearestSalon)

    return nearestSalon
}

export {
    findNearestSalonWithin4KmToUser,
    findNearestSalonWithin4KmToUserFn
}