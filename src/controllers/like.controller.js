import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { asynchandler } from "../utils/asyncHamdler.js";

const toggleVideoLike = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: toggle like on video
    if (!videoId) {
        throw new ApiError(400, "Video id is not present");
    }
    let isLike = await Like.findOne({ video: videoId });
    if (isLike) {
        isLike.video = undefined;
        await isLike.save();
    } else {
        isLike = await Like.create({
            video: videoId,
            likeBy: req?.user?._id,
        });
    }
    res.status(200).json(new ApiResponse(200, isLike, "video liked"));
});

const toggleCommentLike = asynchandler(async (req, res) => {
    const { commentId } = req.params;
    //TODO: toggle like on comment
    if (!commentId) {
        throw new ApiError(400, "comment id is not present");
    }
    let isLike = await Like.findOne({ comment: commentId });
    if (isLike) {
        isLike.comment = undefined;
        await isLike.save();
    } else {
        isLike = await Like.create({
            comment: commentId,
            likeBy: req?.user?._id,
        });
    }
    res.status(200).json(new ApiResponse(200, isLike, "comment liked"));
});

const toggleTweetLike = asynchandler(async (req, res) => {
    const { tweetId } = req.params;
    //TODO: toggle like on tweet
    if (!tweetId) {
        throw new ApiError(400, "tweet id is not present");
    }
    let isLike = await Like.findOne({ tweet: tweetId });
    if (isLike) {
        isLike.tweet = undefined;
        await isLike.save();
    } else {
        isLike = await Like.create({
            tweet: tweetId,
            likeBy: req?.user?._id,
        });
    }
    res.status(200).json(new ApiResponse(200, isLike, "tweet liked"));
});

const getLikedVideos = asynchandler(async (req, res) => {
    //TODO: get all liked videos
    const likes = await Like.find();
    res.status(200).json(new ApiResponse(200, likes, "fetched all likes"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
