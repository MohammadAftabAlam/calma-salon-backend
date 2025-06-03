import Salon from "../models/salon.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerSalon = asyncHandler(
    // find req from body
    // destructure req.body
    // validate the details
    // create a new salon
    // save the salon to the database
    // remove password and refreshToken from response
    // return 

    async (req, res) => {
        // Destructing the request body
        const { salonName, phoneNumber, email, services, description, location, yearOfExperience, openingTime, closingTime, password } = req.body;

        // validating required fields
        if ([salonName, phoneNumber, email, description, location, yearOfExperience, openingTime, closingTime, password].some((field) => { return field.trim() === "" })) {
            throw new ApiError(400, "All fields are required");
        }
        // validating email
        if (!email.contains('@')) {
            throw new ApiError(400, "please enter a valid email")
        }

        // validating services
        if (services.length === 0) {
            throw new ApiError(400, "Please add at least one service");
        }

        let salonImageLocalPath;

        // validating salon image
        if ((req.files && Array.isArray()) && req.files.salonImage.length > 0) {
            salonImageLocalPath = req.files.salonImage[0].path;
        }

        // validating local image path
        if (!salonImageLocalPath) {
            throw new ApiError(400, "Salon image is required");
        }

        // uplodaing salon image on cloudinary
        const salonImageCloudinary = await uploadOnCloudinary('salon', salonImageLocalPath);

        // Validating image uploaded on cloudinary or not
        if (!salonImageCloudinary) {
            throw new ApiError(500, "Something went wrong while uploading salon image");
        }

        // create salon inside db
        const salon = await Salon.create({
            salonName,
            phoneNumber,
            email,
            services,
            description,
            location,
            yearOfExperience,
            openingTime,
            closingTime,
            password,
            salonImage: salonImageCloudinary.url,
        })

        // validating whether salon is created or not
        const createdSalon = await Salon.findOne({
            _id: salon._id,
        }).select("-password -refreshToken")
        if (!createdSalon) {
            throw new ApiError(500, "Something went wrong while registering salon")
        }

        // sending response
        res
            .status(200)
            .json(new ApiResponse(200, createdSalon, "salon has registered successfully"));
    }
);

export {
    registerSalon,
}