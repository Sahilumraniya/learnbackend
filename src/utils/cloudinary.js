import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    //TODO : finally
    try {
        if (!localFilePath) return;
        console.log("Cloudinary :: ", localFilePath);
        const fileRespones = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        // console.log("File is Uploaded on Cloudinary", fileRespones.url);
        if(!fileRespones){
            throw Error("File not uploaded");
        }
        fs.unlinkSync(localFilePath);
        return fileRespones;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export { uploadOnCloudinary };
