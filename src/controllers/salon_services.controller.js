import Service from "../models/services.models.js";
import Salon from "../models/salon.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"

const addService = asyncHandler(
    async (req, res) => {

        //find salon from req
        // destructure req.body
        // validate all fields whether it has data or not
        // create services inside 
        // find salon from db
        // udate salon with new service
        // validate whether serviceId pushed or not
        // send response

        // Destructuring body
        const { name, price, duration, description, isActive, category } = req.body;

        // finding salonId from parameters
        const { salonId } = req.params

        // validating required fields
        if ([name, category].some((field) => { return field?.trim() === "" }) || !isActive || !price || !duration) {
            throw new ApiError(400, "All fields are required");
        }

        // validating price, isActive and duration of service
        if (price <= 0) {
            throw new ApiError(400, "Price must be greater than 0");
        }

        // services inside db
        const service = await Service.create({
            salonId,
            name,
            price,
            duration,
            description,
            isActive,
            category
        });

        const createService = await Service.findOne(service._id);
        // find services is created or not 
        if (!createService) {
            throw new ApiError(500, "Service not created inside db")
        }


        // find salon and update services
        const serviceUpdated = await Salon.findByIdAndUpdate(
            salonId,
            {
                $push: {
                    services: createService._id,
                }
            }
        );

        // If services not updated
        if (!serviceUpdated) {
            throw new ApiError(400, "Service not updated inside salon");
        }


        // send response when both services are created and updated in salon
        return res
            .status(200)
            .json(new ApiResponse(200,
                { createService },
                "Service has created sucessfully")
            )

    }
);

// Controller to get all services of a salon
const getAllServices = asyncHandler(
    async (req, res) => {
        const { salonId } = req.params;

        // const services = await Salon.findById(salonId);
        const services = await Service.find({ salonId });

        // If services is
        if (!services) {
            throw new ApiError(400, "Services not found")
        }

        res.status(200).json(new ApiResponse(200, services, "Services fetched successfully"))
    }
);

// Controller to delete a service




export {
    addService,
    getAllServices
}