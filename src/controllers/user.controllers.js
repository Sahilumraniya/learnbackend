import { asynchandler } from "../utils/asyncHamdler.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { User } from "../models/user.model.js";
import { updateOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const generateAccessAndRefereshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: true }); // validateBeforeSave is used to skip validate the user model before saving
        // console.log("G: accessToken :: ", accessToken);
        // console.log("G: refreshToken :: ", refreshToken);
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "something went wrong while generathing tokens"
        );
    }
};

const registerUser = asynchandler(async (req, res) => {
    const { fullName, username, email, password } = req.body;
    // console.log("email : ", email);

    if (
        [fullName, username, email, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const isUserExist = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (isUserExist) {
        throw new ApiError(409, "User with username or email alrady exists");
    }

    // console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatarLocalPath :: avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    //console.log("Avatar :: ", avatar);
    //console.log("coverImage :: ", coverImage);
    if (!avatar) {
        throw new ApiError(400, "after :: avatar image is required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createUser) {
        throw new ApiError(500, "Somting went worng");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createUser, "User created successfully"));
});

const loginUser = asynchandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new ApiError(401, "username or email required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "user does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshToken(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const cookieOption = {
        httpOnly: true,
        secure: true,
    };

    // console.log("accessToken :: ", accessToken);
    // console.log("refreshToken :: ", refreshToken);

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "Login success"
            )
        );
});

const logoutUser = asynchandler(async (req, res) => {
    const { user } = req;

    console.log("user :: ", user);

    await User.findByIdAndUpdate(
        user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true, // to get updated value of user
        }
    );

    const cookieOption = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .clearCookie("accessToken", cookieOption)
        .clearCookie("refreshToken", cookieOption)
        .json(new ApiResponse(200, {}, "user logged out"));
});

const getAccessToken = asynchandler(async (req, res) => {
    const incomeingRefershToken =
        req.cookie?.refreshToken || req.body.refreshToken;
    if (!incomeingRefershToken) {
        throw new ApiError(401, "Invilad refersh token");
    }
    const decodeData = await jwt.verify(
        incomeingRefershToken,
        process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodeData._id);
    if (!user) {
        throw new ApiError(500, "user not found or refresh token invaild");
    }
    if (incomeingRefershToken !== user.refreshToken) {
        throw new ApiError(402, "refersh token is not match");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefereshToken(
        decodeData._id
    );
    const cookieOption = {
        httpOnly: true,
        secure: true,
    };
    res.status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(
            new ApiResponse(
                200,
                { accessToken: accessToken, refreshToken: refreshToken },
                "Refresh token generate"
            )
        );
});

const updatePassword = asynchandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError(401, "all updates password filed must filled");
    }
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invaild password");
    }
    user.password = newPassword;
    user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password update successfully"));
});

const updateAccountDetails = asynchandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!fullName.trim() || !email.trim()) {
        throw new ApiError(400, "All fields are required");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
            },
        },
        { new: true }
    ).select("-password");
    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        );
});

const updateAvatar = asynchandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }
    /*
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const preurl = req.user?.avatar;
    // console.log(coverImage);
    await deleteOnCloudinary(preurl);
    if (!avatar.url) {
        throw new ApiError(500, "Error while uploading on avatar");
    }
    */
    const avatar = await updateOnCloudinary(avatarLocalPath, req.user?.avatar);
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { avatar: avatar.url },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "avatar image update successfully"));
});

const updateCoverImage = asynchandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing");
    }
    console.log(coverImageLocalPath);
    /*
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    const preurl = req.user?.coverImage;
    // console.log(coverImage);
    await deleteOnCloudinary(preurl);
    if (!coverImage.url) {
        throw new ApiError(500, "Error while uploading cover image");
    }
    */
    const coverImage = await updateOnCloudinary(
        coverImageLocalPath,
        req.user?.coverImage
    );
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url,
            },
        },
        { new: true }
    ).select("-password");
    return res
        .status(200)
        .json(new ApiResponse(200, user, "cover image update successfully"));
});

const getCurrentUser = asynchandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const getChannelProfile = asynchandler(async (req, res) => {
    const { username } = req.params;

    if (!username.trim()) {
        throw new ApiError(400, "username requied");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                    then: true,
                    else: false,
                },
            },
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            },
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "User channel fetched successfully"
            )
        );
});

const getWatchHistory = asynchandler(async (req, res) => {
    const user = User.aggregate([
        {
            $match: mongoose.Types.ObjectId(req.user?._id),
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch history fetched successfully"
            )
        );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    getAccessToken,
    updatePassword,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getCurrentUser,
    getChannelProfile,
    getWatchHistory,
};
