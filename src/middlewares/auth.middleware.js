import jwt from 'jsonwebtoken';

import { ApiError } from '../utils/ApiError.js';
import User from '../models/user.models.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const verifyUserWithJWT = asyncHandler(async (req, res, next) => {
    try {
        var token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        // const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        const decodToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        //Checking whether token is verified or not 
        if (!decodToken) {
            throw new ApiError(401, "Unauthorized request")
        }

        // finding user form Db
        const user = await User.findById(decodToken?._id);

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