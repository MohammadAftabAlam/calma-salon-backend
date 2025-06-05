import jwt from "jsonwebtoken";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

import Salon from "../models/salon.models.js";
import options from "../utils/cookie_opt.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const salon = await Salon.findById(userId);
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

// Controller to register a salon
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
        if ([salonName, phoneNumber, email, description, yearOfExperience, openingTime, closingTime, password].some((field) => { return field?.trim() === "" })) {
            throw new ApiError(400, "All fields are required");
        }
        // validating email
        if (!email.includes('@')) {
            throw new ApiError(400, "please enter a valid email")
        }

        // parsing location and services into JSON
        const parsedLocation = JSON.parse(location);
        const parsedServices = JSON.parse(services);

        // validating location
        if (!parsedLocation || parsedLocation.type !== 'Point' || !Array.isArray(parsedLocation.coordinates) || parsedLocation.coordinates.length !== 2) {
            throw new ApiError(400, "Please provide a valid location in GeoJSON format");
        }

        // validating services
        if (!parsedLocation || (!Array.isArray(parsedServices) && parsedServices.length === 0)) {
            throw new ApiError(400, "Atleast one service is required");
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
            services: parsedServices,
            description,
            location: parsedLocation,
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

        // if salon is not created then throw error
        if (!createdSalon) {
            throw new ApiError(500, "Something went wrong while registering salon")
        }

        // sending response
        res
            .status(200)
            .json(new ApiResponse(200, { createdSalon }, "salon has registered successfully"));
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
        const isPasswordValid = await salon.isPasswordCorrect(password);

        // validating password is correct or not
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid credentials");
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
    return res.status(200).json(new ApiResponse(200, req.salon, "Current User fetched successfully"));
});

// Controller to logout a salon
const logoutSalon = asyncHandler(
    async (req, res) => {

        //finding salon by id and updating refreshToken to null
        const salon = Salon.findByIdAndUpdate(
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
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        try {
            // checking incoming refresh token
            if (!incomingRefreshToken) {
                throw new ApiError(403, "Unauthorized Request")
            }

            // decoding incoming refresh token with jwt.verify
            const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

            if (!decodedToken) {
                throw new ApiError(401, "Invalid request")
            }

            // finding salon form db
            const salon = await Salon.findById(decodedToken._id)

            // whether user exists or not
            if (!salon) {
                throw new ApiError(401, "Invalid refresh token")
            }

            // validating incoming refresh token with saved one from db
            if (salon.refreshToken !== incomingRefreshToken) {
                throw new ApiError(401, "Refresh Token is expired or used")
            }

            // Generate a new access token
            const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user?._id)

            // sending response 
            res
                .status(200)
                .cookie("refreshToken", newRefreshToken, options)
                .cookie("accessToken", accessToken, options)
                .json(
                    new ApiResponse(200,
                        { accessToken, "refreshToken": newRefreshToken },
                        "Access token has been refreshed successfully"
                    )
                )
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
        const isEmailExist = await User.findOne({
            _id: {
                $ne: req.user._id  // Exclude current user
            },
            email
        })
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
        ).select("-password -refreshToken")

        // sending response to the user
        res
            .status(200)
            .json(
                new ApiResponse(200,
                    { user: updatedUser },
                    "Fields are updated Successfully"),
            )
    }
);

// Controllers to change password
const changeCurrentUserPassword = asyncHandler(
    async (req, res) => {
        const { currrentPassword, newPassword, confirmNewPassword } = req.body;

        const isCurrentPasswordCorrect = await req.salon.isPasswordCorrect(currrentPassword);

        if (!isCurrentPasswordCorrect) {
            throw new ApiError(401, "Invalid password");
        }

        // Checking whether both newpassword and confirmNewPassword is similiar
        if (!(newPassword === confirmNewPassword)) {
            throw new ApiError(401, "password doesn't matched");
        }

        // Hashed password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        //Save new password and remove password from response
        const salon = await Salon.findByIdAndUpdate(
            req.salon?._id,
            { $set: { password: hashedPassword } },
            { new: true }
        ).select("-password -refreshToken");

        // Check whether update operation performed
        if (!salon) {
            throw new ApiError(500, "Something went wrong while updating password")
        }

        // sending response 
        res
            .status(200)
            .json(new ApiResponse(200,
                { salon: salon },
                "Password updated successfully")
            )
    }
);

export {
    registerSalon,
    loginSalon,
    logoutSalon,
    getCurrentSalon,
    refreshAccessToken,
    updateAccountDetail,
    changeCurrentUserPassword,
}