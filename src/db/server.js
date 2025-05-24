import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(connectionInstance.connection.host)
        console.log(`DB NAME: ${process.env.MONGODB_URI}`)
    } catch (error) {
        // console.log("Catching error")
        console.log(error);
    }
}

export default connectDb