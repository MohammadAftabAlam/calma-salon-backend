import mongoose from "mongoose";
import { DB_NAME, SALON_DB_NAME } from "../constant.js";

const connectDb = async () => {
    try {
        // const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        userDb = mongoose.createConnection(`${process.env.MONGODB_URI}/${DB_NAME}`).asPromise();
        salonDb = mongoose.createConnection(`${process.env.MONGODB_URI}/${SALON_DB_NAME}`).asPromise();


        // console.log(connectionInstance.connection.host)
        console.log(`DB NAME: ${process.env.MONGODB_URI}`)
        console.log(`User DB Name: ${DB_NAME}`);
        console.log(`Salon DB Name: ${SALON_DB_NAME}`);
        console.log(`userDb connected successfully ${userDb.host}`);
        console.log(`salonDb connected successfully ${salonDb.host}`);

    } catch (error) {
        // console.log("Catching error")
        console.log(error);
    }
}

export { connectDb, userDb, salonDb }