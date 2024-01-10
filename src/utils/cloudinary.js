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
        // console.log("Cloudinary :: ", localFilePath);
        const fileRespones = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        // console.log("File is Uploaded on Cloudinary", fileRespones.url);
        if (!fileRespones) {
            throw Error("File not uploaded");
        }
        fs.unlinkSync(localFilePath);
        return fileRespones;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
};

const deleteOnCloudinary = async (cloudinaryUrl, isVideo = false) => {
    try {
        if (!cloudinaryUrl) return;
        const pubilcId = cloudinaryUrl
            .split("/")
            [cloudinaryUrl.split("/").length - 1].split(".")[0];
        let deleteRespones = null;
        console.log("Public Id : ", pubilcId);
        if (isVideo) {
            deleteRespones = await cloudinary.api.delete_resources(pubilcId, {
                resource_type: "video",
            });
        } else {
            deleteRespones = await cloudinary.api.delete_resources(pubilcId);
        }
        console.log(deleteRespones);
        if (!deleteRespones) {
            throw Error("Faild to delete file on cloudinary");
        }
    } catch (error) {
        console.log("Faild to delete file on cloudinary");
        return null;
    }
};

const updateOnCloudinary = async (localFilePath, cloudinaryUrl) => {
    try {
        const upload = await uploadOnCloudinary(localFilePath);
        if (!upload) {
            throw Error("File not uploaded");
        }
        await deleteOnCloudinary(cloudinaryUrl);
        // console.log("UploadOnCloud:: ",upload);
        return upload;
    } catch (error) {
        console.log("Faild to update file on cloudinary");
        return null;
    }
};

export { uploadOnCloudinary, updateOnCloudinary, deleteOnCloudinary };
