import mongoose from "mongoose"

const serviceSchema = new mongoose.Schema(
    {
        salonId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Salon"
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            default: 0
        },

        duration: {
            type: Number, 
            required: true
        },

        description: {
            type: String,
            trim: true
        },

        isActive: {
            type: Boolean, 
            default: true,
            required: true
        },
        
        category: {
            type: String,
            enum: ["men", "women"],
            trim: true
        }          
    }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;