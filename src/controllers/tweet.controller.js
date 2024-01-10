import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { asynchandler } from "../utils/asyncHamdler.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { ApiError } from "../utils/ApiError.js";

const createTweet = asynchandler(async (req, res) => {
    //TODO: create tweet
});

const getUserTweets = asynchandler(async (req, res) => {
    // TODO: get user tweets
});

const updateTweet = asynchandler(async (req, res) => {
    //TODO: update tweet
});

const deleteTweet = asynchandler(async (req, res) => {
    //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
