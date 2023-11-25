import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.sWaKZcD8PqYUxlc_m4CjykP_B8E,
});

const uploadOnCloudinary = async (localFilePath) => {
    //TODO : finally
    try {
        if (!localFilePath) return;
        const fileRespones = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        console.log("File is Uploaded on Cloudinary", fileRespones.url);
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export { uploadOnCloudinary };
