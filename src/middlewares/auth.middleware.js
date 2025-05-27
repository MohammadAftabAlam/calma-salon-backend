import jwt from 'jsonwebtoken';

import { ApiError } from '../utils/ApiError.js';
import User from '../models/user.models.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const verifyUserWithJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        // const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        const decodToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(`DecodedToken: ${decodToken._id}`)

        if (!decodToken) {
            throw new ApiError(401, "Unauthorized request")
        }

        const user = await User.findById(decodToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
});

export { verifyUserWithJWT }