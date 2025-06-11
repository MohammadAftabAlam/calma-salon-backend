import mongoose from "mongoose";

const salonExpertSchema = new mongoose.Schema(
    {
        salonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Salon"
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        avatar: {
            type: String,       // cloudinary url
            required: true
        },

        services: [{
            type: String,
            trim: true,
            required: true,
        }],

        experience: {
            type: Number,
        },

        rating: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExpertRating",
        }
    },
    { timestamps: true }
);

const SalonExpert = mongoose.model("SalonExpert", salonExpertSchema)
export default SalonExpert