import Services from "../models/service.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadStaticServicesImage = asyncHandler(
    async (req, res) => {

        // Destructing coming request
        const { serviceName, category, priority } = req.body;

        // validating empty property
        if (!priority) {
            throw new ApiError(400, "Priority is required");
        }

        // Validating service name and category
        if ([serviceName, category].some((field) => { field.trim() === "" })) {
            throw new ApiError(400, "Service name and category is required");
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
        const serviceImageUrl = await uploadOnCloudinary(serviceImageLocalFilePath);

        // Validating image uploaded on cloudinary or not
        if (!serviceImageUrl) {
            throw new ApiError(500, "Something went wrong uploading images on cloud");
        }

        // Pushing data into db
        const servicesCreated = await Services.create({
            serviceImageUrl: serviceImageUrl.url,
            serviceName,
            category,
            priority
        });

        // Validating is Service created or not
        if (!servicesCreated) {
            throw new ApiError(500, "Services not created");
        }

        // Providing response
        return res
            .status(200)
            .json(new ApiResponse(200, { servicesCreated }, "Services created successfully"))
    }
);

export { uploadStaticServicesImage }