import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
    getAccessToken,
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

export default router;
