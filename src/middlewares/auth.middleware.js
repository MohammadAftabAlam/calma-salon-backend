import jwt from 'jsonwebtoken';

import { ApiError } from '../utils/ApiError.js';
import User from '../models/user.models.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const verifyUserWithJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        console.log("Token to verify:", token);
        console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET);
        console.log("REFRESH_TOKEN_SECRET:", process.env.REFRESH_TOKEN_SECRET);

        // const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        //Checking whether token is verified or not 
        if (!decodedToken || decodedToken.tokenType !== "access") {
            throw new ApiError(401, "Unauthorized request")
        }

        // console.log(`Decoded Token: ${decodedToken.tokenType}`)

        // finding user form Db
        const user = await User.findById(decodedToken?._id);

        // if user not present 
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        // populating user inside req 
        req.user = user;

        // Calling next middleware
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
});

export { verifyUserWithJWT }