import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { asynchandler } from "../utils/asyncHamdler.js";
import { User } from "../models/user.model.js";

export const authValidate = asynchandler(async (req, _, next) => {
    const accessToken =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
        throw new ApiError(401, "Unauthorized access");
    }

    const decodedToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
    );
    // console.log("decodedToken :: ", decodedToken);
    const user = await User.findById(decodedToken._id).select(
        "-password -refreshToken"
    );
    // console.log("user :: ", user);

    if (!user) {
        throw new ApiError(401, "Invaild Access Token");
    }
    req.user = user;
    next();
});
