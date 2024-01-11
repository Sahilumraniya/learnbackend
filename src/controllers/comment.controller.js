import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { asynchandler } from "../utils/asyncHamdler.js";

const getVideoComments = asynchandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    // console.log(limitNumber);
    // Validate if page and limit are valid numbers
    if (
        isNaN(pageNumber) ||
        isNaN(limitNumber) ||
        pageNumber < 1 ||
        limitNumber < 1
    ) {
        throw new ApiError(400, "page & limit not exist");
    }
    const comments = await Comment.aggregatePaginate(
        [
            {
                $match: {
                    video: videoId,
                },
            },
            {
                $sort: {
                    totalComments: -1,
                },
            },
        ],
        { page: pageNumber, limit: limitNumber }
    );
    if (!comments) {
        throw new ApiError(500, "faild to fetch comments");
    }
    res.status(200).json(
        new ApiResponse(200, comments, "comments fetched succesfully")
    );
});

const addComment = asynchandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;
    const user = req.user;
    if (!content) {
        throw new ApiError(400, "content is required");
    }
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: user._id,
    });
    if (!comment) {
        throw new ApiError(500, "comment is not done yet in database");
    }
    res.status(200).json(
        new ApiResponse(200, comment, "comment done successfully")
    );
});

const updateComment = asynchandler(async (req, res) => {
    // TODO: update a comment
    const content = req.body.content;
    const { commentId } = req.params;
    if (!content) {
        throw new ApiError(400, "content is required");
    }
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content,
            },
        },
        { new: true }
    );
    if (!updatedComment) {
        throw ApiError(500, "comment is not updated");
    }
    res.status(200).json(
        new ApiResponse(200, updatedComment, "comment is updated")
    );
});

const deleteComment = asynchandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;
    if (!commentId) {
        throw new ApiError(400, "commentId is required");
    }
    const deletedcomment = await Comment.findOneAndDelete(commentId);
    if (!deletedcomment) {
        throw new ApiError(500, "comment is not deleted");
    }
    res.status(200).json(
        new ApiResponse(200, deletedcomment, "comment deleted successfully")
    );
});

export { getVideoComments, addComment, updateComment, deleteComment };
