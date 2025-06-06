import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const salonSchema = new mongoose.Schema(
    {
        salonName: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            index: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        services: {
            type: [
                {
                    serviceName: {
                        type: String,
                        required: true,
                        trim: true,
                    },
                    servicePrice: {
                        type: Number,
                        required: true,
                        default: 0
                    }
                }
            ],
        },
        salonImage: {
            type: String,     // cloudinary image url
            required: true
        },
        description: {
            type: String,
            required: true
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            },
        },

        yearOfExperience: {
            type: String,
            required: true,
        },
        openingTime: {
            type: Date,
            required: true,

        },
        closingTime: {
            type: Date,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        reviews: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SaloReview",
        },

        rating: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SalonRating",
            min: 1,
            max: 5,
        },

        refreshToken: {
            type: String,
        }
    },
    { timestamps: true }
);


salonSchema.pre("save", async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
    next();
})

salonSchema.methods.isSalonPasswordCorrect = async function (password) {
    console.log(`from salonModel.js Password: ${this.password}`);
    return await bcrypt.compare(password, this.password)
}

salonSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        tokenType: "access",
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}

salonSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
        tokenType: "refresh",
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }

    )
}

salonSchema.index({ 'location': '2dsphere' })

// it returns paginated results for aggregate queries
salonSchema.plugin(mongooseAggregatePaginate);

const Salon = mongoose.model("Salon", salonSchema);
export default Salon;

// export default (db) => db.model('Salon', salonSchema);