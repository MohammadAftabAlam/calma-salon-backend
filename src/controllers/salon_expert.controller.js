import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

import SalonExpert from "../models/salonExperts.model.js";

// Controller to create salon expert
const createSalonExpert = asyncHandler(
    async (req, res) => {
        // Destructuring body
        const { salonId } = req.params;
        const { fullName, experience, services } = req.body;

        // validating required fields
        if (!fullName || !services || !experience) {
            throw new ApiError(400, "All fields are required");
        }

        // parse services
        const parsedServices = JSON.parse(services)
        // console.log(parsedServices)


        // services = services.push()

        let salonExpertAvatarImageLocalPath;

        // Validating avatar image
        if ((req.files && Array.isArray(req.files.salonExpertAvatarImage)) && req.files.salonExpertAvatarImage.length > 0) {
            salonExpertAvatarImageLocalPath = req.files.salonExpertAvatarImage[0].path;
        }

        // If avatarImage doesn't have local path throw error
        if (!salonExpertAvatarImageLocalPath) {
            throw new ApiError("Avatar image file is missing")
        }

        // upload avatarImage on clodinary
        const uploadAvatarImage = await uploadOnCloudinary("salonExpert", salonExpertAvatarImageLocalPath);

        // If avatar image not uploaded on cloud throw error 
        if (!uploadAvatarImage) {
            throw new ApiError(500, "Something went wrong while uploading avatar on cloud")
        }

        // services inside db
        const salonExpert = await SalonExpert.create({
            salonId,
            fullName,
            avatar: uploadAvatarImage.url,
            services: parsedServices,
            experience,
        });

        const createdSalonExpert = await SalonExpert.findOne(salonExpert?._id);

        // find salonExpert is created or not 
        if (!createdSalonExpert) {
            throw new ApiError(500, "Salon Expert not created inside db")
        }

        // send response when both services are created and updated in salon
        return res
            .status(201)
            .json(new ApiResponse(201,
                { createdSalonExpert },
                "salon expert has created sucessfully")
            )

    }
);

// Controller to get all expert of a salon
const getAllExpertOfSalon = asyncHandler(
    async (req, res) => {
        const { salonId } = req.params;

        // const services = await Salon.findById(salonId);
        const salonExperts = await SalonExpert.find({ salonId });

        // If services is
        if (!salonExperts) {
            throw new ApiError(400, "Services not found")
        }

        res.status(200).json(new ApiResponse(200, salonExperts, "Services fetched successfully"))
    }
);


// Controllers to edit a salon expert
const updateSalonExpertDetails = asyncHandler(
    async (req, res) => {
        const { salonId, salonExpertId } = req.params;

        // since data is coming from form-data. so parse the body 
        // i have added upload.none() using multer middleware inside salonExpert.routes.js
        const { fullName, experience, services } = req.body;

        // finding salonExpert
        const salonExpert = await SalonExpert.findOne({ _id: salonExpertId, salonId });

        // Validating and updating full name
        if (fullName !== undefined) salonExpert.fullName = fullName;

        // Validating and updating experience
        if (experience !== undefined) salonExpert.experience = experience;

        // updating services of Salon Expert
        if (services !== undefined) {
            const servicesInsideDb = new Set(salonExpert.services);
            const parsedServices = JSON.parse(services)

            const newServices = parsedServices.filter(item => !servicesInsideDb.has(item))

            salonExpert.services = [...salonExpert.services, ...newServices]
        }


        // saving updated data in db
        const updatedSalonExpert = await salonExpert.save();

        // If updated service not updated inside db
        if (!updatedSalonExpert) {
            throw new ApiError(500, "Something went wrong while updating salon expert details")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, updatedSalonExpert, "Salon expert details have updated successfully"));
    }
);


//Controllers to update expert avatar image
const updateSalonExpertAvatarImage = asyncHandler(
    async (req, res) => {

        const { salonId, salonExpertId } = req.params;

        let salonExpertAvatarImageLocalPath;

        // Validating upcoming image
        if (req.files && (Array.isArray(req.files.salonExpertAvatarImage) && req.files.salonExpertAvatarImage.length > 0)) {
            salonExpertAvatarImageLocalPath = req.files.salonExpertAvatarImage[0].path;
        }

        // Validating local path
        if (!salonExpertAvatarImageLocalPath) {
            throw new ApiError(400, "Avatar image file is missing");
        }

        // Cover Image is uploading on cloudinary
        const avatarImageCloudinary = await uploadOnCloudinary("salonExpert", salonExpertAvatarImageLocalPath);

        // If image not uploaded on cloudinary throw err
        if (!avatarImageCloudinary) {
            throw new ApiError(400, "Something went wrong while uploading avatar image");
        }
        const salonExpert = await SalonExpert.findOne({ _id: salonExpertId, salonId })
        // console.log(salonExpert)
        // console.log(`Avatar path: ${salonExpert.avatar}`)

        const deletePreviousAvatarImage = await deleteFromCloudinary("salonExpert", salonExpert.avatar)

        // If deletion not peformed then throw error
        if (!deletePreviousAvatarImage) {
            // if error comes delete the newly ulploaded avatar image from cloud
            await deleteFromCloudinary("salonExpert", avatarImageCloudinary.url);
            throw new ApiError(500, "Something went wrong while deleting previous avatar image")
        }

        // Updating avatar image in db
        const updatedSalonExpert = await SalonExpert.findByIdAndUpdate(
            { _id: salonExpertId, salonId },
            {
                $set: { avatar: avatarImageCloudinary.url }
            },
            { new: true }
        )

        // validating whether db update is successfull or not
        if (!updatedSalonExpert) {
            throw new ApiError(500, "Something went wrong while updating db");
        }

        // return response
        res
            .status(200)
            .json(
                new ApiResponse(200, updatedSalonExpert, "Cover image updated successfully")
            )
    }
);

// Controller to delete a expert from salon 
const deleteASalonExpertFromSalon = asyncHandler(
    async (req, res) => {
        const { salonId, salonExpertId } = req.params;

        const salonExpert = await SalonExpert.findById({ _id: salonExpertId })

        // Deleting avatar image from cloudinary
        const deleteAvatarImage = await deleteFromCloudinary("salonExpert", salonExpert.avatar)


        if (!deleteAvatarImage) {
            throw new ApiError(500, "Avatar image is not deleted")
        }

        // find service from db using salonId
        const deletedSalonExpert = await SalonExpert.deleteOne({ _id: salonExpertId, salonId });

        // If service not found or something error occured while deleting service from db
        if (deletedSalonExpert.deletedCount !== 1) {
            throw new ApiError(400, `Salon expert with ID ${salonExpertId} not found or doesn't belong to the salon`)
        }
        return res
            .status(200)
            .json(new ApiResponse(200, "Salon expert has deleted successfully"))

    }
);

// delete all salon Expert from db

const deleteAllSalonExpertFromSalon = async (salonId) => {
    try {
        if (!salonId) {
            throw new ApiError(400, "Salon id is required")
        }

        const salonExperts = await SalonExpert.find({ salonId });

        // console.log("deleting starts all cloudinary images")
        salonExperts.forEach(
            async (expert) => {
                const isDeletedFromCloudinary = await deleteFromCloudinary("salonExpert", expert.avatar)
                if (!isDeletedFromCloudinary) {
                    throw new ApiError(500, `Error occured while deleting ${expert._id} avatar image`)
                }
            }
        )
        // console.log("DELETED  all cloudinary images")

        // console.log("deleting starts all salon experts from db")
        await SalonExpert.deleteMany({ salonId })
        // console.log("DELETED  all salon experts from db")

        const remainingSalonExpert = await SalonExpert.find({ salonId })

        if (remainingSalonExpert.length !== 0) {
            throw new ApiError(304, `Some salon expert related to salon with ID: ${salonId} were not deleted`);
        }

        return true;
    } catch (error) {
        console.log(error.message)
    }
}

export {
    createSalonExpert,
    getAllExpertOfSalon,
    updateSalonExpertDetails,
    updateSalonExpertAvatarImage,
    deleteASalonExpertFromSalon,
    deleteAllSalonExpertFromSalon
}