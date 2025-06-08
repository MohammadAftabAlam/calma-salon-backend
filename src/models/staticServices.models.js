import mongoose, { mongo } from "mongoose";

const staticServiceSchema = new mongoose.Schema(
    {
        serviceImageUrl: {
            type: String,
            required: true,
        },
        serviceName: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ["men", "women"],
            required: true,
        },
        priority: {
            type: Number,
            required: true,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        },
    },
    { timestamps: true }
);

const StaticServices = mongoose.model("StaticServices", staticServiceSchema)

export default StaticServices