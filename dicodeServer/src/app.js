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
import { AccessToken } from "livekit-server-sdk";
import { RoomServiceClient } from "livekit-server-sdk";

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
const hostTimeoutMap = {};


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

const livekitClient = new RoomServiceClient(process.env.LIVEKIT_WEB_URL, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET)

server.on("connection", (socket) => {

    socket.on("register", ({ roomId }) => {
        const userId = socket.user.id;

        socketHashMap[userId] = { socketId: socket.id, roomId, userId, role: "viewer" };

        console.log("registerd ", socketHashMap[userId]);


        const timeout = hostTimeoutMap[userId];
        if (timeout) {
            clearTimeout(timeout);
            delete hostTimeoutMap[userId];
            console.log("Host reconnected in time, timer cleared");
        }
    });

    socket.on("join-req", async () => {
        try {
            const currentUserId = socket.user.id;
            const socketDetails = socketHashMap[currentUserId];
            const roomId = socketDetails?.roomId;

            if (!roomId) {
                console.error("Room ID not found for user in socketHashMap");
                return;
            }

            const room = await Room.findById(roomId).populate("members.user");
            if (!room) return;

            const creatorId = room.creator.toString();

            const isMember = room.members.some(
                (member) => member.user._id.toString() === currentUserId
            );

            if (creatorId === currentUserId || isMember) {

                if (creatorId === currentUserId) {
                    socketHashMap[currentUserId] = { ...socketDetails, role: "editor" }
                }

                const userData = await User.findById(currentUserId).select(
                    "-password -refreshToken -accessToken"
                );

                socket.join(roomId);

                const token = new AccessToken(
                    process.env.LIVEKIT_API_KEY,
                    process.env.LIVEKIT_API_SECRET,
                    {
                        identity: currentUserId,
                        name: userData.name || "Anonymous",
                        metadata: JSON.stringify({
                            avatar: userData.avatar,
                            username: userData.username,
                        }),
                    }
                );


                token.addGrant({
                    room: roomId,
                    roomJoin: true,
                    canPublish: true,
                    canSubscribe: true,
                    canPublishData: true,
                });

                const livekitToken = await token.toJwt();

                socket.emit("livekit-token", { token: livekitToken });

                server.to(roomId).emit("joined-room", { user: userData });

                return;
            }

            const creatorSocketId = socketHashMap[creatorId];

            if (creatorSocketId?.socketId && creatorSocketId?.roomId == socketDetails?.roomId) {
                const userData = await User.findById(currentUserId).select(
                    "-password -refreshToken -accessToken"
                );
                socket.to(creatorSocketId.socketId).emit("give-req", { userData });
            } else {
                socket.emit("no-host", {});
            }
        } catch (err) {
            console.error("Error handling join-req:", err.message);
            socket.emit("no-host", {});
        }
    });

    // socket.on("join-req", async () => {
    //     try {
    //         const currentUserId = socket.user.id;
    //         const socketDetails = socketHashMap[currentUserId];
    //         const roomId = socketDetails?.roomId;

    //         if (!roomId) {
    //             console.error("Room ID not found for user in socketHashMap");
    //             return;
    //         }

    //         const room = await Room.findById(roomId).populate("members.user");
    //         if (!room) return;

    //         const creatorId = room.creator.toString();

    //         const isMember = room.members.some(member =>
    //             member.user._id.toString() === currentUserId
    //         );

    //         if (creatorId === currentUserId || isMember) {
    //             const userData = await User.findById(currentUserId).select("-password -refreshToken -accessToken");

    //             socket.join(roomId);


    //             socket.emit("livekit-token",{})

    //             server.to(roomId).emit("joined-room", { user: userData });

    //             return;
    //         }

    //         const creatorSocketId = socketHashMap[creatorId];

    //         if (creatorSocketId.socketId && creatorSocketId.roomId) {

    //             const userData = await User.findById(currentUserId).select("-password -refreshToken -accessToken");
    //             socket.to(creatorSocketId?.socketId).emit("give-req", { userData });
    //         } else {
    //             socket.emit("no-host", {});
    //         }

    //     } catch (err) {
    //         console.error("Error handling join-req:", err.message);
    //         socket.emit("no-host", {});

    //     }
    // });

    socket.on("kick-room", async ({ userId }) => {
        const loggedInUser = socket.user;

        if (loggedInUser.id === userId) {
            console.warn("Creator attempted to kick themselves. Operation ignored.");
            return;
        }

        try {
            const socketDetails = socketHashMap[loggedInUser.id];
            if (!socketDetails?.roomId) return;


            const room = await Room.findById(socketDetails.roomId);
            if (!room || room.creator.toString() !== loggedInUser.id.toString()) return;

            room.members = room.members.filter(member => member.user.toString() !== userId.toString());
            await room.save();

            const userToBeKicked = socketHashMap[userId];

            if (userToBeKicked?.socketId) {
                const targetSocket = server.sockets.sockets.get(userToBeKicked.socketId);

                if (targetSocket) {
                    targetSocket.leave(room._id);
                    targetSocket.emit("navigate-room", {});
                    // targetSocket.emit("kicked", { roomId: room._id });
                }
            }

            server.to(socketDetails.roomId).emit("room-updated", { userId });

        } catch (error) {
            console.error("Error kicking user from room:", error);
        }
    });

    socket.on("join-room", async ({ user }) => {
        try {
            const userId = socket.user.id;
            const socketDetails = socketHashMap[userId];
            const roomId = socketDetails?.roomId;

            if (!roomId) {
                console.error("Room ID missing from socketHashMap");
                return;
            }

            const room = await Room.findById(roomId);
            if (!room) return;

            if (room.creator.toString() !== userId.toString()) {
                console.warn("Unauthorized attempt to add user by non-creator:", userId);
                return;
            }

            const isAlreadyMember = room.members.some(
                (member) => member.user.toString() === user._id
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
            if (!userData) return;

            const socketDetailsForSendUser = socketHashMap[userData._id];

            socket.to(socketDetailsForSendUser?.socketId).emit("joine-room", { user: userData });

            server.to(roomId).emit("joined-room", { user: userData });

        } catch (err) {
            console.error("Failed to process join-room:", err.message);
        }
    });

    socket.on("leave-room", async () => {
        try {
            const userId = socket?.user?.id;
            const socketDetails = socketHashMap[userId];
            const roomId = socketDetails?.roomId;

            const room = await Room.findById(roomId);
            if (!room) return;

            if (userId.toString() === room.creator.toString()) {
                room.members = [{
                    user: userId,
                    role: "editor"
                }];
                await room.save();

                delete socketHashMap[userId];


                server.to(roomId).emit("navigate-room", {});
                console.log(`Creator (${userId}) left, room closed.`);

                try {
                    await livekitClient.deleteRoom(roomId);

                } catch (err) {
                    console.error("room deleted participants are disconnected from LiveKit:", err);
                }

                const socketsInRoom = await server.in(roomId).fetchSockets();
                for (const s of socketsInRoom) {
                    s.leave(roomId);
                }

            } else {
                room.members = room.members.filter(member =>
                    member.user.toString() !== userId.toString()
                );
                await room.save();

                delete socketHashMap[userId];

                try {
                    await livekitClient.removeParticipant(roomId, userId)
                    console.log("participent leaved room ", socket.user.id);

                } catch (error) {
                    console.log("error removing participent", error.message);

                }

                server.to(roomId).emit("room-updated", { userId });
                socket.emit("navigate-room", {});

                socket.leave(roomId);
            }
        } catch (error) {
            console.error("Error in leave-room:", error.message);
        }
    });

    socket.on("need-latest-code", async ({ }) => {
        const userId = socket.user.id;
        const socketDetails = socketHashMap[userId];
        const roomId = socketDetails?.roomId;

        if (!roomId) {
            console.error("Missing roomId for code-change");
            return;
        }

        const room = await Room.findById(roomId);

        if (room.creator.toString() == userId.toString())
            return;

        const userToGetCode = socketHashMap[room.creator]

        socket.to(userToGetCode?.socketId).emit("find-latest-code", { userId });
    });

    socket.on("discc", async () => {
        const userId = socket.user.id;
        const socketDetails = socketHashMap[userId];
        if (!socketDetails) return;

        const { roomId } = socketDetails;

        const room = await Room.findById(roomId);
        if (!room) return;

        const isCreator = room.creator.toString() === userId;

        delete socketHashMap[userId];

        if (isCreator) {
            const timeout = setTimeout(async () => {
                const stillMissing = !Object.values(socketHashMap).some(
                    s => s.roomId === roomId && s.userId === userId
                );

                if (stillMissing) {
                    room.members = [{
                        user: userId,
                        role: "editor"
                    }];
                    await room.save();

                    server.to(roomId).emit("navigate-room", {});
                    console.log("Meeting ended because host did not return");

                    try {
                        await livekitClient.deleteRoom(roomId);

                    } catch (err) {
                        console.error("Room successfuult removed from LiveKit:", err);
                    }

                    const socketsInRoom = await server.in(roomId).fetchSockets();
                    for (const s of socketsInRoom) {
                        s.leave(roomId);
                    }
                }

                delete hostTimeoutMap[userId];
            }, 10000);

            hostTimeoutMap[userId] = timeout;
        }
    });

    socket.on("change-role", async ({ userId }) => {
        try {
            const currentUserId = socket?.user?.id;
            const userDetails = socketHashMap[currentUserId];
            const roomId = userDetails?.roomId;

            if (!roomId) return;

            const room = await Room.findById(roomId);
            if (!room || room.creator.toString() !== currentUserId.toString()) return;

            let changedRole = null;

            room.members = room.members.map((member) => {
                if (member.user.toString() === userId) {
                    const newRole = member.role === "viewer" ? "editor" : "viewer";
                    changedRole = newRole;
                    return { ...member.toObject(), role: newRole };
                }
                return member;
            });

            await room.save();

            const targetSocket = socketHashMap[userId];

            socketHashMap[userId] = { ...targetSocket, role: changedRole }

            if (targetSocket?.socketId) {
                socket.to(targetSocket.socketId).emit("role-changed", {
                    userId,
                    role: changedRole
                });
                socket.to(targetSocket.socketId).emit("role-updated", {
                    role: changedRole
                });
            }

            const creatorSocket = socketHashMap[room.creator];

            server.to(creatorSocket.socketId).emit("role-changed", {
                userId,
                role: changedRole
            });

        } catch (error) {
            console.error("Error changing role:", error);
        }
    });

    socket.on("got-code", async ({ code, userId }) => {


        const userID = socket.user.id;
        const socketDetails = socketHashMap[userID];
        const roomId = socketDetails?.roomId;

        if (!roomId) {
            console.error("Missing roomId for code-change");
            return;
        }

        const room = await Room.findById(roomId);

        if (room.creator.toString() == userID.toString()) {
            const userToSendCode = socketHashMap[userId]
            socket.to(userToSendCode?.socketId).emit("sent-latest-code", { code })
        }

    })

    socket.on("code-change", ({ changes }) => {
        const userId = socket.user.id;
        const details = socketHashMap[userId];
        if (!details?.roomId || details.role !== "editor") return;

        socket.to(details.roomId).emit("incomming-code-change", { changes });
    });

    socket.on("add-node", ({ node }) => {
        const userId = socket.user.id;
        const details = socketHashMap[userId];
        if (!details?.roomId || details.role !== "editor") return;

        socket.to(details.roomId).emit("node-added", { node });
    });

    socket.on("delete-node", ({ nodeId }) => {
        const userId = socket.user.id;
        const details = socketHashMap[userId];
        if (!details?.roomId || details.role !== "editor") return;

        socket.to(details.roomId).emit("node-deleted", { nodeId });
    });

    socket.on("rename-node", ({ nodeId, label }) => {
        const userId = socket.user.id;
        const details = socketHashMap[userId];
        if (!details?.roomId || details.role !== "editor") return;

        socket.to(details.roomId).emit("node-renamed", { nodeId, label });
    });

    socket.on("connect-nodes", ({ edge }) => {
        const userId = socket.user.id;
        const details = socketHashMap[userId];
        if (!details?.roomId || details.role !== "editor") return;

        socket.to(details.roomId).emit("edge-connected", { edge });
    });

    socket.on("delete-edge", ({ edgeId }) => {
        const userId = socket.user.id;
        const details = socketHashMap[userId];
        if (!details?.roomId || details.role !== "editor") return;

        socket.to(details.roomId).emit("edge-deleted", { edgeId });
    });


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
