import User from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import options from "../utils/cookie_opt.js";


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
        // check user already exist by using phone number or email
        // create user object -- create user entry in db
        // remove password and refreshToken from response
        // check whether user is created or not
        // return res

        // Destructuring req.body
        const { name, age, gender, phoneNumber, email, password } = req.body

        // Validating details filled by the user
        if ([name, gender, email, password].some((field) => { field?.trim() === "" })) {
            throw new ApiError(400, "All fields are required")
        }

        // Finding user with same phone number or email IF EXIST
        const existedUser = await User.findOne(
            { $or: [{ email }, { phoneNumber }] }
        )
        // console.log(existedUser)

        // if user is existed with same phoneNumher or email then Error will be raised
        if (existedUser) {
            throw new ApiError(409, "User existed with same email or phone number")
        }

        // Creating object of the user
        const user = await User.create({
            name,
            age,
            gender,
            phoneNumber,
            email,
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
                new ApiResponse(200, createdUser, "User has been registered successfully registered"),
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
    });

// Controller that facilitate the functionality of Logout
const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: [
                { refreshToken: null }
            ]
        },
        { new: true }
    );

    res.status(200).json(new ApiResponse(200, "User has been logged out successfully"))

})



export { registerUser, loginUser, logoutUser }