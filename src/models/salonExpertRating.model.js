import mongoose from 'mongoose';

const salonExpertRatingSchmea = mongoose.Schema({

    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true,
    },

    salonExpert: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SalonExpert',
        required: true,
    },

    givenRating: {
        type: Number,
        default: 0,
        min: 1,
        max: 5,
        required: true,
    },

    ratedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const SalonExpertRating = new mongoose.model("SalonExpertRating", salonExpertRatingSchmea)

export default SalonExpertRating;