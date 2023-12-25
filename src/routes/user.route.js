import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
    getAccessToken,
    updatePassword,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getCurrentUser,
    getChannelProfile,
    getWatchHistory,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authValidate } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    // for diff field file
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

router.route("/login").post(loginUser);

// secure routes
router.route("/logout").post(authValidate, logoutUser);
router.route("/refersh_token").post(getAccessToken);
router.route("/cuurent-user").get(authValidate, getCurrentUser);
router.route("/update-password").post(authValidate, updatePassword);
router.route("/update-user-deatils").patch(authValidate, updateAccountDetails);

router.route("/update-avatar").patch(
    authValidate,
    upload.fields({
        name: "avatar",
        maxCount: 1,
    }),
    updateAvatar
);
router
    .route("/update-coverimg")
    .patch(authValidate, upload.single("cover"), updateCoverImage);

router.route("/channel/:username", authValidate, getChannelProfile);
router.route("/history", authValidate, getWatchHistory);

export default router;
