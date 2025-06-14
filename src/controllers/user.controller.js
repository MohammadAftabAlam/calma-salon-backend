import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import options from "../utils/cookie_opt.js";
import { DEFAULT_PROFILE_PHOTO_URL } from '../constant.js'
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

import User from "../models/user.models.js";
// import  from "../db/server.js";
// const User = userModel(userDb);


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();

        user.refreshToken = refreshToken

        // Saving user without validation 
        await user.save({ ValidateBeforeSave: false })

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

// Controller that facilitate the functionality of Register new user
const registerUser = asyncHandler(
    async (req, res) => {
        // find details from req
        // validate details
        // validate avatarImage
        // parse incoming location 
        // check user already exist by using phone number or email
        // Upload avatar image on cloudinary
        // create user object --> create user entry in db
        // remove password and refreshToken from response
        // check whether user is created or not
        // return res

        // Destructuring req.body
        const { name, age, gender, phoneNumber, email, password, location } = req.body

        // Validating details filled by the user
        if ([name, gender, email, password].some((field) => { field?.trim() === "" })) {
            throw new ApiError(400, "All fields are required")
        }

        if (!email.includes('@')) {
            throw new ApiError(400, "Enter a valid email")
        }

        if (!phoneNumber) {
            throw new ApiError(400, "Phone number is required")
        }

        if (!age) {
            throw new ApiError(400, "Age is required")
        }

        // parsing location into object
        const parsedLocation = JSON.parse(location)

        // validating parsedLocation
        if (!parsedLocation || parsedLocation.type !== 'Point' || !Array.isArray(parsedLocation.coordinates) || parsedLocation.coordinates.length !== 2) {
            throw new ApiError(400, "Please provide a valid location in GeoJSON format");
        }

        // Finding user with same phone number or email IF EXIST
        const isUserExist = await User.findOne(
            { $or: [{ email }, { phoneNumber }] }
        )
        // console.log(isUserExist)

        // if isUserExist then throw error
        if (isUserExist) {

            // If avatar image uploaded on cloudinary then destroy it
            // if (!avatarImageCloudinary.url) {
            //     await deleteFromCloudinary("user", avatarImageCloudinary.url)
            // }

            // throw error 
            throw new ApiError(409, "User existed with same phone number or email")
        }

        let avatarImageLocalPath;
        let avatarImageCloudinary;
        let isDefaultProfilePic = true;         // It illustrates whether user used default picture as profile picture

        // Validating avatar image
        if (req.files && (Array.isArray(req.files.avatarImage) && req.files.avatarImage.length > 0)) {
            avatarImageLocalPath = req.files.avatarImage[0].path;

            // If avatarImageLocalPath has file path then upload it to cloud
            if (avatarImageLocalPath) {
                avatarImageCloudinary = await uploadOnCloudinary("user", avatarImageLocalPath);
                avatarImageLocalPath = avatarImageCloudinary.url

                // set default profile to false
                isDefaultProfilePic = false
            }
        }

        // If avatar file is not present then attach default user image url
        if (!avatarImageLocalPath) {
            avatarImageLocalPath = DEFAULT_PROFILE_PHOTO_URL
        }

        // Creating object of the user
        const user = await User.create({
            name,
            age,
            gender,
            phoneNumber,
            email,
            avatarImage: avatarImageLocalPath,
            isDefaultAvatarImage: isDefaultProfilePic,
            location: parsedLocation,
            password,
        })

        // Creating user in the database and removing password and refreshToken from the response that will be sent to frontend
        const createdUser = await User.findOne({
            _id: user._id,
        }).select("-password -refreshToken")

        // Checking whether user is created inside DB or not
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering user")
        }

        // Sending response to frontend that user has been created successfully
        return res
            .status(200)
            .json(
                new ApiResponse(200, createdUser, "User has registered successfully"),
            )
    }
);


// Controller that facilitate the functionality of Login
const loginUser = asyncHandler(
    async (req, res) => {
        // find login details from req.body ---> phone number
        // find the user based on phoneNumber
        // validate password from db 
        // logged In
        // return refreshToken and accessToken
        // send cookie


        // Destructuring req.body
        const { phoneNumber, password } = req.body

        // if phone Number is empty
        if (!phoneNumber) {
            throw new ApiError(400, "Phone number is required");
        }

        // finding the user
        const user = await User.findOne({ phoneNumber })

        // if User not found then Raising error 
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Validating user entered password with stored password
        const isPasswordValidated = await user.isPasswordCorrect(password);

        // if incorrect password
        if (!isPasswordValidated) {
            throw new ApiError(401, "Invalid phone number or password")
        }

        // Generating Refresh and Access Token and saving refresh Token in db
        const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user?._id);

        const loggedInUser = await User.findById(user?._id).select("-password -refreshToken")
        // console.log(loggedInUser)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200,
                { user: loggedInUser, refreshToken, accessToken },
                "User logged in successfully"),
            )
    }
);

// Contoller to update user avatar image
const updateUserAvatarImage = asyncHandler(
    async (req, res) => {

        let userAvatarImageLocalPath;

        // Validating upcoming image
        if (req.files && (Array.isArray(req.files.userAvatarImage) && req.files.userAvatarImage.length > 0)) {
            userAvatarImageLocalPath = req.files.userAvatarImage[0].path;
        }

        // Validating local path
        if (!userAvatarImageLocalPath) {
            throw new ApiError(400, "Avatar image file is missing");
        }

        // Cover Image is uploading on cloudinary
        const userAvatarImageCloudinary = await uploadOnCloudinary("user", userAvatarImageLocalPath);

        // If image not uploaded on cloudinary throw err
        if (!userAvatarImageCloudinary) {
            throw new ApiError(400, "Error while uploading the cover image");
        }

        // Commiting changes inside db
        const updatedUser = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    avatarImage: userAvatarImageCloudinary.url,
                    isDefaultAvatarImage: false
                }
            },
            { new: true }
        ).select("-password -refreshToken -location");

        // validating whether db update is successfull or not
        if (!updatedUser) {
            throw new ApiError(500, "Something went wrong while updating db");
        }

        // return response
        res
            .status(200)
            .json(
                new ApiResponse(200, updatedUser, "Avatar image updated successfully")
            )
    }
);

// update refreshAccessToken 
const refreshAccessToken = asyncHandler(
    async (req, res) => {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        // checking incoming refresh token
        try {
            if (!incomingRefreshToken) {
                throw new ApiError(403, "Unauthorized Request")
            }

            // decoding incoming refresh token with jwt
            const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

            if (!decodedToken) {
                throw new ApiError(401, "Invalid request")
            }

            // finding user form db
            const user = await User.findById(decodedToken._id)

            // whether user exists or not
            if (!user) {
                throw new ApiError(401, "Invalid refresh token")
            }

            // validating incoming refresh token with saved one from db
            if (user.refreshToken !== incomingRefreshToken) {
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
)

// Controller to get current user profile
const retreiveCurrentUser = asyncHandler(
    async (req, res) => {
        // fetching user from db
        const user = await User.findOne({ _id: req.user._id })

        // converting it to object
        const userObject = user.toObject(user);

        // deleting refresh Token from userObject
        delete userObject.refreshToken;

        // deleting password from userObject
        delete userObject.password

        // send res
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                { userObject },
                "Current User fetched successfully")
            );
    }
);

// Controller to edit profile
const updateAccountDetail = asyncHandler(

    // validate input {name and email}
    // find user
    // Update the fields 
    // return response 

    async (req, res) => {
        const { name, email } = req.body;

        // Check for empty fields
        if ([name, email].some((field) => { field.trim() === "" })) {
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
        const updatedUser = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: { name, email }
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
                    "User name or email are updated Successfully"),
            )
    }
);

// Controllers to change password
const changeCurrentUserPassword = asyncHandler(
    async (req, res) => {
        const { currrentPassword, newPassword, confirmNewPassword } = req.body;

        const isCurrentPasswordCorrect = await req.user.isPasswordCorrect(currrentPassword);

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
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            { $set: { password: hashedPassword } },
            { new: true }
        ).select("-password -refreshToken");

        // Check whether update operation performed
        if (!user) {
            throw new ApiError(500, "Something went wrong while updating password")
        }

        // sending response 
        res
            .status(200)
            .json(new ApiResponse(200,
                { user: user },
                "Password updated successfully")
            )
    }
);

// Controller that facilitate the functionality of Logout
const logoutUser = asyncHandler(
    async (req, res) => {
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:
                    { refreshToken: null }

            },
            { new: true }
        ).select("-password -refreshToken");

        res
            .status(200)
            .clearCookie("accessToken", user?.accessToken, options)
            .clearCookie("refreshToken", user?.refreshToken, options)
            .json(new ApiResponse(200, "User has logged out successfully"))
    }
);

// Controller to delete user 
const deleteUser = asyncHandler(
    async (req, res) => {
        // find user from db
        const currentUser = await User.findById({ _id: req.user._id })

        // If user is not using default avatar image then delete it from cloud
        if (!currentUser.isDefaultAvatarImage) {
            const isUserAvatarDeleted = await deleteFromCloudinary("user", currentUser.avatarImage)

            // Verify whether user avatar is deleted from cloud or not
            if (!isUserAvatarDeleted) {
                throw new ApiError(500, "User avatar image not deleted from cloud");
            }
        }

        // delete user from db
        await User.findByIdAndDelete({ _id: req.user._id });

        // Validate user is deleted or not from db
        const isUserDeleted = User.findOne({ _id: req.user._id })

        // If user not deleted then throw error
        if (!isUserDeleted) {
            throw new ApiError(500, "Something went wrong while deleting user from db")
        }

        // send res
        return res
            .status(200)
            .json(new ApiResponse(200,
                `${currentUser.name} is deleted successfully`
            ))
    }
);


export {
    registerUser,
    loginUser,
    logoutUser,
    updateUserAvatarImage,
    refreshAccessToken,
    updateAccountDetail,
    changeCurrentUserPassword,
    retreiveCurrentUser,
    deleteUser
}