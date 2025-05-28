import jwt from 'jsonwebtoken';

import { ApiError } from '../utils/ApiError.js';
import User from '../models/user.models.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const verifyUserWithJWT = asyncHandler(async (req, res, next) => {
    try {
        var token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        // const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        const decodToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(`DecodedToken: ${decodToken._id}`)


        if (!decodToken) {
            throw new ApiError(401, "Unauthorized request")
        }

        const user = await User.findById(decodToken?._id);
        console.log(user);

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(`Token: ${token}`)
        console.log(`\n\nVerifying JWT: ${jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)}\n\n`)

        console.log(`\n\nAccess Token : ${process.env.ACCESS_TOKEN_SECRET}\n\n`)
        console.log(`${error}`)
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
});

export { verifyUserWithJWT }