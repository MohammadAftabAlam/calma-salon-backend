import Salon from "../models/salon.models.js";
import Service from "../models/services.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"

// Controller to create new service of a salon
const createService = asyncHandler(
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


        // // find salon and update services
        // const serviceUpdated = await Salon.findByIdAndUpdate(
        //     salonId,
        //     {
        //         $push: {
        //             services: createService._id,
        //         }
        //     }
        // );

        // // If services not updated
        // if (!serviceUpdated) {
        //     throw new ApiError(400, "Service not updated inside salon");
        // }


        // send response when both services are created and updated in salon
        return res
            .status(201)
            .json(new ApiResponse(201,
                { createService },
                "Service has created sucessfully")
            )

    }
);

// Controller to get all services of a salon
const getAllServices = asyncHandler(
    async (req, res) => {
        const { salonId } = req.params;

        const isSalonExist = await Salon.findById({_id: salonId});

        if(!isSalonExist){
            throw new ApiError(404, "Salon not found")
        }
        
        // const services = await Salon.findById(salonId);
        const services = await Service.find({ salonId });

        // If services is
        if (!services) {
            throw new ApiError(400, "Services not found")
        }

        res.status(200).json(new ApiResponse(200, services, "Services fetched successfully"))
    }
);


// Controllers to edit a service
const updateService = asyncHandler(
    async (req, res) => {
        const { salonId, serviceId } = req.params;
        const { name, price, duration, description, isActive, category } = req.body;

        // finding service
        const service = await Service.findOne({ _id: serviceId, salonId });

        // Validating and updating service
        if (name !== undefined) service.name = name;
        if (price !== undefined) service.price = price;
        if (duration !== undefined) service.duration = duration;
        if (description !== undefined) service.description = description;
        if (isActive !== undefined) service.isActive = isActive;
        if (category !== undefined) service.category = category;


        // saving updated data in db
        const updatedService = await service.save();

        // If updated service not updated inside db
        if (!updatedService) {
            throw new ApiError(500, "Something went wrong while updating service")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, updatedService, "Service has updated successfully"));
    }
);

// Controller to delete a service
const deleteService = asyncHandler(
    async (req, res) => {
        const { salonId, serviceId } = req.params;

        // find service from db using salonId
        const deletedService = await Service.deleteOne({ _id: serviceId, salonId: salonId });

        // If service not found or something error occured while deleting service from db
        if (deletedService.deletedCount !== 1) {
            throw new ApiError(400, `Service with ID ${serviceId} not found or doesn't belong to the salon`)
        }
        return res
            .status(200)
            .json(new ApiResponse(200, "Service has deleted successfully"))

    }
);



// Controller to delete all services related to a salon
const deleteAllServices = async (salonId) => {
    if (!salonId) {
        throw new ApiError(400, "Salon ID is required");
    }

    await Service.deleteMany({ salonId });

    const remainingServices = await Service.find({ salonId });

    if (remainingServices.length !== 0) {
        throw new ApiError(304, `Some services related to salon with ID: ${salonId} were not deleted`);
    }

    return true;
};

export {
    createService,
    getAllServices,
    updateService,
    deleteService,
    deleteAllServices
}