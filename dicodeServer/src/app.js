import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./database/connectDb.js";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user.routes.js";
import roomRouter from "./routes/room.routes.js";
import livekitRouter from "./routes/livekit.routes.js";
import friendshipRouter from "./routes/friendship.routes.js";
import apiResponse from "./utils/apiResponse.js";
import isAuthenticated from "./middlewares/authMid.js";
import chatRouter from "./routes/chat.routes.js";

dotenv.config({ path: ".env" });

const app = express();

const corsOptions = {
    origin: process.env.CORS,
    optionsSuccessStatus: 200,
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/users", userRouter);
app.use("/api/rooms",isAuthenticated, roomRouter);
app.use("/api/friends",isAuthenticated, friendshipRouter);
app.use("/api/chats",isAuthenticated, chatRouter);
app.use("/api/livekit",isAuthenticated, livekitRouter);

app.use("/", (req, res) => {
    res.status(404).json(new apiResponse(404, {}, "Page is missing"))
});

(async () => {
    const connection = await connectDb();
    if (connection) {
        console.log(" Connected to MongoDB:", connection.connection.host);
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server running on http://localhost:${process.env.PORT}`);
        });
    }
})();
