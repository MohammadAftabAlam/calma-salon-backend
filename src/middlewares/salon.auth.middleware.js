import jwt from "jsonwebtoken";

import Salon from "../models/salon.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const verifySalonWithJwt = asyncHandler(
    async (req, res, next) => {
        try {
            const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

            // If token not present
            if (!token) {
                throw new ApiError(401, "Access token is missing");
            }
            // decoding incoming token
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            // console.log(`Decoded Token: ${decodedToken.tokenType}`);

            // Checking whether token is verified or not
            if (!decodedToken || decodedToken.tokenType !== "access") {
                throw new ApiError(401, "Invalid token");
            }

            // Finding salon from Db
            const salon = await Salon.findById(decodedToken?._id);

            // If salon not present
            if (!salon) {
                throw new ApiError(401, "Invalid token or token is being used")
            }

            // Populating salon inside req
            req.salon = salon;

            next();
        } catch (error) {
            throw new ApiError(401, error?.message || "Invalid Access Token");
        }
    }
);

export default verifySalonWithJwt;