import cors from 'cors';
import express from 'express';
import userRouter from './routes/user.routes.js';

const app = express();
// app.listen(process.env.PORT)
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

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true }))

app.use("/api/v1/user", userRouter)


export default app