import mongoose, { mongo } from "mongoose";

const serviceSchema = new mongoose.Schema(
    {
        imageUrl: {
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

const Services = mongoose.model("Services", serviceSchema)

export default Services