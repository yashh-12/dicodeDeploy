import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    members: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            role: {
                type: String,
                enum: ["editor", "viewer"],
                default: "viewer",
            },
        },
    ],
}, { timestamps: true });

const Room = mongoose.model("Room", roomSchema);

export default Room;