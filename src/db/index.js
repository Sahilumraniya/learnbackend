import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        // console.dir(connectionInstance, { depth: null, colors: true }); to print connectionInstance
        console.log(`\nMongoDB connected to DB : ${connectionInstance.connection.host}`);
    }catch(error){
        console.log("MONGODB connection ERROR : ",error);
        process.exit(1);
    }
}

export default connectDB;