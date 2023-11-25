// require('dotenv').config({path : './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
const PORT = process.env.PORT || 8000;
dotenv.config({
    path: "./.env",
});


connectDB()
    .then(() => {
        app.listen(PORT || 8000,()=>{
            console.log(`server is running at port : https://localhost:${PORT}`);
        })
    })
    .catch((error) => {
        console.log("MONGO db connection failed!!!", error);
    });
