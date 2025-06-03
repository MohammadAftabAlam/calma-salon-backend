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

                function (res) { console.log(res); },
            );

        // Checking whether image uploaded on cloudinary 
        if (!response) {
            throw new Error("File not uploaded")
        }

        fs.unlinkSync(localFilePath);
        // returning response
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log(error.message)
    }
}

export { uploadOnCloudinary }
