import mongoose from "mongoose";
import Jwt from "jsonwebtoken";
import bctypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        userSchema: {
            type: String,
            lowecase: true,
            require: true,
            unqiue: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            lowecase: true,
            require: true,
            unqiue: true,
            trim: true,
        },
        fullName: {
            type: String,
            require: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, // cloudinary url
            require: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        password: {
            type: String,
            require: [true, "password is required!"],
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bctypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bctypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return Jwt.sign(
        {
            _id: this._id,
            emial: this.email,
            usernaame: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return Jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);
