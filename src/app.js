import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// all middlewares of express js or third party libary
app.use(
    cors({
        origin: process.env.CORS_ORIGIN, // all frontend uri for resoure sharing :: * for all
    })
);
app.use(
    express.json({
        limit: "16kb",
    })
);
app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb",
    })
);
app.use(express.static("public"));
app.use(cookieParser());

//API end-points createtion
//import all router
import userRouter from "./routes/user.route.js";

//royter delecation
app.use("/api/v1/users", userRouter);

export default app;
