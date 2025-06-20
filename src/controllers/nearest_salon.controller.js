import Salon from "../models/salon.models.js";
import Services from "../models/services.models.js"
import SalonExpert from "../models/salonExperts.model.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"

// Function to find nearestSalon according to user's location
const getNearyBySalons = async (userLat, userLong) => {

    // Validating user latitude and longitude
    if (!userLat || !userLong) {
        throw new ApiError(400, "All fields are required")
    }

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
    }).select("-password -refreshToken -createdAt -updatedAt -__v")

    if (!nearestSalon) {
        throw new ApiError(500, "Something went wrong while fetching nearest salon")
    }

    return nearestSalon
}

// Function to find nearestSalonExperts
const getNearbySalonExpert = async (nearestSalonFound) => {

    // finding salonIds from nearestSalonFound array
    const salonIds = nearestSalonFound.map(
        salon => salon._id.toString()
    )

    // find all salon experts based on the salonIds
    const nearbySalonExpert = await SalonExpert.find({
        salonId: { $in: salonIds }
    }).select("-createdAt -updatedAt -__v")

    // return nearBy salons
    return nearbySalonExpert
}

// Function to find nearestSalonServices
const getNearbySalonServices = async (nearestSalonFound) => {

    //Extracting salonIds from nearest salon found
    const salonIds = nearestSalonFound.map(
        salon => salon._id.toString()
    );

    // finding all the services that have salonId present inside salonIds array
    const allServices = await Services.find({
        salonId: { $in: salonIds }
    })

    const servicesBySalon = {};

    allServices.forEach(service => {
        // Converting salonId object to string
        const salonId = service.salonId.toString();

        // creating key & value pair for storing services based on salonId
        if (!servicesBySalon[salonId]) {
            servicesBySalon[salonId] = [];
        }

        const serviceObject = service.toObject(service)

        // Deleting version and salonId from response
        delete serviceObject.__v
        delete serviceObject.salonId

        // console.log(service)
        servicesBySalon[salonId].push(serviceObject);
    });

    return servicesBySalon
}

// Controller to find nearestSalon, SalonExperts and salonServices
const findNearestSalonWithin4KmToUser = asyncHandler(
    async (req, res) => {
        const { userLat, userLong } = req.body;

        // finding nearestSalon based on user location
        const nearestSalon = await getNearyBySalons(userLat, userLong)

        let salonExpert, nearestSalonServices;

        // If nearest found then find its salon expert and its services
        if (nearestSalon.length !== 0) {
            salonExpert = await getNearbySalonExpert(nearestSalon);
            nearestSalonServices = await getNearbySalonServices(nearestSalon);
        }

        // send res
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                {
                    nearbySalon: nearestSalon,
                    nearbySalonExpert: salonExpert,
                    getNearbySalonServices: nearestSalonServices
                },
                nearestSalon.length !== 0 ? "fetched successfully" : "Nearyby salons not found")
            )
    }
)

export {
    findNearestSalonWithin4KmToUser,
    getNearyBySalons
}



// const getNearbySalonServices = async (nearestSalonFound) => {
//     // for (const salon of nearestSalonFound) {
//     //     const salonServices = await Services.find({ salonId: salon._id.toString() }).select("-price -duration -isActive -category -salonId -_id -__v")

//     // let newService = [];
//     // salonServices.forEach((service) => {
//     //     console.log(service)
//     //     // const serviceName = Object.values(service)
//     //     console.log(serviceName)
//     //     // newService.push()
//     // })

//     // // console.log(salonServices)
//     // console.log(newService)

//     // nearestSalonExpertFound = [...nearestSalonExpertFound, ...salonExperts]
//     // const populatedsalonservices = await Salon.findById({ _id: salon._id.toString() }).populate(newService)

//     //     console.log(populatedsalonservices)
//     // }



//     //Extracting salonIds from nearest salon found
//     const salonIds = nearestSalonFound.map(salon => salon._id.toString());

//     // finding all the services that have salonId present inside salonIds array
//     const allServices = await Services.find({
//         salonId: { $in: salonIds }
//     })

//     const servicesBySalon = {};

//     allServices.forEach(service => {
//         const salonId = service.salonId.toString();

//         // creating key & value pair for storing services based on salonId
//         if (!servicesBySalon[salonId]) {
//             servicesBySalon[salonId] = [];
//         }

//         let serviceObject = service.toObject(service)

//         delete serviceObject.__v
//         delete serviceObject.salonId

//         // console.log(service)
//         servicesBySalon[salonId].push(serviceObject);
//     });

//     return servicesBySalon
// }



//getNearestSalonExpert
/* 
const getNearestSalonExpert = async (nearestSalonFound) => {
    let nearestSalonExpertFound = [];

    for (const salon of nearestSalonFound) {
        const salonExperts = await SalonExpert.find({ salonId: salon._id.toString() })
        nearestSalonExpertFound = [...nearestSalonExpertFound, ...salonExperts]
    }


    return nearestSalonExpertFound
}
*/