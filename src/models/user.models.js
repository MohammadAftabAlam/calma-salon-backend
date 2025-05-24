import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            lowercase: true
        },
        age: {
            type: Number,
            required: true
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
            // match: '/^[0-9]{10}$/',
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            // match: `/^(?=.*[a/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/`
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
        _id: this._id
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
            _id: this._id
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