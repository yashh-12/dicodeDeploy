import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./database/connectDb.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "http"
import cookie from "cookie";
import jwt from "jsonwebtoken"
import userRouter from "./routes/user.routes.js";
import roomRouter from "./routes/room.routes.js";
import livekitRouter from "./routes/livekit.routes.js";
import friendshipRouter from "./routes/friendship.routes.js";
import apiResponse from "./utils/apiResponse.js";
import isAuthenticated from "./middlewares/authMid.js";
import chatRouter from "./routes/chat.routes.js";
import { getRoomDetails } from "./controller/room.controller.js";
import Room from "./models/room.model.js";
import User from "./models/user.model.js";

dotenv.config({ path: ".env" });

const app = express();
const http = createServer();
const server = new Server(http, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

const socketHashMap = {};

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
app.use("/api/rooms", isAuthenticated, roomRouter);
app.use("/api/friends", isAuthenticated, friendshipRouter);
app.use("/api/chats", isAuthenticated, chatRouter);
app.use("/api/livekit", isAuthenticated, livekitRouter);


server.use((socket, next) => {
    const rawCookie = socket.handshake.headers.cookie;
    if (!rawCookie) {
        return next(new Error("No cookie provided"));
    }

    const parsed = cookie.parse(rawCookie);
    const token = parsed.accessToken;

    if (!token) {
        return next(new Error("No access token"));
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        socket.user = decoded;
        next();
    } catch (err) {
        console.error("JWT Error:", err.message);
        return next(new Error("Invalid token"));
    }
});

server.on("connection", (socket) => {
    // console.log("Connected to server via socket:", socket.id);
    // console.log("Authenticated user:", socket.user);

    socket.on("register", ({ roomId }) => {
        socketHashMap[socket.user.id] = {
            socketId: socket.id,
            roomId,
        };
    });

    socket.on("join-req", async ({ roomId }) => {
        try {
            const room = await Room.findById(roomId).populate("members.user");
            if (!room) return;

            const creatorId = room.creator.toString();
            const currentUserId = socket.user.id;

            const isMember = room.members.some(member =>
                member.user._id.toString() === currentUserId
            );

            if (creatorId === currentUserId || isMember) {

                console.log("this rannnnnn ");

                const userData = await User.findById(currentUserId).select("-password -refreshToken -accessToken");

                socket.join(roomId);

                server.to(roomId).emit("joined-room", { user: userData });

                return;
            }

            const creatorSocketId = socketHashMap[creatorId]?.socketId;

            if (creatorSocketId) {
                const userData = await User.findById(currentUserId).select("-password -refreshToken -accessToken");

                socket.to(creatorSocketId).emit("give-req", { userData });

                // console.log(`Join request from ${currentUserId} sent to room creator ${creatorId}`);
            } else {
                // console.log("Creator not connected or not found in socketHashMap");
                socket.emit("no-host", {});
            }

        } catch (err) {
            // console.error("Error handling join-req:", err.message);
        }
    });

    socket.on("kick-room", async ({ userId }) => {
        const loggedInUser = socket.user;

        try {
            const socketDetails = socketHashMap[loggedInUser.id];
            if (!socketDetails || !socketDetails.roomId) return;

            const room = await Room.findById(socketDetails.roomId);

            if (room.creator.toString() !== loggedInUser.id.toString()) return;

            room.members = room.members.filter(member => member.user.toString() !== userId.toString());

            await room.save();

            const userToBeKicked = socketHashMap[userId];

            server.to(userToBeKicked?.socketId).emit("navigate-room", {})

            const kickedSocket = Object.entries(socketHashMap).find(([_, value]) => value.userId === userId);
            if (kickedSocket) {
                const kickedSocketId = kickedSocket[0];
                io.to(kickedSocketId).emit("kicked", { roomId: room._id });
            }

            socket.to(socketDetails.roomId).emit("room-updated", { userId });

        } catch (error) {
            console.error("Error kicking user from room:", error);
        }
    });

    socket.on("join-room", async ({ roomId, user }) => {
        try {

            const room = await Room.findById(roomId)
            if (!room) {
                return;
            }

            const isAlreadyMember = room.members.some(
                (member) => member.user._id.toString() === user._id
            );

            if (!isAlreadyMember) {
                room.members.push({
                    user: user._id,
                    role: "viewer",
                });
                await room.save();
                console.log(`Added new member ${user._id} to room ${roomId}`);
            } else {
                console.log(`User ${user._id} is already a member of room ${roomId}`);
            }

            const userData = await User.findById(user._id).select("-password -refreshToken -accessToken");

            if (!userData) {
                console.log("No user found in DB");
                return;
            }

            console.log("userData ", userData);

            const socketDetails = socketHashMap[userData._id];


            socket.to(socketDetails?.socketId).emit("joine-room", { user: userData });
            server.to(roomId).emit("joined-room", { user: userData });

        } catch (err) {
            console.error("Failed to process join-room:", err.message);
        }
    });

    socket.on("code-change", ({ changes }) => {
        const user = socket.user;
        const socketDetails = socketHashMap[user.id]
        socket.to(socketDetails.roomId).emit("incomming-code-change", { changes })
    })

    socket.on("add-node", ({ node }) => {
        const user = socket?.user;
        const socketDetails = socketHashMap[user.id]
        socket.to(socketDetails?.roomId).emit("node-added", { node })
    })

    socket.on("delete-node", ({ nodeId }) => {
        const user = socket.user;
        const socketDetails = socketHashMap[user.id]
        socket.to(socketDetails?.roomId).emit("node-deleted", { nodeId })
    })

    socket.on("rename-node", ({ nodeId, label }) => {
        const user = socket.user;
        const socketDetails = socketHashMap[user.id]
        socket.to(socketDetails?.roomId).emit("node-renamed", { nodeId, label })
    })

    socket.on("connect-nodes", ({ edge }) => {
        const user = socket.user;
        const socketDetails = socketHashMap[user.id]
        socket.to(socketDetails?.roomId).emit("edge-connected", { edge })
    })

    socket.on("delete-edge", ({ edgeId }) => {
        const user = socket.user;
        const socketDetails = socketHashMap[user.id]
        socket.to(socketDetails?.roomId).emit("edge-deleted", { edgeId })
    })

});


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
        http.listen(3000, () => {
            console.log("Socket.IO server running on http://localhost:3000");
        })
    }
})();
