import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

// Method to upload images
const uploadOnCloudinary = async (localFilePath) => {
    try {

        // file has local path or not
        if (!localFilePath) {
            throw new Error("File not found or doesn't exist")
        }

        // uploading on cloudinary
        const response = await cloudinary.uploader
            .upload(localFilePath, {
                resource_type: "auto",
            });

        // Checking whether image uploaded on cloudinary 
        if (!response) {
            throw new Error("File not uploaded")
        }

        // returning response
        return response
    } catch (error) {
        console.log(error.message)
    }
}

export { uploadOnCloudinary }
