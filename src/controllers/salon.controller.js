import jwt from "jsonwebtoken";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteAllServices } from "./salon_services.controller.js";
import { deleteAllSalonExpertFromSalon } from "./salon_expert.controller.js";

import Salon from "../models/salon.models.js";
import options from "../utils/cookie_opt.js";

// Function to generate access and refresh token
const generateAccessAndRefreshToken = async (salonId) => {
    try {
        const salon = await Salon.findById(salonId);
        const refreshToken = salon.generateRefreshToken();
        const accessToken = salon.generateAccessToken();

        // Assigning refresh token to salon
        salon.refreshToken = refreshToken

        // Saving user without validation 
        await salon.save({ ValidateBeforeSave: false })

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

// Function to convert time string (HH:mm) to Date object
const convertTimeStringToDate = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date("1970-01-01");
    date.setHours(hours, minutes, 0, 0).toLocaleString();
    return date;
};

// Controller to register a salon
const registerSalon = asyncHandler(
    // find req from body
    // destructure req.body
    // find whether salon with same phoneNumber or salonName already exists or not
    // if exists then throw error
    // Now, validate the details
    // create a new salon
    // save the salon to the database
    // remove password and refreshToken from response
    // return 

    async (req, res) => {
        // Destructing the request body
        const {
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
            fullAddress
        } = req.body;

        // validating required fields
        if ([salonName, phoneNumber, email, description, yearOfExperience, openingTime, closingTime, password], fullAddress.some((field) => { return field?.trim() === "" })) {
            throw new ApiError(400, "All fields are required");
        }

        // Checking whether salon with same phoneNumber or salonName already exists or not
        const isSalonExist = await Salon.findOne({
            $or: [
                { phoneNumber, salonName, email }
            ]
        });

        // If salon exists then throw error
        if (isSalonExist) {
            throw new ApiError(400, "Salon with same phone number or salon name already exists");
        }

        // validating email
        if (!email.includes('@')) {
            throw new ApiError(400, "please enter a valid email")
        }

        // parsing location and services into JSON
        const parsedLocation = JSON.parse(location);
        // const parsedServices = JSON.parse(services);

        // parsing opening and closing time into date
        const parsedOpeningTime = convertTimeStringToDate(openingTime)
        const parsedClosingTime = convertTimeStringToDate(closingTime)

        // validating location
        if (!parsedLocation || parsedLocation.type !== 'Point' || !Array.isArray(parsedLocation.coordinates) || parsedLocation.coordinates.length !== 2) {
            throw new ApiError(400, "Please provide a valid location in GeoJSON format");
        }

        // validating services
        // if (!parsedServices || (!Array.isArray(parsedServices) && parsedServices.length === 0)) {
        //     throw new ApiError(400, "Atleast one service is required");
        // }

        // validating year of parsed opening and closing time
        if (isNaN(parsedOpeningTime.getTime()) || isNaN(parsedClosingTime.getTime())) {
            throw new ApiError(400, "Invalid time format. Use HH:mm.");
        }

        let salonImageLocalPath;

        // validating salon image
        if ((req.files && Array.isArray(req.files.salonImage)) && req.files.salonImage.length > 0) {
            salonImageLocalPath = req.files.salonImage[0].path;
        }

        // if salon image is not provided then throw error
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
            // services: parsedServices,
            description,
            location: parsedLocation,
            yearOfExperience,
            openingTime: parsedOpeningTime,
            closingTime: parsedClosingTime,
            password,
            salonImage: salonImageCloudinary.url,
            fullAddress
        })

        // validating whether salon is created or not
        const createdSalon = await Salon.findOne({
            _id: salon._id,
        }).select("-password -refreshToken")

        // if salon is not created then throw error
        if (!createdSalon) {
            throw new ApiError(500, "Something went wrong while registering salon")
        }

        // send response
        res
            .status(201)
            .json(new ApiResponse(201, { createdSalon }, "salon has registered successfully"));
    }
);


// Controller to login a salon
const loginSalon = asyncHandler(
    async (req, res) => {
        // Destructing the request body
        const { phoneNumber, password } = req.body;

        // validating required fields
        if ([phoneNumber, password].some((field) => { return field?.trim() === "" })) {
            throw new ApiError(400, "Phone number and password are required");
        }

        // finding salon by email
        const salon = await Salon.findOne({ phoneNumber });

        // validating salon exists or not
        if (!salon) {
            throw new ApiError(404, "Salon not found");
        }

        // checking password is correct or not
        const isPasswordValid = await salon.isSalonPasswordCorrect(password);

        // validating password is correct or not
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid phone number or password");
        }

        // generating refresh & access token
        const { refreshToken, accessToken } = await generateAccessAndRefreshToken(salon?._id);

        // finding salon by id and selecting fields except password and refreshToken
        const loggedInSalon = await Salon.findById(salon._id).select("-password -refreshToken");

        // sending response
        res
            .status(200)
            .cookie("refreshToken", refreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json(new ApiResponse(200,
                { loggedInSalon, refreshToken, accessToken },
                "Salon logged in successfully")
            );
    }
);

// Controller to get salon details
const getCurrentSalon = asyncHandler(async (req, res) => {
    const salon = req.salon

    // Converting salon instance to js Object
    const salonProfile = salon.toObject(salon)

    // deleting refreshToken from salonProfile
    delete salonProfile.refreshToken

    // deleting password from salonProfile
    delete salonProfile.password

    // send response
    return res
        .status(200)
        .json(new ApiResponse(200, salonProfile, "Current salon fetched successfully"));
});

// Controller to logout a salon
const logoutSalon = asyncHandler(
    async (req, res) => {

        //finding salon by id and updating refreshToken to null
        const salon = await Salon.findByIdAndUpdate(
            req?._id,
            {
                $set: {
                    refreshToken: null
                },
            },
            {
                new: true,
            }
        ).select("-password -refreshToken");

        // console.log(`refresh Token : ${salon.refreshToken}`);

        // sending response
        res
            .status(200)
            .clearCookie("refreshToken", salon?.refreshToken, options)
            .clearCookie("accessToken", salon?.accessToken, options)
            .json(
                new ApiResponse(200, "Salon logged out successfully")
            );
    }
);

// Controller to refresh access token
const refreshAccessToken = asyncHandler(
    async (req, res) => {
        const incomingRefreshToken = req.cookies.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

        try {
            // checking incoming refresh token
            if (!incomingRefreshToken) {
                throw new ApiError(403, "Unauthorized Request")
            }

            // decoding incoming refresh token with jwt.verify
            const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

            if (!decodedToken) {
                throw new ApiError(401, "Invalid token");
            }

            // finding salon form db
            const salon = await Salon.findById(decodedToken?._id);

            // whether user exists or not
            if (!salon) {
                throw new ApiError(401, "Invalid request, salon not found");
            }

            // validating incoming refresh token with saved one from db
            if (salon.refreshToken !== incomingRefreshToken) {
                throw new ApiError(401, "Refresh Token is expired or used");
            }

            // Generate a new access token
            const { accessToken, refreshToken } = await generateAccessAndRefreshToken(salon?._id);

            // sending response 
            res
                .status(200)
                .cookie("refreshToken", refreshToken, options)
                .cookie("accessToken", accessToken, options)
                .json(
                    new ApiResponse(200,
                        { accessToken, refreshToken },
                        "Access token has been refreshed successfully"
                    )
                );
        } catch (error) {
            throw new ApiError(401, error?.nessage || "Invalid refresh token ")
        }
    }
);

// Controller to edit profile
const updateAccountDetail = asyncHandler(

    // validate input {salonName and email}
    // find salon
    // Update the fields 
    // return response 

    async (req, res) => {
        const { salonName, email } = req.body;

        // Check for empty fields
        if ([salonName, email].some((field) => { field.trim() === "" })) {
            throw new ApiError(401, "All fields are required");
        }

        // Check if email is already used by another user 
        const isEmailExist = await Salon.findOne({
            _id: {
                $ne: req.salon._id  // Exclude current user
            },
            email
        });

        // If email already exists, throw error
        if (isEmailExist) {
            throw new ApiError(401, "Email already exist, use another one")
        }

        // Updating existing name and password
        const updatedSalon = await Salon.findByIdAndUpdate(
            req.salon?._id,
            {
                $set: { salonName, email }
            },
            {
                new: true
            }
        ).select("-password -refreshToken -location -services -yearOfExperience -openingTime -closingTime -description -salonImage");

        // sending response 
        res
            .status(200)
            .json(
                new ApiResponse(200,
                    { salon: updatedSalon },
                    "Fields are updated Successfully"),
            )
    }
);

// Controllers to change password
const changeCurrentSalonPassword = asyncHandler(
    async (req, res) => {

        // Destructuring body
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        // Validating incoming password
        const isCurrentPasswordCorrect = await req.salon.isSalonPasswordCorrect(currentPassword);

        // If current password is not correct then throw error
        if (!isCurrentPasswordCorrect) {
            throw new ApiError(401, "Invalid password");
        }

        // Checking whether both newpassword and confirmNewPassword is similiar
        if (!(newPassword === confirmNewPassword)) {
            throw new ApiError(401, "password doesn't match");
        }

        // Hashing new password
        const hashedPassword = await bcrypt.hash(confirmNewPassword, 10);

        //Save new password and remove unnecessary details
        const updatedSalon = await Salon.findByIdAndUpdate(
            req.salon?._id,
            { $set: { password: hashedPassword } },
            { new: true }
        ).select("-password -refreshToken -location -services -yearOfExperience -openingTime -closingTime -description -salonImage");

        // Check whether update operation performed
        if (!updatedSalon) {
            throw new ApiError(500, "Something went wrong while updating password")
        }

        // sending response 
        res
            .status(200)
            .json(new ApiResponse(200,
                { salon: updatedSalon },
                "Password updated successfully")
            )
    }
);

// Controller to change salon image
const changeSalonAvatarImage = asyncHandler(
    async (req, res) => {

        let salonAvatarImageLocalPath;

        // Validating upcoming image
        if ((req.files && Array.isArray(req.files.salonAvatarImage)) && req.files.salonAvatarImage.length > 0) {
            salonAvatarImageLocalPath = req.files.salonAvatarImage[0].path;
        }

        // Validating local path
        if (!salonAvatarImageLocalPath) {
            throw new ApiError(400, "Cover image file is missing");
        }

        // Cover Image is uploading on cloudinary
        const salonAvatarImageCloudinary = await uploadOnCloudinary("salon", salonAvatarImageLocalPath);

        // If image not uploaded on cloudinary throw err
        if (!salonAvatarImageCloudinary) {
            throw new ApiError(400, "Error while uploading the cover image");
        }

        // console.log(`Updated salon cloudinary image url: ${salonAvatarImageCloudinary.url}`)
        // console.log(`req.salon.?._id: ${req.salon?._id}`)

        // Commiting changes inside db
        const updatedSalon = await Salon.findByIdAndUpdate(
            req.salon?._id,
            {
                $set: { salonImage: salonAvatarImageCloudinary.url }
            },
            { new: true }
        ).select("-password -refreshToken -location -services -yearOfExperience -openingTime -closingTime -description");

        // validating whether db update is successfull or not
        if (!updatedSalon) {
            throw new ApiError(500, "Something went wrong while updating db");
        }

        // return response
        res
            .status(200)
            .json(
                new ApiResponse(200, updatedSalon, "Cover image updated successfully")
            )
    }
);

// Controller to delete salon account
const deleteSalonAccount = asyncHandler(
    async (req, res) => {
        // find salon from db
        // extract avatar image url from salon collection
        // Delete cloudinary avatar image of salon
        // Delete all services related to this salon from service collection
        // Delete all expert related to this salon from salonExpert collection
        // Now delete salon from collection 
        // Validate whether salon is deleted or not
        // Send response that salon is deleted

        // Find salon from db
        const salonFound = await Salon.findOne(req.salon._id);

        // delete salon images from cloudinary
        const isDeletedSalonImage = await deleteFromCloudinary("salon", salonFound.salonImage)

        // If salon image not deleted then throw error
        if (!isDeletedSalonImage) {
            throw new ApiError(500, "Images not deleted from cloud")
        }

        // delete services that related to this salon
        await deleteAllServices(req.salon?._id)

        // delete salon experts image related to this salon
        await deleteAllSalonExpertFromSalon(req.salon?._id)

        // find salon and delete 
        await Salon.findByIdAndDelete(
            req.salon._id,
        );

        // Finding salon whether it is deleted or not
        const deletedAccount = await Salon.findOne(req.salon?._id);

        // If salon is deleted from db then throw error
        if (deletedAccount !== null) {
            throw new ApiError(500, "Salon not deleted")
        }

        // send response 
        return res
            .status(200)
            .json(new ApiResponse(200,
                `${salonFound.salonName} is deleted successfully`)
            )
    }
);

// Exporting all controllers
export {
    registerSalon,
    loginSalon,
    logoutSalon,
    getCurrentSalon,
    refreshAccessToken,
    updateAccountDetail,
    changeSalonAvatarImage,
    changeCurrentSalonPassword,
    deleteSalonAccount
}