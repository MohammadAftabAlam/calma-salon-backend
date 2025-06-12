import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Method to upload images
const uploadOnCloudinary = async (folder, localFilePath) => {
    try {

        // file has local path or not
        if (!localFilePath) {
            throw new Error("File not found or doesn't exist")
        }

        // uploading on cloudinary
        const response = await cloudinary.uploader
            .upload(
                localFilePath,
                {
                    folder: folder,
                    resource_type: "auto",
                    use_filename: true
                },
            );

        // Checking whether image uploaded on cloudinary 
        if (!response) {
            throw new Error("File not uploaded on cloud")
        }

        // unlinking the local file
        fs.unlinkSync(localFilePath);

        // returning response
        return response

    } catch (error) {
        // If any error occurs, log the error and unlink the local file
        fs.unlinkSync(localFilePath);
        console.log(error.message)
    }
}

const deleteFromCloudinary = async (folder, imageUrl) => {
    try {

        if (!folder || !imageUrl) {
            throw new Error("folder or imageUrl is required")
        }

        // Converting image url into array
        const urlParts = imageUrl.split('/');

        // getting filename with extension from array
        const filenameWithExt = urlParts[urlParts.length - 1]

        // Extracting filename from filenameWithExt
        const filename = filenameWithExt.split('.')[0]

        // Sending public_id to destroy image
        const response = await cloudinary.uploader.destroy(
            `${folder}/${filename}`,
            {
                resource_type: "image",
                invalidate: true,
            }
        );

        // Checking whether image is uploaded on cloudinary or not
        // If not uploaded then throw error
        if (response.result !== 'ok') {
            throw new Error("File not deleted from cloud")
        }

        return response

    } catch (error) {
        console.log(error?.message)
    }
}

export {
    uploadOnCloudinary,
    deleteFromCloudinary
}