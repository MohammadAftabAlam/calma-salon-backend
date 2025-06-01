import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';

import userRouter from './routes/user.routes.js';
import staticImagesRouter from './routes/staticImages.routes.js'

const app = express();

// app.get("/aftab", (req, res) => {
//     res.send("hello")
// }).on("error", (error) => {
//     console.log(error)
// })


// Whitewashing request address from frontend 
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
        // optionsSuccessStatus: 200
    })
);

// cookie-parser is used to send data in form of cookie
app.use(cookieParser())

app.use(express.json({ limit: "16kb" }))

//recieving data from url
app.use(express.urlencoded({ extended: true, limit: "10kb"}))

// user api link
app.use("/api/v1/user", userRouter)
app.use("/api/v1/staticServices", staticImagesRouter)


export default app