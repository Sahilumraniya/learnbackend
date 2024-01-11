import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import {
    uploadOnCloudinary,
    updateOnCloudinary,
    deleteOnCloudinary,
} from "../utils/cloudinary.js";
import { asynchandler } from "../utils/asyncHamdler.js";

const getAllVideos = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
    // const videoAgragate = Video.aggregate();
    // Video.aggregatePaginate()
});

const publishAVideo = asynchandler(async (req, res) => {
    const { title, description } = req.body;
    // TODO: get video, upload to cloudinary, create video
    if (
        [title, description].some((v) => {
            return v?.trim() === "";
        })
    ) {
        throw new ApiError(400, "video.controller:: All field is required");
    }
    const videoLocalFile = req.files?.videoFile[0].path;
    if (!videoLocalFile) {
        throw new ApiError(400, "video.controller:: Video File is required");
    }
    const videoFile = await uploadOnCloudinary(videoLocalFile);
    // console.log("Video File : ",videoFile);
    const thumbnailLocalFile = req.files?.thumbnail[0].path;
    if (!thumbnailLocalFile) {
        throw new ApiError(
            400,
            "video.controller:: thumbnail File is required"
        );
    }
    const user = req.user;
    if (!user) {
        throw new ApiError(404, "video.controller:: User not found");
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalFile);
    const video = await Video.create({
        title,
        description,
        thumbnail: thumbnail.url,
        videoFile: videoFile.url,
        duration: Math.floor(videoFile.duration),
        owner: user._id,
    });
    if (!video) {
        throw new ApiError(500, "video.controller:: faild to upload videos");
    }
    res.status(200).json(
        new ApiResponse(200, video, "video ulpoaded successfully")
    );
});

const getVideoById = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id
    if (!videoId) {
        throw new ApiError(400, "video id is not available");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(500, "video not found");
    }
    if (!video.isPublished) {
        throw new ApiError(404, "video is not published yet");
    }
    // increase views when some other hit this api
    // console.log("User Id : ", req.user?._id.toString());
    // console.log("Owner Id : ", video.owner.toString());
    // if (req.user?._id.toString() === video.owner.toString()) {
    //     console.log("Hey");
    // }
    if (req.user?._id.toString() !== video.owner.toString()) {
        video.views = video.views + 1;
        await video.save({ validateBeforeSave: true });
    }
    // put in user's watch histrory
    await User.findByIdAndUpdate(req.user._id, {
        $addToSet: {
            watchHistory: videoId,
        },
    });
    res.status(200).json(new ApiResponse(200, video, "video fetched"));
});

const updateVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail
    if (!videoId) {
        throw new ApiError(400, "video id is not available");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(500, "video not found");
    }
    const { title, description } = req.body;
    video.title = title?.trim() === "" ? video.title : title.trim();
    video.description =
        description?.trim() === "" ? video.description : description?.trim();
    const thumbnailLocalFile = req.file?.path;
    console.log(thumbnailLocalFile);
    let thumbnail = null;
    if (thumbnailLocalFile) {
        thumbnail = await updateOnCloudinary(
            thumbnailLocalFile,
            video.thumbnail
        );
        // console.log(thumbnail);
        if (!thumbnail) {
            throw new ApiError(500, "Faild to upload thumbnail");
        }
    }
    let updatedVideo;
    if (thumbnail) {
        updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    title,
                    description,
                    thumbnail: thumbnail.url,
                },
            },
            { new: true }
        );
    } else {
        updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    title,
                    description,
                },
            },
            { new: true }
        );
    }
    if (!updatedVideo) {
        throw new ApiError(500, "Video does not deleted");
    }
    res.status(200).json(
        new ApiResponse(200, updatedVideo, "video updated successfuly")
    );
});

const deleteVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
    if (!videoId) {
        throw new ApiError(400, "video id is not available");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(500, "video not found");
    }
    await deleteOnCloudinary(video.videoFile, true);
    await deleteOnCloudinary(video.thumbnail);
    const isDeleted = await Video.findByIdAndDelete(videoId);
    if (!isDeleted) {
        throw new ApiError(500, "video does not deleted");
    }
    res.status(200).json(
        new ApiResponse(200, isDeleted, "Video deleted successfluy")
    );
});

const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "video id is not available");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(500, "video not found");
    }
    const toggleVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished,
            },
        },
        { new: true }
    );
    if (!toggleVideo) {
        throw new ApiError(500, "Video not toggle yet");
    }
    res.status(200).json(
        new ApiResponse(200, toggleVideo, "Video isPublish toggle")
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
