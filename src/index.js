import dotenv from "dotenv";
import app from "./app.js"

import connectDb from "./db/server.js";

dotenv.config({ path: './.env' })

connectDb()
    .then(() => {
        app.on("error", (error) => { console.log("Error: ", error) });
        const a = app.listen(process.env.PORT || 8000, () => {
            console.log("Server is running at PORT: ", process.env.PORT);
        })
    })
    .catch((error) => {
        console.log("Database Connection failed\nError Message: ", error);
    });
