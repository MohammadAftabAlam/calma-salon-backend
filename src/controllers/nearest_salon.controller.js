import Salon from "../models/salon.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// const userLat = 28.462671691964733;
// const userLong = 77.49622606804714;

const findNearestSalonWithin4KmToUser = async (req, res) => {
    const { userLat, userLong } = req.body;

    if (!userLat || userLong) {
        throw new ApiError(400, "User coordinates can't be empty")
    }

    const nearestSalon = await Salon.find({
        location:
        {
            $near: {
                $geometry: {
                    type: "Point", coordinates: [userLong, userLat],
                },
                $maxDistance: 4000  // in meters
            }
        }
    })

    if (!nearestSalon) {
        throw new ApiError(500, "Something went wrong while fetching nearest salon")
    }

    return res.status(200).json(new ApiResponse(200, { nearestSalon }, "fetched successfully"))
}

export { findNearestSalonWithin4KmToUser }