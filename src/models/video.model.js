import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile: {
        type: String, //cloudinary url
        require: true,
    },
    thumbnail: {
        type: String, //cloudinary url
        require: true,
    },
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    duration: {
        type: Number, // get from cloudinary
        require: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

videoSchema.plugin(mongooseAggregatePaginate); // pagination

export const Video = mongoose.model("Video", videoSchema);
