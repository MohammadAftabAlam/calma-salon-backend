import StaticServices from "../models/staticServices.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Controller to create static services
const createStaticService = asyncHandler(
    async (req, res) => {

        // Destructing coming request
        const { serviceName, gender, priority } = req.body;

        // validating empty property
        if (!priority) {
            throw new ApiError(400, "Priority is required");
        }

        // Validating service name and gender
        if ([serviceName, gender].some((field) => { field?.trim() === "" })) {
            throw new ApiError(400, "Service name and gender is required");
        }

        let serviceImageLocalFilePath;

        // Validating service image
        if ((req.files.serviceImage && Array.isArray(req.files.serviceImage)) && req.files.serviceImage.length > 0) {
            serviceImageLocalFilePath = req.files.serviceImage[0].path;
        }

        if (!serviceImageLocalFilePath) {
            throw new ApiError(400, "Service Image is required");
        }

        // Uploading image on cloudinary
        const serviceImageUrl = await uploadOnCloudinary('staticService', serviceImageLocalFilePath);

        // Validating image uploaded on cloudinary or not
        if (!serviceImageUrl) {
            throw new ApiError(500, "Something went wrong uploading service image");
        }

        // Pushing data into db
        const servicesCreated = await StaticServices.create({
            serviceImageUrl: serviceImageUrl.url,
            serviceName,
            gender,
            priority
        });

        // Validating is Service created or not
        if (!servicesCreated) {
            throw new ApiError(500, "Services not created");
        }

        // Providing response
        return res
            .status(201)
            .json(new ApiResponse(201, { servicesCreated }, "Static services created successfully"))
    }
);


// Controller to get static service based on gender
const retreiveStaticServicesForAGender = asyncHandler(
    async (req, res) => {
        const { gender } = req.query;

        console.log(`gender: ${gender}`)
        console.log(`gender type: `, typeof gender)

        // validating incoming gender
        if (!(gender === "men" || gender === "women")) {
            throw new ApiError(400, `${gender} is not valid type. Gender must be either men or women type!!`)
        }

        // finding services from db
        const staticServices = await StaticServices.find(
            { gender: { $eq: gender } }
        );

        // checking
        if (staticServices === undefined) {
            throw new ApiError(500, "Something went wrong while fetching services from db");
        }
        // console.log(staticServices);
        return res
            .status(200)
            .json(new ApiResponse(200,
                { staticServices },
                staticServices.length === 0
                    ? `Service for ${gender} not found`
                    : `Service for ${gender} fetched successfully`),
            );

    }
);

// Controller to get all static Men services

// const getAllStaticMenServices = asyncHandler(
//     async (req, res) => {
//         // getting men static services from db
//         const menStaticServices = await StaticServices.find({ gender: { $eq: "men" } });

//         // checking
//         if (!menStaticServices) {
//             throw new ApiError(404, "Something went wrong while fetching services from db");
//         }
//         // console.log(menStaticServices);
//         return res
//             .status(200)
//             .json(new ApiResponse(200,
//                 { menStaticServices },
//                 "Successfull"),
//             );
//     }
// );

// // Controller to get all static Women services

// const getAllStaticWomenServices = asyncHandler(
//     async (req, res) => {

//         // getting men static services from db
//         const womenStaticServices = await StaticServices.find({ gender: { $eq: "women" } });

//         if (!womenStaticServices) {
//             throw new ApiError(404, "Something went wrong while fetching services from db");
//         }
//         // console.log(womenStaticServices);
//         return res
//             .status(200)
//             .json(new ApiResponse(200,
//                 { womenStaticServices },
//                 "Successfull"),
//             );
//     }
// );

export {
    createStaticService,
    retreiveStaticServicesForAGender,
    // getAllStaticMenServices,
    // getAllStaticWomenServices
}