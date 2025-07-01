import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./database/connectDb.js";
import cookieParser from "cookie-parser";

dotenv.config({ path: ".env" });

const corsOptions = {
    origin: process.env.CORS,
    optionsSuccessStatus: 200,
    credentials: true
};

const app = express();
app.use(cors(corsOptions));
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())
app.use(cookieParser())

app.use("/", (req, res) => {
    res.send("hello");
});

(async () => {
    const connection = await connectDb();
    if (connection) {
        console.log(`Connected to dicode Database with`, connection.connection.host);
        app.listen(process.env.PORT, () => {
            console.log(`server is listening on port ${process.env.PORT}`);
        });
    }
})();
