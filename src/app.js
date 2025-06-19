import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';

import userRouter from './routes/user.routes.js';
import staticImagesRouter from './routes/staticServices.routes.js';

import salonRouter from './routes/salon.routes.js';
import salonServiceRouter from './routes/salonService.route.js';
import serviceFilterRouter from './routes/salonServiceFilter.routes.js';
import salonExpertRouter from './routes/salonExpert.routes.js'
import nearestSalonRouter from './routes/nearestSalon.routes.js'

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
app.use(express.urlencoded({ extended: true, limit: "10kb" }))

// user api link
app.use("/api/v1/user", userRouter)
app.use("/api/v1/staticServices", staticImagesRouter)

// salon api link
app.use("/api/v1/salon", salonRouter)
app.use("/api/v1/salon/1", salonExpertRouter)
app.use("/api/v1/services", salonServiceRouter)
app.use("/api/v1/services/filter", serviceFilterRouter)

app.use("/api/v1/nearestSalon", nearestSalonRouter)

export default app