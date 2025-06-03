import mongoose, { mongo } from 'mongoose';

const salonRatingSchmea = mongoose.Schema({
    salonRated: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon'
    },
    givenRating: {
        type: Number,
        default: 0,
        min: 1,
        max: 5,
    },
    ratedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});

const SalonRating = new mongoose.model("SalonRating", salonRatingSchmea)

export default SalonRating;