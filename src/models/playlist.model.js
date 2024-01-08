import mongoose, { Schema } from "mongoose";

const playListSchema = new Schema(
    {
        name: {
            type: String,
            require: true,
        },
        description: {
            type: String,
            require: true,
        },
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
    },
    { timestamps: true }
);

export const Playlist = mongoose.model("Playlist", playListSchema);
