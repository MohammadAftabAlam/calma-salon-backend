import mongoose, { mongo } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const salonReviewsSchema = new mongoose.Schema({
    review: {
        type: String,
        validate: {
            validator: function (value) {
                const wordCount = value.trim().split(/\s+/).length;
                return wordCount <= 50;
            },
            message: "Review must be 50 words or less"
          },
        required: true
    },
    salonReviewed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Salon",
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
});

salonReviewsSchema.plugin(mongooseAggregatePaginate)
const SalonReview = new mongoose.model("SalonReview", salonReviewsSchema);

export default SalonReview;