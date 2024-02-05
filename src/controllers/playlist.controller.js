import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { asynchandler } from "../utils/asyncHamdler.js";

//TODO: add video playlist promblem

const createPlaylist = asynchandler(async (req, res) => {
    const { name, description } = req.body;
    //TODO: create playlist
    if (!name || !description) {
        throw new ApiError(400, "playlist name & description not found");
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    });
    if (!playlist) {
        throw new ApiError(500, "playlist not created");
    }
    res.status(200).json(
        new ApiResponse(200, playlist, "playlist created successfully")
    );
});

const getUserPlaylists = asynchandler(async (req, res) => {
    const { userId } = req.params;
    //TODO: get user playlists
    if (!userId) {
        throw new ApiError(400, "user id is not define");
    }
    const playlists = await Playlist.find({ owner: userId });
    if (!playlists) {
        throw new ApiError(500, "user playlists not fetched");
    }
    res.status(201).json(
        new ApiResponse(201, playlists, "user's playlists fetched successfully")
    );
});

const getPlaylistById = asynchandler(async (req, res) => {
    const { playlistId } = req.params;
    //TODO: get playlist by id
    if (!playlistId) {
        throw new ApiError(400, "playlist id is not define");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(500, "playlist not fetched");
    }
    res.status(200).json(
        new ApiResponse(200, playlist, "playlist fetched successfully")
    );
});

const addVideoToPlaylist = asynchandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlist id or video id is not define");
    }
    //cheack video already added
    let videos = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId),
            },
        },
        {
            $project: {
                _id: 0,
                videos: 1,
            },
        },
    ]);
    videos = videos[0].videos;
    // console.log("Video :: ", videos);
    // if (videos) {
    //     console.log("Video is empty");
    // }
    if (videos) {
        const v = videos.filter((item) => item.toString() == videoId);
        // console.log("v ::", v);
        if (v.length != 0) {
            return res
                .status(200)
                .json(new ApiResponse(200, false, "video already in playlist"));
        }
    }
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                videos: videoId,
            },
        },
        { new: true }
    );
    if (!playlist) {
        throw new ApiError(500, "video not add to playlist");
    }
    res.status(200).json(
        new ApiResponse(200, playlist, "video add to playlist")
    );
});

const removeVideoFromPlaylist = asynchandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    // TODO: remove video from playlist
    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlist id or video id is not define");
    }
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId,
            },
        },
        {
            new: true,
        }
    );
    if (!playlist) {
        throw new ApiError(500, "video is not remove");
    }
    res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "video is remove from playlist successfully"
        )
    );
});

const deletePlaylist = asynchandler(async (req, res) => {
    const { playlistId } = req.params;
    // TODO: delete playlist
    if (!playlistId) {
        throw new ApiError(400, "playlist id is not define");
    }
    const playlist = await Playlist.findByIdAndDelete(playlistId);
    if (!playlist) {
        throw new ApiError(500, "playlist is not deleted");
    }
    res.status(200).json(
        new ApiResponse(200, playlist, "playlist deleted successfully")
    );
});

const updatePlaylist = asynchandler(async (req, res) => {
    const { playlistId } = req.params;
    let { name = "", description = "" } = req.body;
    //TODO: update playlist
    if (!playlistId) {
        throw new ApiError(400, "playlist id requiered");
    }
    if (!name.trim() && !description.trim()) {
        throw new ApiError(400, "name or description is requiered");
    }
    name = name.trim();
    description = description.trim();

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description,
            },
        },
        { new: true }
    );
    if (!playlist) {
        throw new ApiError(500, "playlist not updated");
    }
    res.status(200).json(
        new ApiResponse(200, playlist, "playlist updated successfully")
    );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
