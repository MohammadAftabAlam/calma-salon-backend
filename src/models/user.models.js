import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        age: {
            type: Number,
            required: true,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        },

        gender: {
            type: String,
            enum: ['Male', 'Female'],
            default: 'Male',
            required: true
        },

        phoneNumber: {
            type: String,
            required: true,
            uniqe: true,
            // match: '/^[0-9]{10}$/',
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        avatarImage: {
            type: String,       // cloudinary url
            required: true,
        },

        isDefaultAvatarImage: {
            type: Boolean,
            default: true
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

        password: {
            type: String,
            required: true,
            // match: `/^(?=.*[a/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/`
        },

        fullAddress: {
            type: String,
        },

        refreshToken: {
            type: String,
        }

    },
    { timestamps: true }
);

// Hashing user password and saving inside the database
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
    next();
});

// Writing methods to check the password
userSchema.methods.isPasswordCorrect = async function (password) {
    // returning ture or false
    return await bcrypt.compare(password, this.password)
}

// Generating Refresh Token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
        tokenType: 'refresh',
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        },
    )
}

//Generating Access Token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            tokenType: 'access'
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// creating model of the collection
const User = mongoose.model("User", userSchema);

// Exporting model User
export default User
// export default (db) => db.model("User", userSchema);