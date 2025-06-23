import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Salon",
        required: true,
    },

    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
    },

    salonExpertId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SalonExpert", 
    },

    date: {
        type: Date,
        required: true,
    },

    timeSlot: {
        type: String, 
        required: true,
    },

    isConfirmed : {
        type: Boolean,
        default: false,
        required: true
    },

    status: {
        type: String,
        enum: ["upcoming", "cancelled", "completed"],
        default: "upcoming"
    }
});
  

const Appointments = mongoose.model("Appointments", appointmentSchema)
export default Appointments