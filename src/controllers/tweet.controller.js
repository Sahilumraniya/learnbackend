import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { asynchandler } from "../utils/asyncHamdler.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { ApiError } from "../utils/ApiError.js";

const createTweet = asynchandler(async (req, res) => {
    const { content } = req.body;
    if (content.trim() === "" || content === null) {
        throw new ApiError(400, "please provide tweet's content");
    }
    const owner = req.user._id;
    const tweet = await Tweet.create({
        owner,
        content,
    });
    if (!tweet) {
        throw new ApiError(500, "tweet does not save yet");
    }
    res.status(200).json(
        new ApiResponse(200, tweet, "tweet successfully create")
    );
});

const getUserTweets = asynchandler(async (req, res) => {
    const { userId } = req.params;
    if (userId.trim() === "" || userId === null) {
        throw new ApiError(400, "please provide tweet's userId");
    }
    const tweet = await Tweet.find({
        owner: userId,
    });
    if (!tweet) {
        throw new ApiError(400, "tweet not found");
    }
    res.status(200).json(
        new ApiResponse(200, tweet, "tweet fetched successfuly")
    );
});

const updateTweet = asynchandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    if (tweetId.trim() === "" || tweetId === null) {
        throw new ApiError(400, "please provide tweet's tweetId");
    }
    if (content.trim() === "" || content === null) {
        throw new ApiError(400, "please provide tweet's content");
    }
    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content,
            },
        },
        { new: true }
    );
    if (!tweet) {
        throw new ApiError(400, "tweet not found");
    }
    res.status(200).json(new ApiResponse(200, tweet, "tweet is updated"));
});

const deleteTweet = asynchandler(async (req, res) => {
    const { tweetId } = req.params;
    if (tweetId.trim() === "" || tweetId === null) {
        throw new ApiError(400, "please provide tweet's tweetId");
    }
    const tweet = await Tweet.findByIdAndDelete(tweetId);
    if (!tweet) {
        throw new ApiError(400, "tweet not found");
    }
    res.status(200).json(
        new ApiResponse(200, tweet, "tweet is deleted successfully")
    );
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
